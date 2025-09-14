import { NextResponse } from 'next/server';
import { getAllCashGames, createCashGame, updateCashGame, deleteCashGame } from '@/lib/database';

export async function GET() {
  try {
    const cashGames = await getAllCashGames();
    return NextResponse.json(cashGames);
  } catch (error) {
    console.error('Error fetching cash games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cash games' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await createCashGame(data);
    return NextResponse.json(
      { message: 'Cash game created successfully', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating cash game:', error);
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

    const affectedRows = await updateCashGame(id, cashGameData);
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Cash game not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Cash game updated successfully' });
  } catch (error) {
    console.error('Error updating cash game:', error);
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

    const affectedRows = await deleteCashGame(parseInt(id));
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Cash game not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Cash game deleted successfully' });
  } catch (error) {
    console.error('Error deleting cash game:', error);
    return NextResponse.json(
      { error: 'Failed to delete cash game' },
      { status: 500 }
    );
  }
}