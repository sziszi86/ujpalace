-- Analytics tables for PostgreSQL (Railway).
-- Run: node scripts/setup-analytics.js.

CREATE TABLE IF NOT EXISTS analytics_page_views (id SERIAL PRIMARY KEY, path VARCHAR(500) NOT NULL, title VARCHAR(500), referrer VARCHAR(500), user_agent TEXT, ip_hash VARCHAR(64), country VARCHAR(100), city VARCHAR(100), device_type VARCHAR(20) DEFAULT 'desktop', browser VARCHAR(100), os VARCHAR(100), screen_width INTEGER, screen_height INTEGER, session_id VARCHAR(100), visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS analytics_daily_stats (id SERIAL PRIMARY KEY, date DATE NOT NULL UNIQUE, total_views INTEGER DEFAULT 0, unique_visitors INTEGER DEFAULT 0, mobile_views INTEGER DEFAULT 0, desktop_views INTEGER DEFAULT 0, tablet_views INTEGER DEFAULT 0, bounce_rate DECIMAL(5,2) DEFAULT 0, avg_time_on_page INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS analytics_top_pages (id SERIAL PRIMARY KEY, path VARCHAR(500) NOT NULL, title VARCHAR(500), date DATE NOT NULL, views INTEGER DEFAULT 0, unique_visitors INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(path, date));

CREATE TABLE IF NOT EXISTS analytics_referrers (id SERIAL PRIMARY KEY, referrer_domain VARCHAR(200) NOT NULL, referrer_url VARCHAR(500), date DATE NOT NULL, views INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(referrer_domain, date));

CREATE TABLE IF NOT EXISTS analytics_sessions (id SERIAL PRIMARY KEY, session_id VARCHAR(100) NOT NULL UNIQUE, ip_hash VARCHAR(64), user_agent TEXT, first_page VARCHAR(500), last_page VARCHAR(500), page_views INTEGER DEFAULT 1, started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, ended_at TIMESTAMP, duration INTEGER DEFAULT 0, device_type VARCHAR(20) DEFAULT 'desktop', country VARCHAR(100), city VARCHAR(100));

CREATE INDEX IF NOT EXISTS idx_analytics_path ON analytics_page_views(path);

CREATE INDEX IF NOT EXISTS idx_analytics_visited_at ON analytics_page_views(visited_at);

CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_device_type ON analytics_page_views(device_type);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily_stats(date);

CREATE INDEX IF NOT EXISTS idx_analytics_top_date ON analytics_top_pages(date);

CREATE INDEX IF NOT EXISTS idx_analytics_top_views ON analytics_top_pages(views);

CREATE INDEX IF NOT EXISTS idx_analytics_referrers_date ON analytics_referrers(date);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_id ON analytics_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started ON analytics_sessions(started_at);
