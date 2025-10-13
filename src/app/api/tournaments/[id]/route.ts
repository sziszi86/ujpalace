import { NextResponse } from 'next/server';
import { executeQuerySingle } from '@/lib/database-postgresql';

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

    const tournament = await executeQuerySingle(`
      SELECT 
        t.*,
        t.date as tournament_date,
        EXTRACT(HOUR FROM t.date) || ':' || LPAD(EXTRACT(MINUTE FROM t.date)::text, 2, '0') as tournament_time,
        t.buyin_amount as buy_in,
        t.starting_chips,
        'Tournament' as category_name
      FROM tournaments t
      WHERE t.id = $1 AND t.status != 'inactive'
    `, [tournamentId]);

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}