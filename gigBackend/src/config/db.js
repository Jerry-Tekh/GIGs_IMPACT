import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..", "..");

dotenv.config({ path: path.join(backendRoot, ".env") });

const { Pool } = pg;

let pool;

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL;

const getSslConfig = () => {
  const sslMode = (process.env.DB_SSL || process.env.PGSSLMODE || "").toLowerCase();

  if (["false", "disable", "disabled", "0"].includes(sslMode)) {
    return false;
  }

  if (["true", "require", "required", "no-verify"].includes(sslMode)) {
    return { rejectUnauthorized: false };
  }

  if (["verify-ca", "verify-full"].includes(sslMode)) {
    return { rejectUnauthorized: true };
  }

  if (databaseUrl?.includes("aivencloud.com")) {
    // Aiven uses certificates that in some environments require skipping
    // strict verification (keep existing behavior).
    return { rejectUnauthorized: false };
  }

  // Neon (neon.tech) provides valid TLS certs — enable verification.
  if (databaseUrl?.includes("neon.tech")) {
    return { rejectUnauthorized: true };
  }

  return isProduction ? { rejectUnauthorized: false } : false;
};

if (databaseUrl) {
  // Production (Aiven / Render)
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: getSslConfig(),
  });
} else {
  //  Local development
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

// Lightweight retry helper tuned for serverless cold-starts (Neon)
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function queryWithRetry(text, params, options = {}) {
  const retries = Number(options.retries ?? 5);
  const minDelay = Number(options.minDelay ?? 1000);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      const msg = String(err && (err.message || err.code || "")).toLowerCase();

      // Common transient messages for cold starts / transient network errors
      const transient = /starting up|server is starting|connection refused|econnreset|econnrefused|closed the connection|tls handshake|57p03|57p01|57p02/.test(msg);

      if (!transient || attempt === retries - 1) {
        // Not a transient/cold-start error or out of retries: rethrow
        throw err;
      }

      // Exponential backoff with small jitter
      const delay = Math.min(minDelay * Math.pow(2, attempt), 5000) + Math.floor(Math.random() * 250);
      await sleep(delay);
    }
  }
}

export default pool;
