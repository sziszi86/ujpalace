import { NextResponse } from 'next/server';
import { getCashGameById } from '@/lib/database-postgresql';

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

    const cashGame = await getCashGameById(id);
    
    if (!cashGame) {
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
      minBuyIn: cashGame.min_buy_in,
      maxBuyIn: cashGame.max_buy_in,
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