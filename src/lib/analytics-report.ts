import { analyticsPool } from './analytics-db';
import { sourceCategory } from './analytics-policy';

// Budapest calendar boundaries, including 23/25-hour DST days. End is exclusive.
export const REPORT_WINDOW = `WITH bounds AS (
  SELECT (((NOW() AT TIME ZONE 'Europe/Budapest')::date - ($1::int - 1) - $2::int)::timestamp AT TIME ZONE 'Europe/Budapest') AS start_at,
    (((NOW() AT TIME ZONE 'Europe/Budapest')::date + 1 - $2::int)::timestamp AT TIME ZONE 'Europe/Budapest') AS end_at
), views AS (
  SELECT p.* FROM analytics_v2_pageviews p, bounds b WHERE received_at >= b.start_at AND received_at < b.end_at
)`;

export async function getAnalyticsReport(days: number, offset = 0) {
  const client = await analyticsPool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const params = [days, offset];
    const totals = await client.query(`${REPORT_WINDOW} SELECT COUNT(*)::int AS views,
      COUNT(DISTINCT visitor_id)::int AS visitors, COUNT(DISTINCT session_id)::int AS sessions,
      COUNT(*) FILTER (WHERE device = 'mobile')::int AS mobile,
      COUNT(*) FILTER (WHERE device = 'desktop')::int AS desktop,
      COUNT(*) FILTER (WHERE device = 'tablet')::int AS tablet FROM views`, params);
    const daily = await client.query(`${REPORT_WINDOW}, dates AS (
      SELECT generate_series((start_at AT TIME ZONE 'Europe/Budapest')::date,
        (end_at AT TIME ZONE 'Europe/Budapest')::date - 1, INTERVAL '1 day')::date AS day FROM bounds
    ) SELECT to_char(d.day, 'YYYY-MM-DD') AS date,
      (d.day >= (m.first_event_at AT TIME ZONE 'Europe/Budapest')::date) AS measured,
      COUNT(v.event_id)::int AS total_views, COUNT(DISTINCT v.visitor_id)::int AS unique_visitors
      FROM dates d CROSS JOIN analytics_v2_meta m LEFT JOIN views v ON (v.received_at AT TIME ZONE 'Europe/Budapest')::date = d.day
      GROUP BY d.day, m.first_event_at ORDER BY d.day`, params);
    const pages = await client.query(`${REPORT_WINDOW} SELECT path,
      (array_agg(title ORDER BY received_at DESC))[1] AS title,
      COUNT(*)::int AS total_views, COUNT(DISTINCT visitor_id)::int AS unique_visitors
      FROM views GROUP BY path ORDER BY total_views DESC, path LIMIT 20`, params);
    const tournaments = await client.query(`${REPORT_WINDOW} SELECT path,
      (array_agg(title ORDER BY received_at DESC))[1] AS title,
      COUNT(*)::int AS total_views, COUNT(DISTINCT visitor_id)::int AS unique_visitors
      FROM views WHERE path ~ '^/tournaments/[0-9]+$' GROUP BY path ORDER BY total_views DESC, path LIMIT 10`, params);
    const referrers = await client.query(`${REPORT_WINDOW} SELECT s.source AS referrer_domain,
      COUNT(*)::int AS sessions FROM analytics_v2_sessions s
      WHERE s.session_id IN (SELECT session_id FROM views) GROUP BY s.source ORDER BY sessions DESC, s.source`, params);
    const campaigns = await client.query(`${REPORT_WINDOW} SELECT s.source, s.medium, s.campaign,
      COUNT(*)::int AS sessions FROM analytics_v2_sessions s
      WHERE s.campaign IS NOT NULL AND s.session_id IN (SELECT session_id FROM views)
      GROUP BY s.source, s.medium, s.campaign ORDER BY sessions DESC LIMIT 20`, params);
    const week = await client.query(`${REPORT_WINDOW} SELECT COUNT(*)::int AS views,
      COUNT(DISTINCT visitor_id)::int AS visitors FROM views`, [7, 0]);
    const online = await client.query(`SELECT COUNT(*)::int AS count FROM analytics_v2_visitors
      WHERE session_id IS NOT NULL AND last_seen >= NOW() - INTERVAL '5 minutes'`);
    const meta = await client.query('SELECT installed_at, first_event_at, last_event_at, NOW() AS checked_at FROM analytics_v2_meta WHERE id = 1');
    if (!meta.rows.length) throw new Error('Analytics migration missing');
    await client.query('COMMIT');
    const total = totals.rows[0];
    const categories = { social: 0, search: 0, direct: 0, other: 0 };
    for (const row of referrers.rows) categories[sourceCategory(row.referrer_domain)] += row.sessions;
    return {
      summary: { totalViews: total.views, totalVisitors: total.visitors, totalSessions: total.sessions },
      currentOnline: online.rows[0].count,
      lastWeek: { totalViews: week.rows[0].views, totalVisitors: week.rows[0].visitors },
      deviceBreakdown: { mobile: total.mobile, desktop: total.desktop, tablet: total.tablet },
      dailyStats: daily.rows.map(row => row.measured ? row : { ...row, total_views: null, unique_visitors: null }),
      topPages: pages.rows, topTournaments: tournaments.rows,
      referrers: referrers.rows.slice(0, 20), referrerCategories: categories, campaigns: campaigns.rows,
      measurement: { version: 2, timezone: 'Europe/Budapest', ...meta.rows[0] },
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally { client.release(); }
}
