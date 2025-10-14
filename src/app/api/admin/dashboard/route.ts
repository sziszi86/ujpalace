import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function GET() {
  try {
    // Get statistics
    const [tournamentStats] = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming,
        COUNT(CASE WHEN date = CURRENT_DATE THEN 1 END) as active,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured
      FROM tournaments
    `);

    const [cashGameStats] = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN active = true THEN 1 END) as active
      FROM cash_games
    `);

    const [structureStats] = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active
      FROM structures
    `);

    const [bannerStats] = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN active = true THEN 1 END) as active
      FROM banners
    `);

    // Get popular content
    const popularTournaments = await executeQuery(`
      SELECT 
        'Egyéb' as category,
        COUNT(*) as count,
        AVG(buyin_amount) as avgBuyIn
      FROM tournaments t
      LIMIT 5
    `);

    const popularCashGames = await executeQuery(`
      SELECT 
        (small_blind || '/' || big_blind) as stakes,
        COUNT(*) as count,
        AVG(min_buyin) as avgMinBuyIn
      FROM cash_games
      WHERE active = true
      GROUP BY small_blind, big_blind
      ORDER BY count DESC
      LIMIT 5
    `);

    // Get upcoming events
    const upcomingEvents = await executeQuery(`
      SELECT 
        t.title,
        t.date,
        EXTRACT(HOUR FROM t.date) || ':' || LPAD(EXTRACT(MINUTE FROM t.date)::text, 2, '0') as time,
        t.buyin_amount as buyIn,
        'Egyéb' as category,
        'tournament' as type
      FROM tournaments t
      WHERE t.date >= CURRENT_DATE
      ORDER BY t.date ASC
      LIMIT 10
    `);

    // Get player statistics
    let playerStats = null;
    try {
      const [topDepositor] = await executeQuery(`
        SELECT 
          p.id,
          p.name,
          SUM(CASE WHEN pt.transaction_type = 'deposit' THEN pt.amount ELSE 0 END) as total_deposits
        FROM players p
        LEFT JOIN player_transactions pt ON p.id = pt.player_id
        WHERE p.active = true
        GROUP BY p.id, p.name
        HAVING SUM(CASE WHEN pt.transaction_type = 'deposit' THEN pt.amount ELSE 0 END) > 0
        ORDER BY SUM(CASE WHEN pt.transaction_type = 'deposit' THEN pt.amount ELSE 0 END) DESC
        LIMIT 1
      `);

      const [transactionTotals] = await executeQuery(`
        SELECT 
          SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) as totalDeposits,
          SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END) as totalWithdrawals
        FROM player_transactions
      `);

      const recentTransactions = await executeQuery(`
        SELECT 
          pt.transaction_type as type,
          p.name as playerName,
          pt.amount,
          pt.created_at as date
        FROM player_transactions pt
        JOIN players p ON pt.player_id = p.id
        ORDER BY pt.created_at DESC
        LIMIT 10
      `);

      playerStats = {
        topDepositor: topDepositor || null,
        totalDeposits: transactionTotals?.totalDeposits || 0,
        totalWithdrawals: transactionTotals?.totalWithdrawals || 0,
        recentTransactions: recentTransactions || []
      };
    } catch (error) {
      console.warn('Could not fetch player stats:', error);
    }

    // Get current visitor count
    let currentVisitors = 0;
    try {
      // Clean up expired visitors first
      await executeQuery(`
        DELETE FROM active_visitors 
        WHERE expires_at < CURRENT_TIMESTAMP
      `);

      // Get current visitor count
      const [visitorCount] = await executeQuery(`
        SELECT COUNT(*) as count 
        FROM active_visitors 
        WHERE expires_at > CURRENT_TIMESTAMP
      `);
      
      currentVisitors = parseInt(visitorCount?.count || '0');
    } catch (error) {
      console.warn('Could not fetch visitor count (table might not exist yet):', error);
    }

    // System status
    const systemStatus = {
      database: {
        status: 'online'
      },
      website: {
        uptime: '99.9%',
        currentVisitors
      },
      backup: {
        lastBackup: new Date().toISOString().split('T')[0]
      }
    };

    const dashboardData = {
      statistics: {
        tournaments: {
          total: tournamentStats?.total || 0,
          upcoming: tournamentStats?.upcoming || 0,
          active: tournamentStats?.active || 0,
          featured: tournamentStats?.featured || 0
        },
        cashGames: {
          total: cashGameStats?.total || 0,
          active: cashGameStats?.active || 0
        },
        structures: {
          total: structureStats?.total || 0,
          active: structureStats?.active || 0
        },
        banners: {
          total: bannerStats?.total || 0,
          active: bannerStats?.active || 0
        }
      },
      popularContent: {
        tournaments: popularTournaments || [],
        cashGames: popularCashGames || []
      },
      upcomingEvents: upcomingEvents || [],
      playerStats,
      systemStatus
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}