import { NextResponse } from 'next/server';
import { analyticsEnabled } from '@/lib/analytics-db';
import { canReadAnalytics } from '@/lib/analytics-auth';
import { getAnalyticsReport } from '@/lib/analytics-report';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };

export async function GET(request: Request) {
  if (!canReadAnalytics(request)) return NextResponse.json({ error: 'Bejelentkezés szükséges.' }, { status: 401, headers });
  if (!analyticsEnabled()) return NextResponse.json({ error: 'A látogatottság mérése ebben a környezetben ki van kapcsolva.' }, { status: 503, headers });
  const params = new URL(request.url).searchParams;
  const days = Number(params.get('days') || 30);
  const offset = Number(params.get('offset') || 0);
  if (![1, 7, 30, 90].includes(days) || ![0, 1].includes(offset) || (offset === 1 && days !== 1)) {
    return NextResponse.json({ error: 'Érvénytelen időszak.' }, { status: 400, headers });
  }
  try {
    return NextResponse.json(await getAnalyticsReport(days, offset), { headers });
  } catch {
    console.error('Analytics report unavailable');
    return NextResponse.json({ error: 'A mérés jelenleg nem elérhető. Ez nem nulla látogatót jelent.' }, { status: 503, headers });
  }
}
