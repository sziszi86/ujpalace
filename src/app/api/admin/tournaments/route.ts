import { NextResponse } from 'next/server';
import { getAllTournaments, createTournament, updateTournament, deleteTournament } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Get all tournaments (including inactive ones for admin)
    const tournaments = await getAllTournaments(undefined, undefined, undefined);
    
    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/admin/tournaments called');
    
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      console.log('Auth failed:', authResult.error);
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    console.log('Auth successful, user:', authResult.user);
    
    const tournamentData = await request.json();
    console.log('Received tournament data:', JSON.stringify(tournamentData, null, 2));
    
    // Validation
    if (!tournamentData.title || !tournamentData.date || !tournamentData.time) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Title, date, and time are required' },
        { status: 400 }
      );
    }

    console.log('Validation passed, calling createTournament...');
    const result = await createTournament(tournamentData);
    console.log('Tournament created successfully:', result);
    
    return NextResponse.json({ id: result.insertId, ...tournamentData }, { status: 201 });
  } catch (error) {
    console.error('Error creating tournament:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const tournamentData = await request.json();
    
    if (!tournamentData.id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    const affectedRows = await updateTournament(tournamentData.id, tournamentData);
    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, affectedRows });
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    const tournamentId = parseInt(id);
    const affectedRows = await deleteTournament(tournamentId);
    
    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    );
  }
}