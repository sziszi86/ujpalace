'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ANALYTICS_CONSENT_EVENT, mayTrack, visitorId } from '@/lib/analytics-client';
import { publicPath } from '@/lib/analytics-policy';

let documentEntryRecorded = false;

export default function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!publicPath(pathname) || typeof crypto.randomUUID !== 'function') return;
    let stopped = false;
    let busy = false;
    let accepted = false;
    let attempts = 0;
    let eventId = crypto.randomUUID();
    let abort: AbortController | undefined;
    const params = new URLSearchParams(window.location.search);
    const campaign = { source: params.get('utm_source'), medium: params.get('utm_medium'), name: params.get('utm_campaign') };
    const referrer = document.referrer;

    const send = async () => {
      if (stopped || busy || document.visibilityState !== 'visible' || !mayTrack()) return;
      if (!accepted && attempts >= 3) return;
      busy = true;
      const controller = new AbortController();
      abort = controller;
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        const id = await visitorId();
        if (stopped || !mayTrack()) return;
        if (!accepted) attempts++;
        const response = await fetch('/api/analytics/track', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin', signal: controller.signal, keepalive: true,
          body: JSON.stringify({ consent: true, type: accepted ? 'heartbeat' : 'pageview',
            visitorId: id, eventId, path: pathname, title: document.title,
            referrer: documentEntryRecorded ? null : referrer,
            campaign: documentEntryRecorded ? null : campaign }),
        });
        if (stopped || controller.signal.aborted || !mayTrack()) return;
        if (response.ok && response.status !== 204) {
          const result = await response.json();
          if (result.status === 'expired') {
            eventId = crypto.randomUUID(); accepted = false; attempts = 0;
          } else if (result.status === 'accepted' || result.status === 'duplicate') {
            accepted = true;
            documentEntryRecorded = true;
          }
        }
      } catch { /* Analytics failure must never affect browsing. Retry with the same event id. */ }
      finally { clearTimeout(timeout); busy = false; }
    };
    const consentChanged = () => {
      if (!mayTrack()) { abort?.abort(); accepted = false; attempts = 0; eventId = crypto.randomUUID(); }
      else void send();
    };
    // Deferring one tick also cancels React Strict Mode's discarded first effect.
    const initial = setTimeout(() => void send(), 0);
    const interval = setInterval(() => void send(), 30000);
    document.addEventListener('visibilitychange', send);
    window.addEventListener(ANALYTICS_CONSENT_EVENT, consentChanged);
    window.addEventListener('storage', consentChanged);
    window.addEventListener('pageshow', send);
    return () => {
      stopped = true; abort?.abort(); clearTimeout(initial); clearInterval(interval);
      document.removeEventListener('visibilitychange', send);
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, consentChanged);
      window.removeEventListener('storage', consentChanged);
      window.removeEventListener('pageshow', send);
    };
  }, [pathname]);
  return null;
}
