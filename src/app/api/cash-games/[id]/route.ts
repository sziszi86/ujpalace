import { NextResponse } from 'next/server';
import { getCashGameById } from '@/lib/database-postgresql';
import { CashGame } from '@/types';

// Fallback cash games (must match the ones in /api/cash-games/route.ts)
const fallbackCashGames: CashGame[] = [
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid cash game ID' },
        { status: 400 }
      );
    }

    let cashGame;
    try {
      cashGame = await getCashGameById(id);
    } catch (dbError) {
      console.error('Database error, using fallback:', dbError);
      // Try fallback
      const fallbackGame = fallbackCashGames.find(g => g.id === id);
      if (fallbackGame) {
        return NextResponse.json(fallbackGame);
      }
      return NextResponse.json(
        { error: 'Cash game not found' },
        { status: 404 }
      );
    }

    if (!cashGame) {
      // Try fallback if database returned null
      const fallbackGame = fallbackCashGames.find(g => g.id === id);
      if (fallbackGame) {
        return NextResponse.json(fallbackGame);
      }
      return NextResponse.json(
        { error: 'Cash game not found' },
        { status: 404 }
      );
    }

    // Convert database format to frontend format
    const formattedCashGame = {
      id: cashGame.id,
      name: cashGame.name,
      stakes: cashGame.stakes,
      game: cashGame.game_type || cashGame.game_type_name || 'NLH',
      minBuyIn: cashGame.min_buyin,
      maxBuyIn: cashGame.max_buyin,
      schedule: cashGame.schedule || 'Hétfő-Vasárnap 18:00-06:00',
      active: cashGame.active === 1 || cashGame.active === true,
      featured: cashGame.featured === 1 || cashGame.featured === true,
      description: cashGame.description || '',
      image: cashGame.image_url || '',
      venue: 'Palace Poker Szombathely',
      visibleFrom: cashGame.visible_from || '2025-01-01',
      visibleUntil: cashGame.visible_until || '2025-12-31'
    };

    return NextResponse.json(formattedCashGame);
  } catch (error) {
    console.error('Error fetching cash game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cash game' },
      { status: 500 }
    );
  }
}