const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const Module = require('node:module');
const ts = require('typescript');

// Load actual application TypeScript, not copies of the counting implementation.
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(this, name.startsWith('@/') ? path.join(__dirname, '../src', name.slice(2)) : name, ...args);
};
Module._extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename);

let directory, running = false, pool, record, report, track, reportRoute, legacy, NextRequest;
const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15';
const migration = fs.readFileSync(path.join(__dirname, '../src/lib/analytics-v2-migration.sql'), 'utf8');
const event = (visitorId = randomUUID(), overrides = {}) => ({ type: 'pageview', visitorId, eventId: randomUUID(), path: '/', title: 'Főoldal', ...overrides });
const send = payload => record(payload, ua, 'palace-poker.hu');
const auth = () => ({ authorization: 'Bearer ' + require('jsonwebtoken').sign({ role: 'admin' }, process.env.JWT_SECRET) });
function request(body, headers = {}) {
  return new NextRequest('https://palace-poker.hu/api/analytics/track', { method: 'POST', headers: {
    'content-type': 'application/json', origin: 'https://palace-poker.hu', 'user-agent': ua, ...headers,
  }, body: typeof body === 'string' ? body : JSON.stringify({ consent: true, ...body }) });
}

before(async () => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-analytics-test-'));
  const port = 20000 + Math.floor(Math.random() * 20000);
  execFileSync('initdb', ['-D', path.join(directory, 'data'), '-A', 'trust', '--no-locale', '-E', 'UTF8'], { stdio: 'pipe' });
  execFileSync('pg_ctl', ['-D', path.join(directory, 'data'), '-l', path.join(directory, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port} -k ${directory} -F`, '-w', 'start'], { stdio: 'pipe' });
  running = true;
  // Always use this fresh local cluster. Never read .env or a production URL.
  process.env.ANALYTICS_DATABASE_URL = `postgresql://${os.userInfo().username}@127.0.0.1:${port}/postgres`;
  process.env.ANALYTICS_DB_SSL = 'false';
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = 'isolated-test-secret';
  delete process.env.ANALYTICS_DISABLED;
  delete process.env.ANALYTICS_ALLOW_LOCAL;
  delete process.env.VERCEL_ENV;
  pool = require('../src/lib/analytics-db.ts').analyticsPool;
  record = require('../src/lib/analytics-store.ts').recordAnalytics;
  report = require('../src/lib/analytics-report.ts').getAnalyticsReport;
  track = require('../src/app/api/analytics/track/route.ts').POST;
  reportRoute = require('../src/app/api/analytics/route.ts').GET;
  legacy = require('../src/app/api/visitors/route.ts');
  NextRequest = require('next/server').NextRequest;
  await pool.query('CREATE TABLE analytics_daily_stats (total_views int); INSERT INTO analytics_daily_stats VALUES (12345)');
  await pool.query(migration);
});
beforeEach(async () => {
  await pool.query('TRUNCATE analytics_v2_pageviews, analytics_v2_sessions, analytics_v2_visitors');
  await pool.query('UPDATE analytics_v2_meta SET first_event_at = NULL, last_event_at = NULL, last_cleanup_at = NOW()');
});
after(async () => {
  if (pool) await pool.end();
  if (running) execFileSync('pg_ctl', ['-D', path.join(directory, 'data'), '-m', 'immediate', '-w', 'stop'], { stdio: 'pipe' });
  if (directory) fs.rmSync(directory, { recursive: true, force: true });
});

test('migration is repeatable and preserves legacy numbers', async () => {
  await pool.query(migration);
  assert.equal((await pool.query('SELECT total_views FROM analytics_daily_stats')).rows[0].total_views, 12345);
});
test('five reloads are five views, one visitor and one session', async () => {
  const visitor = randomUUID();
  for (let i = 0; i < 5; i++) await send(event(visitor));
  const data = await report(7);
  assert.deepEqual(data.summary, { totalViews: 5, totalVisitors: 1, totalSessions: 1 });
  assert.equal(data.currentOnline, 1);
  assert.equal(data.topPages[0].unique_visitors, 1);
  assert.equal(data.referrers[0].sessions, 1);
});
test('parallel tabs and retried delivery cannot duplicate sessions or events', async () => {
  const first = event();
  await Promise.all(Array.from({ length: 6 }, () => send(first)));
  await Promise.all(Array.from({ length: 6 }, () => send(event(first.visitorId))));
  assert.deepEqual((await report(7)).summary, { totalViews: 7, totalVisitors: 1, totalSessions: 1 });
});
test('different browsers on a shared network remain distinct', async () => {
  await Promise.all([send(event()), send(event())]);
  assert.equal((await report(1)).summary.totalVisitors, 2);
});
test('heartbeat updates presence without adding pageviews, rejects unknown pages', async () => {
  const first = event(); await send(first);
  await pool.query("UPDATE analytics_v2_visitors SET last_seen = NOW() - INTERVAL '6 minutes'");
  assert.equal((await report(1)).currentOnline, 0);
  assert.equal(await send({ ...first, type: 'heartbeat' }), 'accepted');
  assert.equal(await send(event(randomUUID(), { type: 'heartbeat' })), 'ignored');
  assert.equal((await report(1)).summary.totalViews, 1);
  assert.equal((await report(1)).currentOnline, 1);
});
test('30-minute inactivity starts another session, not another visitor', async () => {
  const first = event(); await send(first);
  await pool.query("UPDATE analytics_v2_visitors SET last_seen = NOW() - INTERVAL '31 minutes'");
  assert.equal(await send({ ...first, type: 'heartbeat' }), 'expired');
  await send(event(first.visitorId));
  assert.deepEqual((await report(1)).summary, { totalViews: 2, totalVisitors: 1, totalSessions: 2 });
});
test('weekly uniques are deduplicated across days; date window has exactly 7 days', async () => {
  const first = event(); await send(first);
  await pool.query("UPDATE analytics_v2_pageviews SET received_at = ((NOW() AT TIME ZONE 'Europe/Budapest')::date - 1 + TIME '12:00') AT TIME ZONE 'Europe/Budapest'");
  await pool.query("UPDATE analytics_v2_meta SET first_event_at = NOW() - INTERVAL '1 day'");
  await send(event(first.visitorId));
  const data = await report(7);
  assert.equal(data.dailyStats.length, 7);
  assert.equal(data.summary.totalVisitors, 1);
  assert.equal(data.dailyStats.reduce((sum, day) => sum + (day.unique_visitors || 0), 0), 2);
  assert.equal((await report(1, 1)).summary.totalViews, 1);
});
test('timezone boundary excludes an event just before the selected period', async () => {
  const first = event(); await send(first);
  await pool.query("UPDATE analytics_v2_pageviews SET received_at = (((NOW() AT TIME ZONE 'Europe/Budapest')::date - 6)::timestamp AT TIME ZONE 'Europe/Budapest') - INTERVAL '1 microsecond'");
  assert.equal((await report(7)).summary.totalViews, 0);
  const boundaries = await pool.query(`SELECT
    EXTRACT(EPOCH FROM (TIMESTAMP '2026-03-30' AT TIME ZONE 'Europe/Budapest') - (TIMESTAMP '2026-03-29' AT TIME ZONE 'Europe/Budapest')) / 3600 AS spring,
    EXTRACT(EPOCH FROM (TIMESTAMP '2026-10-26' AT TIME ZONE 'Europe/Budapest') - (TIMESTAMP '2026-10-25' AT TIME ZONE 'Europe/Budapest')) / 3600 AS autumn`);
  assert.equal(Number(boundaries.rows[0].spring), 23);
  assert.equal(Number(boundaries.rows[0].autumn), 25);
});
test('source and campaign are attached at entry, full referrer query is not stored', async () => {
  const first = event(randomUUID(), { referrer: 'https://www.google.hu/search?q=private', campaign: { source: 'facebook', medium: 'paid', name: 'november' } });
  await send(first);
  await send(event(first.visitorId, { referrer: 'https://example.com/private?email=a', campaign: { source: 'other' } }));
  const data = await report(7);
  assert.deepEqual(data.referrers, [{ referrer_domain: 'facebook', sessions: 1 }]);
  assert.equal(data.campaigns[0].campaign, 'november');
  assert.equal(data.referrerCategories.social, 1);
});
test('title changes do not split the same page and top tournaments exclude list pages', async () => {
  const visitor = randomUUID();
  await send(event(visitor, { path: '/tournaments/42', title: 'Old title' }));
  await send(event(visitor, { path: '/tournaments/42', title: 'New title' }));
  await send(event(visitor, { path: '/tournaments/list' }));
  const data = await report(7);
  assert.equal(data.topTournaments.length, 1);
  assert.equal(data.topTournaments[0].total_views, 2);
  assert.equal(data.topTournaments[0].title, 'New title');
});
test('pre-measurement days are missing data, not fabricated zero days', async () => {
  assert.equal((await report(7)).dailyStats.every(day => day.total_views === null), true);
  await send(event());
  const data = await report(7);
  assert.equal(data.dailyStats[0].total_views, null);
  assert.equal(data.dailyStats[6].total_views, 1);
});
test('retention removes only expired v2 data and preserves the measurement start', async () => {
  await send(event());
  await pool.query("UPDATE analytics_v2_pageviews SET received_at = NOW() - INTERVAL '100 days'; UPDATE analytics_v2_sessions SET last_seen = NOW() - INTERVAL '100 days'; UPDATE analytics_v2_visitors SET last_seen = NOW() - INTERVAL '100 days'; UPDATE analytics_v2_meta SET first_event_at = NOW() - INTERVAL '100 days', last_cleanup_at = NOW() - INTERVAL '2 days'");
  await send(event());
  assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM analytics_v2_pageviews')).rows[0].count, 1);
  assert.equal((await pool.query('SELECT total_views FROM analytics_daily_stats')).rows[0].total_views, 12345);
  assert.ok(new Date((await report(7)).measurement.first_event_at) < new Date(Date.now() - 99 * 86400000));
});
test('tracking endpoint handles referral traffic and validates all inputs', async () => {
  assert.equal((await track(request(event(randomUUID(), { referrer: 'https://www.google.hu/' })))).status, 200);
  assert.equal((await track(request('{broken'))).status, 400);
  assert.equal((await track(request(event(), { origin: 'https://evil.example' }))).status, 403);
  assert.equal((await track(request(event(randomUUID(), { path: '/admin' })))).status, 400);
  assert.equal((await track(request(event(randomUUID(), { visitorId: 'invalid' })))).status, 400);
  assert.equal((await track(request({ ...event(), consent: false }))).status, 204);
  assert.equal((await track(request(event(), { 'user-agent': 'Googlebot' }))).status, 204);
  assert.equal((await track(request(event(), { purpose: 'prefetch' }))).status, 204);
  assert.equal((await track(request('x'.repeat(8193)))).status, 413);
  assert.equal((await report(1)).summary.totalViews, 1);
});
test('rate limiting bounds a single visitor without counting rejected events', async () => {
  const first = event(); await send(first);
  await pool.query('UPDATE analytics_v2_visitors SET rate_count = 120');
  assert.equal((await track(request(event(first.visitorId)))).status, 429);
  assert.equal((await report(1)).summary.totalViews, 1);
});
test('report requires admin authentication and validates the period', async () => {
  assert.equal((await reportRoute(new Request('https://palace-poker.hu/api/analytics'))).status, 401);
  assert.equal((await reportRoute(new Request('https://palace-poker.hu/api/analytics?days=-1', { headers: auth() }))).status, 400);
  const response = await reportRoute(new Request('https://palace-poker.hu/api/analytics?days=7', { headers: auth() }));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.equal(typeof (await response.json()).summary.totalViews, 'number');
});
test('disabled measurement returns unavailable instead of zero; legacy writes are inert', async () => {
  process.env.ANALYTICS_DISABLED = 'true';
  try {
    assert.equal((await track(request(event()))).status, 204);
    assert.equal((await reportRoute(new Request('https://palace-poker.hu/api/analytics', { headers: auth() }))).status, 503);
    const response = await legacy.GET(new Request('https://palace-poker.hu/api/visitors', { headers: auth() }));
    assert.equal(response.status, 503); assert.equal((await response.json()).currentVisitors, null);
  } finally { delete process.env.ANALYTICS_DISABLED; }
  assert.equal((await legacy.POST()).status, 204);
  assert.equal((await legacy.PUT()).status, 204);
  assert.equal((await report(1)).summary.totalViews, 0);
});
test('schema failure produces 503 rather than a successful empty report', async () => {
  await pool.query('ALTER TABLE analytics_v2_pageviews RENAME TO analytics_v2_pageviews_unavailable');
  try {
    assert.equal((await track(request(event()))).status, 503);
    assert.equal((await reportRoute(new Request('https://palace-poker.hu/api/analytics', { headers: auth() }))).status, 503);
  } finally { await pool.query('ALTER TABLE analytics_v2_pageviews_unavailable RENAME TO analytics_v2_pageviews'); }
});
test('policy strips URL queries, rejects private routes and matches source domains exactly', () => {
  const policy = require('../src/lib/analytics-policy.ts');
  assert.equal(policy.publicPath('/tournaments/42?email=private#secret'), '/tournaments/42');
  assert.equal(policy.publicPath('/%61dmin'), null);
  assert.equal(policy.publicPath('//evil.com'), null);
  assert.equal(policy.sourceCategory('evilfacebook.com'), 'other');
  assert.equal(policy.sourceCategory('l.facebook.com'), 'social');
  assert.equal(policy.sourceInfo('https://www.palace-poker.hu/about', {}, 'palace-poker.hu').source, 'direct');
});
test('browser consent, admin exclusion, shared identity, expiry and storage failures', async () => {
  const storage = new Map();
  global.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  global.window = new EventTarget();
  Object.defineProperty(global, 'navigator', { configurable: true, value: { locks: { request: (_key, fn) => fn() } } });
  const browser = require('../src/lib/analytics-client.ts');
  assert.equal(browser.mayTrack(), false);
  browser.saveAnalyticsConsent('accepted');
  assert.equal(browser.mayTrack(), true);
  const first = await browser.visitorId(); assert.equal(await browser.visitorId(), first);
  localStorage.setItem('authToken', 'admin-token'); assert.equal(browser.mayTrack(), false); localStorage.removeItem('authToken');
  const saved = JSON.parse(localStorage.getItem('palace-analytics-visitor-v2')); saved.expiresAt = 0;
  localStorage.setItem('palace-analytics-visitor-v2', JSON.stringify(saved));
  assert.notEqual(await browser.visitorId(), first);
  browser.saveAnalyticsConsent('declined'); assert.equal(browser.mayTrack(), false);
  assert.equal(localStorage.getItem('palace-analytics-visitor-v2'), null);
  localStorage.getItem = () => { throw new Error('Blocked'); };
  assert.equal(browser.mayTrack(), false);
  assert.doesNotThrow(() => browser.saveAnalyticsConsent('declined'));
});

test('retention failure does not roll back an accepted pageview', async () => {
  await pool.query("UPDATE analytics_v2_meta SET last_cleanup_at = NOW() - INTERVAL '2 days'");
  await pool.query(`CREATE FUNCTION analytics_test_cleanup_failure() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'test cleanup failure'; END $$ LANGUAGE plpgsql;
    CREATE TRIGGER test_cleanup_failure BEFORE DELETE ON analytics_v2_pageviews FOR EACH STATEMENT EXECUTE FUNCTION analytics_test_cleanup_failure()`);
  try {
    assert.equal(await send(event()), 'accepted');
    assert.equal((await report(1)).summary.totalViews, 1);
  } finally {
    await pool.query('DROP TRIGGER test_cleanup_failure ON analytics_v2_pageviews; DROP FUNCTION analytics_test_cleanup_failure()');
  }
});

test('real tracker effect: hidden pages, consent, heartbeats, retries and Strict Mode', async () => {
  const storage = new Map();
  global.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  global.window = Object.assign(new EventTarget(), { location: { search: '?utm_source=google' } });
  global.document = Object.assign(new EventTarget(), { visibilityState: 'hidden', title: 'Főoldal', referrer: 'https://google.hu/' });
  const browser = require('../src/lib/analytics-client.ts');
  browser.saveAnalyticsConsent('accepted');
  const originalFetch = global.fetch, originalInterval = global.setInterval, originalClear = global.clearInterval;
  const intervals = new Map(); let sequence = 0; const calls = []; let failOnce = false;
  global.setInterval = fn => { intervals.set(++sequence, fn); return sequence; };
  global.clearInterval = id => intervals.delete(id);
  global.fetch = async (_url, options) => { calls.push(JSON.parse(options.body)); if (failOnce) { failOnce = false; throw new Error('network'); } return { ok: true, status: 200, json: async () => ({ status: 'accepted' }) }; };
  let effect;
  const filename = path.join(__dirname, '../src/components/AnalyticsTracker.tsx');
  const component = new Module(filename, module); component.filename = filename; component.paths = module.paths;
  const normalRequire = component.require.bind(component);
  component.require = name => name === 'react' ? { useEffect: fn => { effect = fn; } } : name === 'next/navigation' ? { usePathname: () => '/' } : normalRequire(name);
  component._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, filename);
  const settle = () => new Promise(resolve => setTimeout(resolve, 15));
  let cleanup;
  try {
    component.exports.default(); cleanup = effect(); await settle(); assert.equal(calls.length, 0);
    document.visibilityState = 'visible'; document.dispatchEvent(new Event('visibilitychange')); await settle();
    assert.equal(calls.length, 1); assert.equal(calls[0].type, 'pageview');
    for (const tick of intervals.values()) await tick();
    assert.equal(calls[1].type, 'heartbeat'); assert.equal(calls[0].eventId, calls[1].eventId);
    document.visibilityState = 'hidden'; for (const tick of intervals.values()) await tick(); assert.equal(calls.length, 2);
    browser.saveAnalyticsConsent('declined'); document.visibilityState = 'visible';
    for (const tick of intervals.values()) await tick(); assert.equal(calls.length, 2);
    cleanup();
    browser.saveAnalyticsConsent('accepted'); failOnce = true;
    cleanup = effect(); cleanup(); // discarded Strict Mode mount must send nothing
    cleanup = effect(); await settle(); assert.equal(calls.length, 3);
    for (const tick of intervals.values()) await tick();
    assert.equal(calls.length, 4); assert.equal(calls[2].eventId, calls[3].eventId);
    assert.equal(calls[2].type, 'pageview'); assert.equal(calls[3].type, 'pageview');
  } finally {
    cleanup?.(); global.fetch = originalFetch; global.setInterval = originalInterval; global.clearInterval = originalClear;
  }
});
