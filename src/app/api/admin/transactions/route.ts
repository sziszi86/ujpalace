import { NextResponse } from 'next/server';
import { executeQuery, executeInsert } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player_id, transaction_type, amount, transaction_date, notes } = body;

    if (!player_id || !transaction_type || !amount || !transaction_date) {
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
      INSERT INTO player_transactions (player_id, transaction_type, amount, transaction_date, notes)
      VALUES (?, ?, ?, ?, ?)
    `, [player_id, transaction_type, amount, transaction_date, notes || null]);

    const newTransaction = await executeQuery(`
      SELECT * FROM player_transactions WHERE id = ?
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