import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function GET() {
  try {
    // Check if the financial_resets table exists
    const tableExists = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'financial_resets'
      ) as table_exists
    `);

    const { table_exists } = tableExists[0] || {};

    if (!table_exists) {
      // Return empty array if table doesn't exist yet
      return NextResponse.json([]);
    }

    // Get all financial resets, ordered by most recent first
    const resets = await executeQuery(`
      SELECT 
        id,
        reset_date,
        total_deposits_before,
        total_withdrawals_before,
        notes,
        created_at
      FROM financial_resets
      ORDER BY reset_date DESC
    `);

    // Convert numeric strings to numbers for proper calculation
    const formattedResets = resets.map(reset => ({
      ...reset,
      total_deposits_before: parseFloat(reset.total_deposits_before || '0'),
      total_withdrawals_before: parseFloat(reset.total_withdrawals_before || '0')
    }));

    return NextResponse.json(formattedResets);

  } catch (error) {
    console.error('Error fetching financial archive:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial archive data' },
      { status: 500 }
    );
  }
}