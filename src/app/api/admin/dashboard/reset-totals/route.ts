import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notes = '' } = body;

    // Check if the tables exist first
    const tablesExist = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'players'
      ) as players_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'player_transactions'
      ) as transactions_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'financial_resets'
      ) as resets_exists
    `);

    const { players_exists, transactions_exists, resets_exists } = tablesExist[0] || {};

    if (!players_exists || !transactions_exists) {
      return NextResponse.json({
        message: 'A pénzügyi összesítő sikeresen nullázva lett! (Mock környezetben)',
        success: true,
        mock: true
      });
    }

    // Create the financial_resets table if it doesn't exist
    if (!resets_exists) {
      await executeQuery(`
        CREATE TABLE financial_resets (
          id SERIAL PRIMARY KEY,
          reset_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          total_deposits_before DECIMAL(15,2) DEFAULT 0,
          total_withdrawals_before DECIMAL(15,2) DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Get current totals before reset
    const [currentTotals] = await executeQuery(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END), 0) as total_deposits,
        COALESCE(SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END), 0) as total_withdrawals
      FROM player_transactions
    `);

    const totalDeposits = parseFloat(currentTotals?.total_deposits || '0');
    const totalWithdrawals = parseFloat(currentTotals?.total_withdrawals || '0');

    // Record the reset in the financial_resets table
    await executeQuery(`
      INSERT INTO financial_resets (
        total_deposits_before, 
        total_withdrawals_before, 
        notes
      ) VALUES ($1, $2, $3)
    `, [totalDeposits, totalWithdrawals, notes]);

    // Archive existing transactions by adding a reset_date field
    await executeQuery(`
      UPDATE player_transactions 
      SET reset_date = CURRENT_TIMESTAMP 
      WHERE reset_date IS NULL
    `);

    // Alternatively, you could move transactions to an archive table:
    /*
    await executeQuery(`
      INSERT INTO player_transactions_archive 
      SELECT *, CURRENT_TIMESTAMP as archived_at 
      FROM player_transactions
    `);
    
    await executeQuery(`DELETE FROM player_transactions`);
    */

    return NextResponse.json({
      message: `Pénzügyi összesítő sikeresen nullázva! Előző összegek: ${totalDeposits.toLocaleString('hu-HU')} Ft befizetés, ${totalWithdrawals.toLocaleString('hu-HU')} Ft kifizetés.`,
      success: true,
      previousTotals: {
        deposits: totalDeposits,
        withdrawals: totalWithdrawals
      }
    });

  } catch (error) {
    console.error('Error resetting financial totals:', error);
    return NextResponse.json(
      { 
        error: 'Hiba történt a nullázás során',
        details: error instanceof Error ? error.message : 'Ismeretlen hiba'
      },
      { status: 500 }
    );
  }
}