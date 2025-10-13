import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/database-postgresql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const structureId = resolvedParams.id;

    const structure = await executeQuerySingle(`
      SELECT * FROM structures WHERE id = $1
    `, [structureId]);

    if (!structure) {
      return NextResponse.json(
        { error: 'Structure not found' },
        { status: 404 }
      );
    }

    const levels = await executeQuery(`
      SELECT id, level, small_blind as smallBlind, big_blind as bigBlind, 
             ante, duration_minutes as durationMinutes, break_after as breakAfter, 
             break_duration_minutes as breakDurationMinutes
      FROM structure_levels 
      WHERE structure_id = $1 
      ORDER BY level
    `, [structureId]);

    return NextResponse.json({
      ...structure,
      levels
    });
  } catch (error) {
    console.error('Error fetching structure:', error);
    return NextResponse.json(
      { error: 'Failed to fetch structure' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const structureId = resolvedParams.id;
    const body = await request.json();
    const { name, description, starting_chips, is_active, levels = [] } = body;

    if (!name || !description || starting_chips === undefined) {
      return NextResponse.json(
        { error: 'Name, description and starting_chips are required' },
        { status: 400 }
      );
    }

    // Update structure
    await executeQuery(
      'UPDATE structures SET name = $1, description = $1, starting_chips = $1, is_active = $1 WHERE id = $1',
      [name, description, starting_chips, is_active, structureId]
    );

    // Delete existing levels
    await executeQuery('DELETE FROM structure_levels WHERE structure_id = $1', [structureId]);

    // Insert new levels
    if (levels && levels.length > 0) {
      for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        await executeQuery(
          `INSERT INTO structure_levels 
           (structure_id, level, small_blind, big_blind, ante, duration_minutes, break_after, break_duration_minutes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            structureId,
            i + 1,
            level.smallBlind || 0,
            level.bigBlind || 0,
            level.ante || 0,
            level.durationMinutes || 15,
            level.breakAfter || false,
            level.breakDurationMinutes || 0
          ]
        );
      }
    }

    return NextResponse.json({ 
      id: structureId, 
      name, 
      description, 
      starting_chips, 
      is_active,
      levels 
    });
  } catch (error) {
    console.error('Error updating structure:', error);
    return NextResponse.json(
      { error: 'Failed to update structure' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const structureId = resolvedParams.id;

    // Delete levels first (foreign key constraint)
    await executeQuery('DELETE FROM structure_levels WHERE structure_id = $1', [structureId]);
    
    // Delete structure
    await executeQuery('DELETE FROM structures WHERE id = $1', [structureId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting structure:', error);
    return NextResponse.json(
      { error: 'Failed to delete structure' },
      { status: 500 }
    );
  }
}