import { NextRequest, NextResponse } from 'next/server';
import { getAllCashGames, createCashGame, updateCashGame, deleteCashGame } from '@/lib/database-postgresql';
import { CashGame } from '@/types';

export async function GET() {
  try {
    const cashGames = await getAllCashGames();
    return NextResponse.json(cashGames);
  } catch (error) {
    console.error('Error fetching cash games:', error);
    // Fallback to only in-memory cash games
    return NextResponse.json(memoryCashGames);
  }
}

// In-memory storage for fallback with default cash games
let memoryCashGames: CashGame[] = [
  {
    id: 1,
    name: 'No Limit Hold\'em',
    stakes: '100/200',
    game: 'NLH',
    minBuyIn: 20000,
    maxBuyIn: 40000,
    schedule: 'Hétfő-Vasárnap 18:00-06:00',
    active: true,
    description: 'Klasszikus No Limit Texas Hold\'em cash game',
    venue: 'Palace Poker Szombathely',
    visibleFrom: '2025-01-01',
    visibleUntil: '2025-12-31'
  },
  {
    id: 2,
    name: 'Pot Limit Omaha',
    stakes: '200/400',
    game: 'PLO',
    minBuyIn: 40000,
    maxBuyIn: 80000,
    schedule: 'Péntek-Vasárnap 20:00-04:00',
    active: true,
    description: 'Izgalmas PLO cash game tapasztalt játékosoknak',
    venue: 'Palace Poker Szombathely',
    visibleFrom: '2025-01-01',
    visibleUntil: '2025-12-31'
  }
];

export async function POST(request: NextRequest) {
  try {
    const cashGameData: Omit<CashGame, 'id'> = await request.json();
    
    // Validáció
    if (!cashGameData.name || !cashGameData.game || !cashGameData.stakes) {
      return NextResponse.json({ error: 'Name, game, and stakes are required' }, { status: 400 });
    }

    try {
      const newCashGame = await createCashGame(cashGameData);
      return NextResponse.json(newCashGame, { status: 201 });
    } catch (dbError) {
      // Fallback to in-memory storage
      console.log('Database not available, using in-memory storage');
      const newId = Math.max(...memoryCashGames.map(cg => cg.id), 0) + 1;
      const newCashGame: CashGame = {
        ...cashGameData,
        id: newId,
        active: cashGameData.active || true,
        visibleFrom: cashGameData.visibleFrom || new Date().toISOString().split('T')[0],
        visibleUntil: cashGameData.visibleUntil || '2025-12-31'
      };
      memoryCashGames.push(newCashGame);
      return NextResponse.json(newCashGame, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating cash game:', error);
    return NextResponse.json({ error: 'Failed to create cash game' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cashGameData: CashGame = await request.json();
    
    if (!cashGameData.id) {
      return NextResponse.json({ error: 'Cash game ID is required' }, { status: 400 });
    }

    try {
      const updatedCashGame = await updateCashGame(cashGameData.id, cashGameData);
      // Also update in-memory if exists
      const memoryIndex = memoryCashGames.findIndex(cg => cg.id === cashGameData.id);
      if (memoryIndex >= 0) {
        memoryCashGames[memoryIndex] = cashGameData;
      }
      return NextResponse.json(updatedCashGame);
    } catch (dbError) {
      // Fallback to in-memory update
      console.log('Database not available, updating in-memory storage');
      const memoryIndex = memoryCashGames.findIndex(cg => cg.id === cashGameData.id);
      if (memoryIndex >= 0) {
        memoryCashGames[memoryIndex] = cashGameData;
        return NextResponse.json(cashGameData);
      } else {
        return NextResponse.json({ error: 'Cash game not found' }, { status: 404 });
      }
    }
  } catch (error) {
    console.error('Error updating cash game:', error);
    return NextResponse.json({ error: 'Failed to update cash game' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Cash game ID is required' }, { status: 400 });
    }

    const cashGameId = parseInt(id);

    try {
      await deleteCashGame(cashGameId);
      // Also remove from in-memory if exists
      const memoryIndex = memoryCashGames.findIndex(cg => cg.id === cashGameId);
      if (memoryIndex >= 0) {
        memoryCashGames.splice(memoryIndex, 1);
      }
      return NextResponse.json({ success: true });
    } catch (dbError) {
      // Fallback to in-memory delete
      console.log('Database not available, deleting from in-memory storage');
      const memoryIndex = memoryCashGames.findIndex(cg => cg.id === cashGameId);
      if (memoryIndex >= 0) {
        memoryCashGames.splice(memoryIndex, 1);
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: 'Cash game not found' }, { status: 404 });
      }
    }
  } catch (error) {
    console.error('Error deleting cash game:', error);
    return NextResponse.json({ error: 'Failed to delete cash game' }, { status: 500 });
  }
}