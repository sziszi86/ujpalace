// Compatibility endpoint: all counts now come from the same v2 source.
import { NextResponse } from 'next/server';
import { canReadAnalytics } from '@/lib/analytics-auth';
import { analyticsEnabled, onlineVisitors } from '@/lib/analytics-db';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };
export async function GET(request: Request) {
  if (!canReadAnalytics(request)) return new NextResponse(null, { status: 401, headers });
  try {
    if (!analyticsEnabled()) throw new Error('disabled');
    return NextResponse.json({ currentVisitors: await onlineVisitors() }, { headers });
  } catch { return NextResponse.json({ currentVisitors: null, error: 'Measurement unavailable' }, { status: 503, headers }); }
}
// Old open tabs must not continue populating the unreliable legacy tables.
export async function POST() { return new NextResponse(null, { status: 204, headers }); }
export async function PUT() { return new NextResponse(null, { status: 204, headers }); }
