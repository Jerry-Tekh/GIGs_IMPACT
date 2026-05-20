import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

let pool;

const isProduction = process.env.NODE_ENV === "production";

if (process.env.DATABASE_URL) {
  // Production (Aiven / Render)
  //using DATABASE_URL with SSL configuration for production environments 
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
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