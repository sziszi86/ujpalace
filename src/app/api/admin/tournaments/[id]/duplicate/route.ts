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
    const tournamentResult = await executeInsert(
      'INSERT INTO tournaments (title, description, date, buyin_amount, starting_chips, structure_id, max_players, status, featured, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        newTournamentTitle, 
        originalTournament.description,
        originalTournament.date,
        originalTournament.buyin_amount,
        originalTournament.starting_chips,
        originalTournament.structure_id,
        originalTournament.max_players,
        'upcoming', // Default status
        false, // Not featured by default
        originalTournament.image_url
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
      image_url: originalTournament.image_url,
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