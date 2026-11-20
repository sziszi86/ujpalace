import { randomUUID } from 'crypto';
import { analyticsPool } from './analytics-db';
import { deviceType, sourceInfo } from './analytics-policy';

export interface AnalyticsEvent {
  type: 'pageview' | 'heartbeat';
  visitorId: string;
  eventId: string;
  path: string;
  title: string;
  referrer?: unknown;
  campaign?: unknown;
}

export async function recordAnalytics(event: AnalyticsEvent, ua: string, hostname: string) {
  const client = await analyticsPool.connect();
  try {
    await client.query('BEGIN');
    // Lock by visitor across all instances and tabs; session rollover is atomic.
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [event.visitorId]);
    const existing = await client.query('SELECT 1 FROM analytics_v2_pageviews WHERE event_id = $1', [event.eventId]);
    if (event.type === 'pageview' && existing.rowCount) {
      await client.query('COMMIT');
      return 'duplicate';
    }
    // Heartbeats must refer to a pageview accepted for this visitor.
    if (event.type === 'heartbeat') {
      const page = await client.query('SELECT 1 FROM analytics_v2_pageviews WHERE event_id = $1 AND visitor_id = $2', [event.eventId, event.visitorId]);
      if (!page.rowCount) { await client.query('ROLLBACK'); return 'ignored'; }
    }
    await client.query('INSERT INTO analytics_v2_visitors (visitor_id) VALUES ($1) ON CONFLICT DO NOTHING', [event.visitorId]);
    const rate = await client.query(`UPDATE analytics_v2_visitors SET
      rate_count = CASE WHEN rate_started_at < NOW() - INTERVAL '1 minute' THEN 1 ELSE rate_count + 1 END,
      rate_started_at = CASE WHEN rate_started_at < NOW() - INTERVAL '1 minute' THEN NOW() ELSE rate_started_at END
      WHERE visitor_id = $1 AND (rate_count < 120 OR rate_started_at < NOW() - INTERVAL '1 minute') RETURNING visitor_id`, [event.visitorId]);
    if (!rate.rowCount) { await client.query('ROLLBACK'); return 'limited'; }
    const result = await client.query(`SELECT session_id, last_seen >= NOW() - INTERVAL '30 minutes' AS active
      FROM analytics_v2_visitors WHERE visitor_id = $1`, [event.visitorId]);
    let sessionId = result.rows[0].active ? result.rows[0].session_id : null;
    if (!sessionId) {
      // A resumed, long-idle page needs a new pageview to start a new session.
      if (event.type === 'heartbeat') { await client.query('ROLLBACK'); return 'expired'; }
      sessionId = randomUUID();
      const source = sourceInfo(event.referrer, event.campaign, hostname);
      await client.query(`INSERT INTO analytics_v2_sessions (session_id, visitor_id, entry_path, source, medium, campaign, device)
        VALUES ($1,$2,$3,$4,$5,$6,$7)`, [sessionId, event.visitorId, event.path, source.source, source.medium, source.campaign, deviceType(ua)]);
    }
    if (event.type === 'pageview') {
      await client.query(`INSERT INTO analytics_v2_pageviews (event_id, visitor_id, session_id, path, title, device)
        VALUES ($1,$2,$3,$4,$5,$6)`, [event.eventId, event.visitorId, sessionId, event.path, event.title, deviceType(ua)]);
    }
    await client.query('UPDATE analytics_v2_visitors SET session_id = $2, last_seen = NOW() WHERE visitor_id = $1', [event.visitorId, sessionId]);
    await client.query('UPDATE analytics_v2_sessions SET last_seen = NOW() WHERE session_id = $1', [sessionId]);
    await client.query(`UPDATE analytics_v2_meta SET first_event_at = COALESCE(first_event_at, NOW()), last_event_at = NOW() WHERE id = 1`);
    // Daily, transactional retention. Only v2 data is touched. Preserve 90 complete
    // Budapest calendar days plus today, so all selectable periods remain complete.
    await client.query('SAVEPOINT retention');
    try {
      const cleanup = await client.query(`UPDATE analytics_v2_meta SET last_cleanup_at = NOW()
        WHERE id = 1 AND last_cleanup_at < NOW() - INTERVAL '1 day' RETURNING id`);
      if (cleanup.rowCount) {
        await client.query(`DELETE FROM analytics_v2_pageviews WHERE received_at <
          (((NOW() AT TIME ZONE 'Europe/Budapest')::date - 90)::timestamp AT TIME ZONE 'Europe/Budapest')`);
        await client.query(`DELETE FROM analytics_v2_sessions s WHERE last_seen < NOW() - INTERVAL '91 days'
          AND NOT EXISTS (SELECT 1 FROM analytics_v2_pageviews p WHERE p.session_id = s.session_id)`);
        await client.query("DELETE FROM analytics_v2_visitors WHERE last_seen < NOW() - INTERVAL '91 days'");
      }
    } catch {
      // A slow cleanup must not discard an otherwise valid measurement.
      await client.query('ROLLBACK TO SAVEPOINT retention');
      console.error('Analytics retention will be retried');
    }
    await client.query('RELEASE SAVEPOINT retention');
    await client.query('COMMIT');
    return 'accepted';
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally { client.release(); }
}
