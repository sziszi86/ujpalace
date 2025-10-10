import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

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
      WHERE p.id = ?
      GROUP BY p.id, p.name, p.phone, p.email, p.other_notes, p.active, p.created_at, p.updated_at
    `, [playerId]);

    if (players.length === 0) {
      return NextResponse.json(
        { error: 'Játékos nem található' },
        { status: 404 }
      );
    }

    return NextResponse.json(players[0]);
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { name, phone, email, other_notes, active } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'A név megadása kötelező' },
        { status: 400 }
      );
    }

    await executeQuery(`
      UPDATE players 
      SET name = ?, phone = ?, email = ?, other_notes = ?, active = ?
      WHERE id = ?
    `, [name, phone || null, email || null, other_notes || null, active !== false, playerId]);

    const updatedPlayer = await executeQuery(`
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
      WHERE p.id = ?
      GROUP BY p.id, p.name, p.phone, p.email, p.other_notes, p.active, p.created_at, p.updated_at
    `, [playerId]);

    return NextResponse.json(updatedPlayer[0]);
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if player exists
    const player = await executeQuery(`
      SELECT id FROM players WHERE id = ?
    `, [playerId]);

    if (player.length === 0) {
      return NextResponse.json(
        { error: 'Játékos nem található' },
        { status: 404 }
      );
    }

    // First delete all transactions for this player
    await executeQuery(`
      DELETE FROM player_transactions WHERE player_id = ?
    `, [playerId]);

    // Then delete the player
    await executeQuery(`
      DELETE FROM players WHERE id = ?
    `, [playerId]);

    return NextResponse.json({ message: 'Játékos sikeresen törölve' });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    );
  }
}