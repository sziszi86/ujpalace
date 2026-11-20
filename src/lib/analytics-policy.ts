export const ANALYTICS_TIMEZONE = 'Europe/Budapest';
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const BOT_PATTERN = /bot|crawler|spider|headless|lighthouse|pagespeed|uptime|monitor|preview|facebookexternalhit|curl|wget|python|selenium|playwright/i;

export function publicPath(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 500 || !value.startsWith('/') || value.startsWith('//')) return null;
  let path: string;
  try { path = decodeURIComponent(value.split(/[?#]/)[0]).replace(/\/+$/, '') || '/'; } catch { return null; }
  // Only the site's public page routes; excludes admin, APIs, assets and 404 paths.
  if (/^\/(?:|tournaments(?:\/list|\/\d+)?|cash-games(?:\/list|\/\d+)?|news\/\d+|blog|about|rolunk|gallery|contact|privacy|jatekosvedelm)$/.test(path)) return path;
  return null;
}

export function cleanText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max) : '';
}

export function deviceType(ua: string): 'desktop' | 'mobile' | 'tablet' {
  if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) return 'tablet';
  return /mobile|iphone|android/i.test(ua) ? 'mobile' : 'desktop';
}

export function sourceInfo(referrer: unknown, campaign: unknown, hostname: string) {
  const tags = campaign && typeof campaign === 'object' ? campaign as Record<string, unknown> : {};
  const source = cleanText(tags.source, 200).toLowerCase();
  let domain = 'direct';
  try {
    const url = new URL(typeof referrer === 'string' ? referrer : '');
    const ownHosts = [hostname, 'palace-poker.hu', 'www.palace-poker.hu', 'palacepoker.hu', 'www.palacepoker.hu'];
    if (['http:', 'https:'].includes(url.protocol) && !ownHosts.includes(url.hostname)) domain = url.hostname.slice(0, 200);
  } catch { /* Missing referrer is direct / unknown, never guessed. */ }
  return { source: source || domain, medium: cleanText(tags.medium, 100) || null, campaign: cleanText(tags.name, 150) || null };
}

export function sourceCategory(source: string): 'social' | 'search' | 'direct' | 'other' {
  const matches = (names: string[]) => names.some(name => source === name || source.endsWith('.' + name));
  if (source === 'direct') return 'direct';
  if (matches(['facebook.com', 'instagram.com', 'tiktok.com', 'x.com', 'twitter.com', 'linkedin.com', 'reddit.com']) || ['facebook', 'instagram', 'tiktok', 'social', 'fb', 'ig'].includes(source)) return 'social';
  if (matches(['google.com', 'google.hu', 'google.at', 'bing.com', 'yahoo.com', 'duckduckgo.com', 'ecosia.org']) || ['google', 'bing'].includes(source)) return 'search';
  return 'other';
}
