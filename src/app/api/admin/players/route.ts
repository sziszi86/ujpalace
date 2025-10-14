import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function GET() {
  try {
    const players = await executeQuery(`
      SELECT 
        p.*,
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'deposit' THEN pt.amount ELSE 0 END), 0) as total_deposits,
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'withdrawal' THEN pt.amount ELSE 0 END), 0) as total_withdrawals,
        COALESCE(
          SUM(CASE WHEN pt.transaction_type = 'deposit' THEN pt.amount ELSE 0 END) -
          SUM(CASE WHEN pt.transaction_type = 'withdrawal' THEN pt.amount ELSE 0 END), 
          0
        ) as balance,
        COUNT(pt.id) as transaction_count
      FROM players p
      LEFT JOIN player_transactions pt ON p.id = pt.player_id
      GROUP BY p.id, p.name, p.phone, p.email, p.notes, p.active, p.created_at, p.updated_at, p.registration_date
      ORDER BY p.created_at DESC
    `);

    for (let player of players) {
      const recentTransactions = await executeQuery(`
        SELECT 
          transaction_type,
          amount,
          created_at as transaction_date,
          description as notes
        FROM player_transactions 
        WHERE player_id = $1
        ORDER BY created_at DESC 
        LIMIT 5
      `, [player.id]);
      
      player.recent_transactions = recentTransactions;
    }

    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, notes, active } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'A név megadása kötelező' },
        { status: 400 }
      );
    }

    const result = await executeQuery(`
      INSERT INTO players (name, phone, email, notes, active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [name, phone || null, email || null, notes || null, active !== false]);

    const newPlayer = await executeQuery(`
      SELECT 
        p.*,
        0 as total_deposits,
        0 as total_withdrawals,
        0 as balance,
        0 as transaction_count
      FROM players p 
      WHERE p.id = $1
    `, [result[0].id]);

    return NextResponse.json(newPlayer[0], { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}