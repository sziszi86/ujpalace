import { NextRequest, NextResponse } from 'next/server';
import { getAllCashGames, createCashGame, updateCashGame, deleteCashGame } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const cashGames = await getAllCashGames();
    return NextResponse.json(cashGames);
  } catch (error) {
    console.error('Error fetching cash games for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cash games' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const cashGameData = await request.json();
    
    // Validation
    if (!cashGameData.name || !cashGameData.stakes) {
      return NextResponse.json(
        { error: 'Name and stakes are required' },
        { status: 400 }
      );
    }

    const result = await createCashGame(cashGameData);
    return NextResponse.json({ id: result.insertId, ...cashGameData }, { status: 201 });
  } catch (error) {
    console.error('Error creating cash game:', error);
    return NextResponse.json(
      { error: 'Failed to create cash game' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const cashGameData = await request.json();
    
    if (!cashGameData.id) {
      return NextResponse.json(
        { error: 'Cash game ID is required' },
        { status: 400 }
      );
    }

    const affectedRows = await updateCashGame(cashGameData.id, cashGameData);
    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Cash game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, affectedRows });
  } catch (error) {
    console.error('Error updating cash game:', error);
    return NextResponse.json(
      { error: 'Failed to update cash game' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Cash game ID is required' },
        { status: 400 }
      );
    }

    const cashGameId = parseInt(id);
    const affectedRows = await deleteCashGame(cashGameId);
    
    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Cash game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cash game:', error);
    return NextResponse.json(
      { error: 'Failed to delete cash game' },
      { status: 500 }
    );
  }
}