import { NextResponse } from 'next/server';
import { executeQuery, executeInsert } from '@/lib/database-postgresql';

export async function GET() {
  try {
    // First get all structures
    const structures = await executeQuery(`
      SELECT * FROM structures 
      ORDER BY created_at DESC
    `);

    // Then get levels for each structure
    const structuresWithLevels = await Promise.all(
      structures.map(async (structure) => {
        const levels = await executeQuery(`
          SELECT 
            id,
            level_number as "level",
            small_blind as "smallBlind",
            big_blind as "bigBlind",
            ante,
            duration_minutes as "durationMinutes",
            break_after as "breakAfter",
            break_duration_minutes as "breakDurationMinutes"
          FROM structure_levels 
          WHERE structure_id = $1 
          ORDER BY level_number
        `, [structure.id]);

        return {
          ...structure,
          levels: levels || []
        };
      })
    );

    return NextResponse.json(structuresWithLevels);
  } catch (error) {
    console.error('Error fetching structures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch structures' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, starting_chips, is_active = true, levels = [] } = body;

    if (!name || !description || !starting_chips) {
      return NextResponse.json(
        { error: 'Name, description and starting_chips are required' },
        { status: 400 }
      );
    }

    // Insert structure
    const structureResult = await executeInsert(
      'INSERT INTO structures (name, description, starting_chips, is_active) VALUES ($1, $2, $3, $4)',
      [name, description, starting_chips, is_active]
    );

    const structureId = structureResult.insertId;

    // Insert levels
    if (levels && levels.length > 0) {
      const levelInserts = levels.map((level: any, index: number) => [
        structureId,
        index + 1,
        level.smallBlind || 0,
        level.bigBlind || 0,
        level.ante || 0,
        level.durationMinutes || 15,
        level.breakAfter || false,
        level.breakDurationMinutes || 0
      ]);

      for (const levelData of levelInserts) {
        await executeQuery(
          `INSERT INTO structure_levels 
           (structure_id, level_number, small_blind, big_blind, ante, duration_minutes, break_after, break_duration_minutes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          levelData
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
    console.error('Error creating structure:', error);
    return NextResponse.json(
      { error: 'Failed to create structure' },
      { status: 500 }
    );
  }
}