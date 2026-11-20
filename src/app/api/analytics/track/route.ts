import { NextRequest, NextResponse } from 'next/server';
import { analyticsEnabled } from '@/lib/analytics-db';
import { BOT_PATTERN, cleanText, publicPath, UUID_PATTERN } from '@/lib/analytics-policy';
import { recordAnalytics } from '@/lib/analytics-store';

export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  if (!analyticsEnabled()) return new NextResponse(null, { status: 204, headers });
  const origin = request.headers.get('origin');
  const hosts = (process.env.ANALYTICS_ALLOWED_HOSTS || 'palace-poker.hu,www.palace-poker.hu,palacepoker.hu,www.palacepoker.hu').split(',').map(h => h.trim());
  let hostname: string;
  try {
    const url = new URL(origin || '');
    hostname = url.hostname;
    if (process.env.ANALYTICS_ALLOW_LOCAL !== 'true' && (!hosts.includes(hostname) || url.protocol !== 'https:')) throw new Error('origin');
    if (request.headers.get('sec-fetch-site') === 'cross-site') throw new Error('origin');
  } catch { return NextResponse.json({ error: 'Invalid origin' }, { status: 403, headers }); }
  const ua = request.headers.get('user-agent') || '';
  if (!ua || BOT_PATTERN.test(ua) || /prefetch|prerender/i.test(request.headers.get('purpose') || request.headers.get('sec-purpose') || '')) {
    return new NextResponse(null, { status: 204, headers });
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) return new NextResponse(null, { status: 415, headers });
  try {
    // Bound requests without trusting Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return new NextResponse(null, { status: 400, headers });
    let text = '';
    let bytes = 0;
    const decoder = new TextDecoder();
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 8192) { await reader.cancel(); return new NextResponse(null, { status: 413, headers }); }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
    let body;
    try { body = JSON.parse(text); } catch { return new NextResponse(null, { status: 400, headers }); }
    if (!body || body.consent !== true) return new NextResponse(null, { status: 204, headers });
    const path = publicPath(body.path);
    if (!path || !['pageview', 'heartbeat'].includes(body.type) ||
      typeof body.visitorId !== 'string' || !UUID_PATTERN.test(body.visitorId) ||
      typeof body.eventId !== 'string' || !UUID_PATTERN.test(body.eventId)) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400, headers });
    }
    const result = await recordAnalytics({ ...body, path, title: cleanText(body.title, 300) || path }, ua, hostname);
    return NextResponse.json({ status: result }, { status: result === 'limited' ? 429 : 200, headers });
  } catch {
    console.error('Analytics event could not be stored');
    return NextResponse.json({ error: 'Measurement unavailable' }, { status: 503, headers });
  }
}
