import { NextResponse } from 'next/server';
import { getTournamentById, updateTournament, deleteTournament } from '@/lib/database-postgresql';
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
    const tournamentId = parseInt(resolvedParams.id);

    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: 'Invalid tournament ID' },
        { status: 400 }
      );
    }

    console.log('GET /api/admin/tournaments/[id] called with ID:', tournamentId);
    
    const tournament = await getTournamentById(tournamentId);

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
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
    const tournamentId = parseInt(resolvedParams.id);

    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: 'Invalid tournament ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      date,
      time,
      buy_in,
      guarantee_amount,
      structure,
      max_players,
      status,
      featured,
      image_url,
      special_notes
    } = body;

    if (!title || !date || !time) {
      return NextResponse.json(
        { error: 'Title, date and time are required' },
        { status: 400 }
      );
    }

    const affectedRows = await executeUpdate(`
      UPDATE tournaments 
      SET title = $1, description = $2, category = $3, date = $4, time = $5,
          buy_in = $6, guarantee_amount = $7, structure = $8, max_players = $9,
          status = $10, featured = $11, image_url = $12, special_notes = $13,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
    `, [
      title,
      description || null,
      category || null,
      date,
      time,
      parseFloat(buy_in) || 0,
      parseFloat(guarantee_amount) || null,
      structure || null,
      parseInt(max_players) || null,
      status || 'upcoming',
      featured ? true : false,
      image_url || null,
      special_notes || null,
      tournamentId
    ]);

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Tournament updated successfully'
    });
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to update tournament' },
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
    const tournamentId = parseInt(resolvedParams.id);

    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: 'Invalid tournament ID' },
        { status: 400 }
      );
    }

    const affectedRows = await executeUpdate(`
      DELETE FROM tournaments WHERE id = $1
    `, [tournamentId]);

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    );
  }
}