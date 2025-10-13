import { NextResponse } from 'next/server';
import { executeQuery, executeInsert } from '@/lib/database-postgresql';

export async function GET() {
  try {
    const structures = await executeQuery(`
      SELECT s.*, 
             GROUP_CONCAT(
               JSON_OBJECT(
                 'id', sl.id,
                 'level', sl.level,
                 'smallBlind', sl.small_blind,
                 'bigBlind', sl.big_blind,
                 'ante', sl.ante,
                 'durationMinutes', sl.duration_minutes,
                 'breakAfter', sl.break_after,
                 'breakDurationMinutes', sl.break_duration_minutes
               ) ORDER BY sl.level
             ) as levels_json
      FROM structures s
      LEFT JOIN structure_levels sl ON s.id = sl.structure_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);

    const processedStructures = structures.map(structure => ({
      ...structure,
      levels: structure.levels_json ? 
        JSON.parse(`[${structure.levels_json}]`) : []
    }));

    return NextResponse.json(processedStructures);
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
      'INSERT INTO structures (name, description, starting_chips, is_active) VALUES (?, ?, ?, ?)',
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
           (structure_id, level, small_blind, big_blind, ante, duration_minutes, break_after, break_duration_minutes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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