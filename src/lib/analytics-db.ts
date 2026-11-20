import { Pool } from 'pg';

// Small, isolated pool: analytics must never exhaust the site's business pool.
const connectionString = process.env.ANALYTICS_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
export const analyticsPool = new Pool({
  connectionString,
  ssl: process.env.ANALYTICS_DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  max: 3,
  connectionTimeoutMillis: 1500,
  idleTimeoutMillis: 10000,
  statement_timeout: 3000,
  application_name: 'palace-analytics-v2',
});
analyticsPool.on('error', () => console.error('Analytics database connection unavailable'));

export function analyticsEnabled() {
  return Boolean(connectionString) && process.env.ANALYTICS_DISABLED !== 'true' &&
    (process.env.ANALYTICS_ALLOW_LOCAL === 'true' ||
      (process.env.NODE_ENV === 'production' && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production')));
}

export async function onlineVisitors() {
  const result = await analyticsPool.query(`SELECT COUNT(*)::int AS count FROM analytics_v2_visitors
    WHERE session_id IS NOT NULL AND last_seen >= NOW() - INTERVAL '5 minutes'`);
  return result.rows[0].count as number;
}
