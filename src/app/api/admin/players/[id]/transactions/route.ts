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
        created_at as transaction_date,
        description as notes,
        created_at
      FROM player_transactions 
      WHERE player_id = $1
      ORDER BY created_at DESC
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

export async function POST(
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

    const body = await request.json();
    const { transaction_type, amount, description } = body;

    if (!transaction_type || !amount) {
      return NextResponse.json(
        { error: 'Tranzakció típusa és összeg megadása kötelező' },
        { status: 400 }
      );
    }

    if (!['deposit', 'withdrawal'].includes(transaction_type)) {
      return NextResponse.json(
        { error: 'Érvénytelen tranzakció típus' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Az összeg pozitív szám kell legyen' },
        { status: 400 }
      );
    }

    // Check if player exists
    const playerExists = await executeQuery(`
      SELECT id FROM players WHERE id = $1
    `, [playerId]);

    if (playerExists.length === 0) {
      return NextResponse.json(
        { error: 'Játékos nem található' },
        { status: 404 }
      );
    }

    const result = await executeQuery(`
      INSERT INTO player_transactions (player_id, transaction_type, amount, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [playerId, transaction_type, amount, description || null]);

    const newTransaction = await executeQuery(`
      SELECT 
        id,
        transaction_type,
        amount,
        created_at as transaction_date,
        description as notes,
        created_at
      FROM player_transactions 
      WHERE id = $1
    `, [result[0].id]);

    return NextResponse.json(newTransaction[0], { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}