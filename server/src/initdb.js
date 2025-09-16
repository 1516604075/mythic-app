import fs from 'fs';
import path from 'path';
import { pool } from './db.js';

async function ensureExtension() {
  // Enable pgcrypto for gen_random_uuid if available
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  } catch (e) {
    console.warn('pgcrypto extension not created (maybe lacking privileges):', e.message);
  }
}

async function run() {
  const sql = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'schema.sql')).toString();
  await ensureExtension();
  await pool.query(sql);
  console.log('Database initialized.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
