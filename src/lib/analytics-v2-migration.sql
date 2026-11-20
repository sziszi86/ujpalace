-- Additive migration: legacy analytics and business tables remain untouched.
CREATE TABLE IF NOT EXISTS analytics_v2_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_event_at TIMESTAMPTZ,
  last_event_at TIMESTAMPTZ,
  last_cleanup_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO analytics_v2_meta (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS analytics_v2_visitors (
  visitor_id UUID PRIMARY KEY,
  session_id UUID,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rate_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rate_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS analytics_v2_visitors_seen ON analytics_v2_visitors(last_seen);

CREATE TABLE IF NOT EXISTS analytics_v2_sessions (
  session_id UUID PRIMARY KEY,
  visitor_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  entry_path VARCHAR(500) NOT NULL,
  source VARCHAR(200) NOT NULL,
  medium VARCHAR(100),
  campaign VARCHAR(150),
  device VARCHAR(10) NOT NULL CHECK (device IN ('desktop', 'mobile', 'tablet'))
);
CREATE INDEX IF NOT EXISTS analytics_v2_sessions_started ON analytics_v2_sessions(started_at);

CREATE TABLE IF NOT EXISTS analytics_v2_pageviews (
  event_id UUID PRIMARY KEY,
  visitor_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES analytics_v2_sessions(session_id),
  path VARCHAR(500) NOT NULL,
  title VARCHAR(300) NOT NULL,
  device VARCHAR(10) NOT NULL CHECK (device IN ('desktop', 'mobile', 'tablet')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS analytics_v2_pageviews_received ON analytics_v2_pageviews(received_at);
CREATE INDEX IF NOT EXISTS analytics_v2_pageviews_visitor ON analytics_v2_pageviews(visitor_id, received_at);
CREATE INDEX IF NOT EXISTS analytics_v2_pageviews_session ON analytics_v2_pageviews(session_id);
