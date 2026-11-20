#!/usr/bin/env node
// Additive migration, separate from the legacy setup/reset commands.
const { Client } = require('pg');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const connectionString = process.env.ANALYTICS_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Analytics database is not configured.');
  const client = new Client({ connectionString,
    ssl: process.env.ANALYTICS_DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000, statement_timeout: 15000,
  });
  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '3s'");
    await client.query(fs.readFileSync(path.join(__dirname, '../src/lib/analytics-v2-migration.sql'), 'utf8'));
    await client.query('SELECT id FROM analytics_v2_meta WHERE id = 1');
    await client.query('COMMIT');
    console.log('Analytics v2 ready. Legacy analytics and business data were preserved.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally { await client.end(); }
}
main().catch(error => { console.error('Analytics migration failed:', error.code || error.message); process.exitCode = 1; });
