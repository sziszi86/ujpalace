import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tournamentId = parseInt(resolvedParams.id);

    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: 'Invalid tournament ID' },
        { status: 400 }
      );
    }

    // Check if tournament has a structure_id
    const tournamentResult = await executeQuery(`
      SELECT structure_id FROM tournaments WHERE id = $1
    `, [tournamentId]);

    if (!tournamentResult || tournamentResult.length === 0 || !tournamentResult[0].structure_id) {
      return NextResponse.json([]);
    }

    const structureId = tournamentResult[0].structure_id;

    // Get structure levels
    const levels = await executeQuery(`
      SELECT 
        id,
        level_number as level,
        small_blind as "smallBlind",
        big_blind as "bigBlind",
        ante,
        duration_minutes as "durationMinutes",
        break_after as "breakAfter",
        break_duration_minutes as "breakDurationMinutes"
      FROM structure_levels 
      WHERE structure_id = $1 
      ORDER BY level_number ASC
    `, [structureId]);

    return NextResponse.json(levels || []);
  } catch (error) {
    console.error('Error fetching tournament structure:', error);
    return NextResponse.json([]);
  }
}