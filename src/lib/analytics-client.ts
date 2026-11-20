export const ANALYTICS_CONSENT_KEY = 'analytics-consent-v2';
export const ANALYTICS_CONSENT_EVENT = 'analytics-consent-change';
export const ANALYTICS_SETTINGS_EVENT = 'analytics-open-settings';
const VISITOR_KEY = 'palace-analytics-visitor-v2';
let memoryConsent: string | null = null;

export function analyticsConsent(): boolean {
  try { return (localStorage.getItem(ANALYTICS_CONSENT_KEY) || memoryConsent) === 'accepted'; }
  catch { return memoryConsent === 'accepted'; }
}

export function saveAnalyticsConsent(value: 'accepted' | 'declined') {
  memoryConsent = value;
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    localStorage.setItem('cookie-consent', value);
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    if (value === 'declined') localStorage.removeItem(VISITOR_KEY);
  } catch { /* Storage restrictions must not block the website or its banner. */ }
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
}

export function mayTrack(): boolean {
  try {
    return analyticsConsent() && !localStorage.getItem('authToken') &&
      localStorage.getItem('analytics-exclude') !== 'true' && navigator.doNotTrack !== '1' &&
      !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
  } catch { return false; }
}

export async function visitorId(): Promise<string> {
  const getId = () => {
    let visitor;
    try { visitor = JSON.parse(localStorage.getItem(VISITOR_KEY) || 'null'); } catch { /* Replace invalid storage. */ }
    if (!visitor || typeof visitor.id !== 'string' || !Number.isFinite(visitor.expiresAt) || visitor.expiresAt <= Date.now()) {
      visitor = { id: crypto.randomUUID(), expiresAt: Date.now() + 90 * 86400000 };
      localStorage.setItem(VISITOR_KEY, JSON.stringify(visitor));
    }
    return visitor.id as string;
  };
  // Coordinate first visits in multiple tabs when Web Locks are available.
  return navigator.locks ? navigator.locks.request(VISITOR_KEY, getId) : getId();
}
