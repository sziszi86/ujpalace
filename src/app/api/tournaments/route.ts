import { NextRequest, NextResponse } from 'next/server';
import { getAllTournaments, createTournament, updateTournament, deleteTournament } from '@/lib/database';

export async function GET() {
  try {
    const tournaments = await getAllTournaments();
    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const tournamentData: any = await request.json();
    
    // Validáció
    if (!tournamentData.title || !tournamentData.tournament_date || !tournamentData.tournament_time) {
      return NextResponse.json({ error: 'Title, tournament_date, and tournament_time are required' }, { status: 400 });
    }

    const result = await createTournament(tournamentData);
    return NextResponse.json({ id: result.insertId, ...tournamentData }, { status: 201 });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tournamentData: any = await request.json();
    
    if (!tournamentData.id) {
      return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
    }

    const affectedRows = await updateTournament(tournamentData.id, tournamentData);
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, affectedRows });
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json({ error: 'Failed to update tournament' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
    }

    const tournamentId = parseInt(id);
    const affectedRows = await deleteTournament(tournamentId);
    
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json({ error: 'Failed to delete tournament' }, { status: 500 });
  }
}