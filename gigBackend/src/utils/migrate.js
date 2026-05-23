import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.join(backendRoot, 'database', 'migrations');

const migrationTable = 'schema_migrations';

const ensureMigrationTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${migrationTable} (i hav 
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const isDatabaseEmpty = async () => {
  const result = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> $1;
  `, [migrationTable]);

  return result.rows[0].count === 0;
};

const hasFullyMigratedExistingSchema = async () => {
  const requiredTables = [
    'users',
    'categories',
    'posts',
    'comments',
    'donations',
    'newsletter_subscribers',
    'post_views',
    'refresh_tokens',
    'audit_logs',
    'device_fingerprints',
    'user_sessions',
    'session_verification_tokens',
    'session_anomalies',
    'anomaly_email_rate_limit',
    'mfa_sessions',
    'mfa_backup_code_usage',
    'mfa_events',
  ];

  const requiredColumns = [
    ['users', 'verified'],
    ['users', 'mfa_enabled'],
    ['users', 'last_login_at'],
    ['posts', 'featured_image_public_id'],
    ['refresh_tokens', 'device_id'],
  ];

  const tables = await pool.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = ANY($1::text[]);
  `, [requiredTables]);

  if (tables.rowCount !== requiredTables.length) {
    return false;
  }

  const columns = await pool.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (table_name, column_name) IN (
        SELECT *
        FROM unnest($1::text[], $2::text[])
      );
  `, [
    requiredColumns.map(([table]) => table),
    requiredColumns.map(([, column]) => column),
  ]);

  return columns.rowCount === requiredColumns.length;
};

const getAppliedMigrations = async () => {
  const result = await pool.query(`SELECT filename FROM ${migrationTable};`);
  return new Set(result.rows.map((row) => row.filename));
};

const baselineExistingSchema = async (files) => {
  const values = files.map((_, index) => `($${index + 1})`).join(', ');

  if (!values) {
    return;
  }

  await pool.query(`
    INSERT INTO ${migrationTable} (filename)
    VALUES ${values}
    ON CONFLICT (filename) DO NOTHING;
  `, files);
};

const runMigrations = async () => {
  try {
    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    await ensureMigrationTable();

    let appliedMigrations = await getAppliedMigrations();

    if (appliedMigrations.size === 0 && !(await isDatabaseEmpty())) {
      if (await hasFullyMigratedExistingSchema()) {
        await baselineExistingSchema(files);
        appliedMigrations = await getAppliedMigrations();
        console.log('Existing migrated schema detected. Migration history has been baselined.');
      } else {
        throw new Error(
          'Existing partial schema detected without migration history. Review the database before running migrations.'
        );
      }
    }

    for (const file of files) {
      if (appliedMigrations.has(file)) {
        console.log(`Skipping migration: ${file}`);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Running migration: ${file}`);
      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query(
          `INSERT INTO ${migrationTable} (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING;`,
          [file]
        );
        await pool.query('COMMIT');
        console.log(`Migration ${file} completed.`);
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
    }

    console.log('All migrations completed.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runMigrations();
