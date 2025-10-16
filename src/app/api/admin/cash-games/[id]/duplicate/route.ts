import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle, executeInsert } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const cashGameId = resolvedParams.id;

    // Get original cash game
    const originalCashGame = await executeQuerySingle(`
      SELECT * FROM cash_games WHERE id = $1
    `, [cashGameId]);

    if (!originalCashGame) {
      return NextResponse.json(
        { error: 'Cash game not found' },
        { status: 404 }
      );
    }

    // Create new cash game with "(másolat)" suffix
    const newCashGameName = `${originalCashGame.name} (másolat)`;
    
    console.log('Duplicating cash game:', {
      id: cashGameId,
      originalName: originalCashGame.name,
      newName: newCashGameName
    });
    
    // Use only the columns that exist in the database
    const cashGameResult = await executeInsert(
      'INSERT INTO cash_games (name, game_type_id, stakes, small_blind, big_blind, min_buyin, max_buyin, description, schedule, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        newCashGameName, 
        originalCashGame.game_type_id || null,
        originalCashGame.stakes,
        originalCashGame.small_blind,
        originalCashGame.big_blind,
        originalCashGame.min_buyin,
        originalCashGame.max_buyin,
        originalCashGame.description || null,
        originalCashGame.schedule || null,
        false // Set as inactive by default
      ]
    );

    const newCashGameId = cashGameResult.insertId;

    return NextResponse.json({
      id: newCashGameId,
      name: newCashGameName,
      game_type_id: originalCashGame.game_type_id,
      stakes: originalCashGame.stakes,
      small_blind: originalCashGame.small_blind,
      big_blind: originalCashGame.big_blind,
      min_buyin: originalCashGame.min_buyin,
      max_buyin: originalCashGame.max_buyin,
      description: originalCashGame.description,
      schedule: originalCashGame.schedule,
      active: false,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error duplicating cash game:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate cash game' },
      { status: 500 }
    );
  }
}