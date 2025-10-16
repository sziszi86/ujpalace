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

    const tournamentId = resolvedParams.id;

    // Get original tournament
    const originalTournament = await executeQuerySingle(`
      SELECT * FROM tournaments WHERE id = $1
    `, [tournamentId]);

    if (!originalTournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Create new tournament with "(másolat)" suffix
    const newTournamentTitle = `${originalTournament.title} (másolat)`;
    
    console.log('Original tournament data:', originalTournament);
    
    // Use only the essential columns that definitely exist
    const tournamentResult = await executeInsert(
      'INSERT INTO tournaments (title, description, date, buyin_amount, starting_chips, structure_id, max_players, status, featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        newTournamentTitle, 
        originalTournament.description || null,
        originalTournament.date,
        originalTournament.buyin_amount || 0,
        originalTournament.starting_chips || 15000,
        originalTournament.structure_id || null,
        originalTournament.max_players || null,
        'upcoming', // Default status
        false // Not featured by default
      ]
    );

    const newTournamentId = tournamentResult.insertId;

    return NextResponse.json({
      id: newTournamentId,
      title: newTournamentTitle,
      description: originalTournament.description,
      date: originalTournament.date,
      buyin_amount: originalTournament.buyin_amount,
      starting_chips: originalTournament.starting_chips,
      structure_id: originalTournament.structure_id,
      max_players: originalTournament.max_players,
      status: 'upcoming',
      featured: false,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error duplicating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate tournament' },
      { status: 500 }
    );
  }
}