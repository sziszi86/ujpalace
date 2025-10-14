import { NextResponse } from 'next/server';
import { executeQuery, executeInsert } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { player_id, transaction_type, amount, description, tournament_id } = body;

    if (!player_id || !transaction_type || !amount) {
      return NextResponse.json(
        { error: 'Minden kötelező mező megadása szükséges' },
        { status: 400 }
      );
    }

    if (!['deposit', 'withdrawal'].includes(transaction_type)) {
      return NextResponse.json(
        { error: 'Érvénytelen tranzakció típus' },
        { status: 400 }
      );
    }

    const result = await executeInsert(`
      INSERT INTO player_transactions (player_id, transaction_type, amount, description, tournament_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [player_id, transaction_type, amount, description || null, tournament_id || null]);

    const newTransaction = await executeQuery(`
      SELECT * FROM player_transactions WHERE id = $1
    `, [result.insertId]);

    return NextResponse.json(newTransaction[0], { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}