import { NextResponse } from 'next/server';
import { getCashGameById, updateCashGame, deleteCashGame } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid cash game ID' },
        { status: 400 }
      );
    }

    const cashGame = await getCashGameById(id);
    
    if (!cashGame) {
      return NextResponse.json(
        { error: 'Cash game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cashGame);
  } catch (error) {
    console.error('Error fetching cash game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cash game' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid cash game ID' },
        { status: 400 }
      );
    }

    const cashGameData = await request.json();
    
    const affectedRows = await updateCashGame(id, cashGameData);
    
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid cash game ID' },
        { status: 400 }
      );
    }

    const affectedRows = await deleteCashGame(id);
    
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