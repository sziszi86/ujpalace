import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';

async function getAllCashGames() {
  const connection = await getConnection();
  const [rows] = await connection.execute('SELECT * FROM cash_games ORDER BY created_at DESC');
  return rows;
}

async function insertCashGame(data) {
  const connection = await getConnection();
  const [result] = await connection.execute(
    'INSERT INTO cash_games (name, stakes, game_type, min_buy_in, max_buy_in, description, schedule, active, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [data.name, data.stakes, data.game_type, data.min_buy_in, data.max_buy_in, data.description, data.schedule, data.active || true, data.author_id || 1]
  );
  return result;
}

async function updateCashGame(id, data) {
  const connection = await getConnection();
  const [result] = await connection.execute(
    'UPDATE cash_games SET name = ?, stakes = ?, game_type = ?, min_buy_in = ?, max_buy_in = ?, description = ?, schedule = ?, active = ? WHERE id = ?',
    [data.name, data.stakes, data.game_type, data.min_buy_in, data.max_buy_in, data.description, data.schedule, data.active, id]
  );
  return result;
}

async function deleteCashGame(id) {
  const connection = await getConnection();
  const [result] = await connection.execute('DELETE FROM cash_games WHERE id = ?', [id]);
  return result;
}

export async function GET() {
  try {
    const cashGames = await getAllCashGames();
    return NextResponse.json(cashGames);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cash games' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await insertCashGame(data);
    return NextResponse.json(
      { message: 'Cash game created successfully', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create cash game' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...cashGameData } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Cash game ID is required' },
        { status: 400 }
      );
    }

    await updateCashGame(id, cashGameData);
    return NextResponse.json({ message: 'Cash game updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update cash game' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Cash game ID is required' },
        { status: 400 }
      );
    }

    await deleteCashGame(id);
    return NextResponse.json({ message: 'Cash game deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete cash game' },
      { status: 500 }
    );
  }
}