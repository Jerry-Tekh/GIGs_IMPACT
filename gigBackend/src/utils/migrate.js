import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
  try {
    const migrationsDir = path.join(process.cwd(), 'database', 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`Running migration: ${file}`);
        await pool.query(sql);
        console.log(`Migration ${file} completed.`);
      }
    }

    console.log('All migrations completed.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    pool.end();
  }
};

runMigrations();