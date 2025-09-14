import { NextRequest, NextResponse } from 'next/server';
import { getAllTournaments, createTournament, updateTournament, deleteTournament } from '@/lib/db';

export async function GET() {
  try {
    const tournaments = await getAllTournaments();
    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    // Fallback to only in-memory tournaments
    return NextResponse.json(memoryTournaments);
  }
}

// In-memory storage for fallback with default tournaments
let memoryTournaments: any[] = [
  {
    id: 1,
    title: 'Weekend Main Event',
    description: 'Hétvégi főesemény nagy nyereményekkel!',
    date: '2025-01-11',
    time: '18:00',
    buyIn: 15000,
    guarantee: 100000,
    maxPlayers: 120,
    structure: 'Freezeout',
    blindStructure: '20 perc',
    startingChips: 20000,
    lateRegistration: true,
    lateRegistrationUntil: '3 szint',
    featured: true,
    visibleFrom: '2025-01-01',
    visibleUntil: '2025-12-31',
    image: '',
    status: 'upcoming',
    currentPlayers: 0,
    venue: 'Palace Poker Szombathely'
  },
  {
    id: 2,
    title: 'Daily Deepstack',
    description: 'Napi mély stack verseny türelmes játékosoknak.',
    date: '2025-01-12',
    time: '20:00',
    buyIn: 8000,
    guarantee: 50000,
    maxPlayers: 80,
    structure: 'Freezeout',
    blindLevels: '25 perc',
    startingStack: 30000,
    lateRegistration: '4 szint',
    rebuyAddon: 'Nincs',
    featured: false,
    active: true,
    visibleFrom: '2025-01-01',
    visibleUntil: '2025-12-31',
    image: '',
    status: 'upcoming',
    currentPlayers: 0,
    venue: 'Palace Poker Szombathely'
  }
];

export async function POST(request: NextRequest) {
  try {
    const tournamentData: any = await request.json();
    
    // Validáció
    if (!tournamentData.title || !tournamentData.date || !tournamentData.time) {
      return NextResponse.json({ error: 'Title, date, and time are required' }, { status: 400 });
    }

    try {
      const newTournament = await createTournament(tournamentData);
      return NextResponse.json(newTournament, { status: 201 });
    } catch (dbError) {
      // Fallback to in-memory storage
      console.log('Database not available, using in-memory storage');
      const newId = Math.max(...memoryTournaments.map(t => t.id), 0) + 1;
      const newTournament: any = {
        ...tournamentData,
        id: newId,
        status: tournamentData.status || 'upcoming',
        currentPlayers: 0,
        venue: tournamentData.venue || 'Palace Poker Szombathely',
        visibleFrom: tournamentData.visibleFrom || new Date().toISOString().split('T')[0],
        visibleUntil: tournamentData.visibleUntil || '2025-12-31'
      };
      memoryTournaments.push(newTournament);
      return NextResponse.json(newTournament, { status: 201 });
    }
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

    try {
      const updatedTournament = await updateTournament(tournamentData.id, tournamentData);
      // Also update in-memory if exists
      const memoryIndex = memoryTournaments.findIndex(t => t.id === tournamentData.id);
      if (memoryIndex >= 0) {
        memoryTournaments[memoryIndex] = tournamentData;
      }
      return NextResponse.json(updatedTournament);
    } catch (dbError) {
      // Fallback to in-memory update
      console.log('Database not available, updating in-memory storage');
      const memoryIndex = memoryTournaments.findIndex(t => t.id === tournamentData.id);
      if (memoryIndex >= 0) {
        memoryTournaments[memoryIndex] = tournamentData;
        return NextResponse.json(tournamentData);
      } else {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      }
    }
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

    try {
      await deleteTournament(tournamentId);
      // Also remove from in-memory if exists
      const memoryIndex = memoryTournaments.findIndex(t => t.id === tournamentId);
      if (memoryIndex >= 0) {
        memoryTournaments.splice(memoryIndex, 1);
      }
      return NextResponse.json({ success: true });
    } catch (dbError) {
      // Fallback to in-memory delete
      console.log('Database not available, deleting from in-memory storage');
      const memoryIndex = memoryTournaments.findIndex(t => t.id === tournamentId);
      if (memoryIndex >= 0) {
        memoryTournaments.splice(memoryIndex, 1);
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      }
    }
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json({ error: 'Failed to delete tournament' }, { status: 500 });
  }
}