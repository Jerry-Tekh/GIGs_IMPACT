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

export default pool;
