import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';
import { createHash } from 'crypto';

// IP cím hashelése (GDPR barát)
function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

// Eszköz típus meghatározása user agent alapján
function getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  const ua = userAgent.toLowerCase();
  
  if (/tablet/i.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
}

// Browser meghatározása
function getBrowser(userAgent: string): string {
  const ua = userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('MSIE') || ua.includes('Trident')) return 'Internet Explorer';
  return 'Other';
}

// OS meghatározása
function getOS(userAgent: string): string {
  const ua = userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Other';
}

// Session ID generálás vagy kinyerése
function getSessionId(cookie: string | null): string {
  if (cookie) {
    const match = cookie.match(/analytics_session=([^;]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      path, 
      title, 
      referrer, 
      screenWidth, 
      screenHeight 
    } = body;

    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const ipHash = hashIP(ip);
    const sessionCookie = request.headers.get('cookie');
    const sessionId = getSessionId(sessionCookie);
    
    const deviceType = getDeviceType(userAgent);
    const browser = getBrowser(userAgent);
    const os = getOS(userAgent);

    let referrerDomain = null;
    if (referrer && referrer !== window.location.origin) {
      try {
        const url = new URL(referrer);
        referrerDomain = url.hostname;
      } catch {
        referrerDomain = referrer;
      }
    }

    // Page view mentése
    await query(`
      INSERT INTO analytics_page_views 
      (path, title, referrer, user_agent, ip_hash, device_type, browser, os, screen_width, screen_height, session_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      path,
      title || null,
      referrer || null,
      userAgent,
      ipHash,
      deviceType,
      browser,
      os,
      screenWidth || null,
      screenHeight || null,
      sessionId
    ]);

    // Session frissítése vagy létrehozása
    const sessionExists = await query(
      `SELECT id FROM analytics_sessions WHERE session_id = $1`,
      [sessionId]
    );

    if (sessionExists.rows.length > 0) {
      await query(`
        UPDATE analytics_sessions 
        SET last_page = $1, page_views = page_views + 1
        WHERE session_id = $2
      `, [path, sessionId]);
    } else {
      await query(`
        INSERT INTO analytics_sessions 
        (session_id, ip_hash, user_agent, first_page, last_page, device_type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [sessionId, ipHash, userAgent, path, path, deviceType]);
    }

    // Daily stats frissítése (ma)
    const today = new Date().toISOString().split('T')[0];
    
    const todayStats = await query(
      `SELECT id FROM analytics_daily_stats WHERE date = $1`,
      [today]
    );

    // Unique visitor check (egy IP csak egyszer számítson naponta)
    const isUniqueVisitor = await query(
      `SELECT COUNT(*) as count FROM analytics_page_views 
       WHERE ip_hash = $1 AND DATE(visited_at) = $2`,
      [ipHash, today]
    );
    
    const isNewUniqueVisitor = (isUniqueVisitor.rows[0] as any)?.count === 0;

    if (todayStats.rows.length > 0) {
      const deviceColumn = `${deviceType}_views`;
      await query(`
        UPDATE analytics_daily_stats 
        SET total_views = total_views + 1, 
            ${deviceColumn} = ${deviceColumn} + 1,
            unique_visitors = unique_visitors + ${isNewUniqueVisitor ? 1 : 0}
        WHERE date = $1
      `, [today]);
    } else {
      await query(`
        INSERT INTO analytics_daily_stats 
        (date, total_views, unique_visitors, mobile_views, desktop_views, tablet_views)
        VALUES ($1, 1, ${isNewUniqueVisitor ? 1 : 0}, $2, $3, $4)
      `, [
        today,
        deviceType === 'mobile' ? 1 : 0,
        deviceType === 'desktop' ? 1 : 0,
        deviceType === 'tablet' ? 1 : 0
      ]);
    }

    // Top pages frissítése
    const topPageExists = await query(
      `SELECT id FROM analytics_top_pages WHERE path = $1 AND date = $2`,
      [path, today]
    );

    if (topPageExists.rows.length > 0) {
      await query(`
        UPDATE analytics_top_pages 
        SET views = views + 1, 
            title = $1,
            unique_visitors = unique_visitors + ${isNewUniqueVisitor ? 1 : 0}
        WHERE path = $2 AND date = $3
      `, [title || path, path, today]);
    } else {
      await query(`
        INSERT INTO analytics_top_pages 
        (path, title, date, views, unique_visitors)
        VALUES ($1, $2, $3, 1, ${isNewUniqueVisitor ? 1 : 0})
      `, [path, title || path, today]);
    }

    // Referrer statisztika
    if (referrerDomain) {
      const referrerExists = await query(
        `SELECT id FROM analytics_referrers WHERE referrer_domain = $1 AND date = $2`,
        [referrerDomain, today]
      );

      if (referrerExists.rows.length > 0) {
        await query(`
          UPDATE analytics_referrers 
          SET views = views + 1
          WHERE referrer_domain = $1 AND date = $2
        `, [referrerDomain, today]);
      } else {
        await query(`
          INSERT INTO analytics_referrers 
          (referrer_domain, referrer_url, date, views)
          VALUES ($1, $2, $3, 1)
        `, [referrerDomain, referrer || null, today]);
      }
    }

    const response = NextResponse.json({ 
      success: true, 
      sessionId 
    });
    
    response.cookies.set('analytics_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Analytics tracking endpoint',
    status: 'active'
  });
}
