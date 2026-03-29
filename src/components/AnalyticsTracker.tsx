'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

let sessionId: string | null = null;

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const screenWidth = typeof window !== 'undefined' ? window.screen.width : null;
    const screenHeight = typeof window !== 'undefined' ? window.screen.height : null;
    const referrer = typeof document !== 'undefined' ? document.referrer : null;

    const trackPageView = async () => {
      try {
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            title: document.title,
            referrer,
            screenWidth,
            screenHeight,
          }),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          sessionId = data.sessionId;
        }
      } catch (error) {
        // Silently fail - not critical
      }
    };

    const timeoutId = setTimeout(() => {
      trackPageView();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
