import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);
    
    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Érvénytelen játékos ID' },
        { status: 400 }
      );
    }

    const transactions = await executeQuery(`
      SELECT 
        id,
        transaction_type,
        amount,
        transaction_date,
        notes,
        created_at
      FROM player_transactions 
      WHERE player_id = $1
      ORDER BY transaction_date DESC, created_at DESC
    `, [playerId]);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}