import { NextResponse } from 'next/server';
import { query } from '@/lib/db-postgres';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Összesített statisztikák
    const totalStats = await query(`
      SELECT 
        COALESCE(SUM(total_views), 0) as total_views,
        COALESCE(SUM(unique_visitors), 0) as total_visitors,
        COALESCE(SUM(mobile_views), 0) as mobile_views,
        COALESCE(SUM(desktop_views), 0) as desktop_views,
        COALESCE(SUM(tablet_views), 0) as tablet_views
      FROM analytics_daily_stats
      WHERE date >= $1
    `, [startDateStr]);

    // Napi bontás (grafikonhoz)
    const dailyStats = await query(`
      SELECT 
        date,
        total_views,
        unique_visitors,
        mobile_views,
        desktop_views,
        tablet_views
      FROM analytics_daily_stats
      WHERE date >= $1
      ORDER BY date ASC
    `, [startDateStr]);

    // Top oldalak (kivéve /admin oldalak)
    const topPages = await query(`
      SELECT 
        path,
        title,
        SUM(views) as total_views,
        SUM(unique_visitors) as unique_visitors
      FROM analytics_top_pages
      WHERE date >= $1
        AND path NOT LIKE '/admin%'
      GROUP BY path, title
      ORDER BY total_views DESC
      LIMIT 20
    `, [startDateStr]);

    // Top versenyek (tournament oldalak, kivéve /admin)
    const topTournaments = await query(`
      SELECT 
        path,
        title,
        SUM(views) as total_views,
        SUM(unique_visitors) as unique_visitors
      FROM analytics_top_pages
      WHERE date >= $1
        AND (path LIKE '/tournaments/%' OR path LIKE '/admin/tournaments/%')
        AND path NOT LIKE '/admin%'
      GROUP BY path, title
      ORDER BY total_views DESC
      LIMIT 10
    `, [startDateStr]);

    // Referrerek kategorizálva
    const referrers = await query(`
      SELECT 
        referrer_domain,
        SUM(views) as total_views
      FROM analytics_referrers
      WHERE date >= $1
      GROUP BY referrer_domain
      ORDER BY total_views DESC
      LIMIT 15
    `, [startDateStr]);

    // Referrer kategóriák
    const referrerCategories = {
      social: 0,
      search: 0,
      direct: 0,
      other: 0,
    };

    const socialDomains = ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'linkedin.com', 'pinterest.com', 'reddit.com'];
    const searchDomains = ['google.com', 'www.google.com', 'google.hu', 'bing.com', 'yahoo.com', 'duckduckgo.com', 'ecosia.org'];

    referrers.rows.forEach((ref: any) => {
      const domain = ref.referrer_domain.toLowerCase();
      if (socialDomains.some(d => domain.includes(d))) {
        referrerCategories.social += ref.total_views;
      } else if (searchDomains.some(d => domain.includes(d))) {
        referrerCategories.search += ref.total_views;
      } else if (domain === 'direct' || domain === '(direct)') {
        referrerCategories.direct += ref.total_views;
      } else {
        referrerCategories.other += ref.total_views;
      }
    });

    // Mai statisztikák
    const todayStats = await query(`
      SELECT * FROM analytics_daily_stats WHERE date = CURRENT_DATE
    `);

    // Tegnapelőtti statisztikák (összehasonlításhoz)
    const yesterdayStats = await query(`
      SELECT * FROM analytics_daily_stats WHERE date = CURRENT_DATE - INTERVAL '1 day'
    `);

    // Múlt heti statisztikák (last 7 days)
    const lastWeekStats = await query(`
      SELECT 
        COALESCE(SUM(total_views), 0) as total_views,
        COALESCE(SUM(unique_visitors), 0) as total_visitors
      FROM analytics_daily_stats
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    `);

    // Jelenlegi látogatók (utolsó 5 percben aktív sessionök)
    const currentOnline = await query(`
      SELECT COUNT(DISTINCT session_id) as online_users
      FROM analytics_page_views
      WHERE visited_at >= NOW() - INTERVAL '5 minutes'
    `);

    // Eszköz megoszlás (%)
    const total = totalStats.rows[0] as any;
    const totalDeviceViews = (total.mobile_views || 0) + (total.desktop_views || 0) + (total.tablet_views || 0);
    const deviceBreakdown = {
      mobile: totalDeviceViews > 0 ? Math.round(((total.mobile_views || 0) / totalDeviceViews) * 100) : 0,
      desktop: totalDeviceViews > 0 ? Math.round(((total.desktop_views || 0) / totalDeviceViews) * 100) : 0,
      tablet: totalDeviceViews > 0 ? Math.round(((total.tablet_views || 0) / totalDeviceViews) * 100) : 0,
    };

    // Növekedés számítása
    const today = todayStats.rows[0] as any;
    const yesterday = yesterdayStats.rows[0] as any;
    const growth = yesterday && yesterday.total_views > 0
      ? Math.round(((today?.total_views || 0) - (yesterday.total_views || 0)) / yesterday.total_views * 100)
      : 0;

    return NextResponse.json({
      summary: {
        totalViews: total.total_views || 0,
        totalVisitors: total.total_visitors || 0,
        avgDailyViews: dailyStats.rows.length > 0 
          ? Math.round((total.total_views || 0) / dailyStats.rows.length) 
          : 0,
        growth,
      },
      currentOnline: (currentOnline.rows[0] as any)?.online_users || 0,
      lastWeek: {
        totalViews: lastWeekStats.rows[0]?.total_views || 0,
        totalVisitors: lastWeekStats.rows[0]?.total_visitors || 0,
      },
      deviceBreakdown,
      dailyStats: dailyStats.rows,
      topPages: topPages.rows,
      topTournaments: topTournaments.rows,
      referrers: referrers.rows,
      referrerCategories,
      today: today || null,
      yesterday: yesterday || null,
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
