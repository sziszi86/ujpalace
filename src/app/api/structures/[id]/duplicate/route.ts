import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle, executeInsert } from '@/lib/database-postgresql';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const structureId = resolvedParams.id;

    // Get original structure
    const originalStructure = await executeQuerySingle(`
      SELECT * FROM structures WHERE id = $1
    `, [structureId]);

    if (!originalStructure) {
      return NextResponse.json(
        { error: 'Structure not found' },
        { status: 404 }
      );
    }

    // Get original levels
    const originalLevels = await executeQuery(`
      SELECT * FROM structure_levels WHERE structure_id = $1 ORDER BY level_number
    `, [structureId]);

    // Create new structure
    const newStructureName = `${originalStructure.name} (másolat)`;
    const structureResult = await executeInsert(
      'INSERT INTO structures (name, description, starting_chips, is_active) VALUES ($1, $2, $3, $4)',
      [newStructureName, originalStructure.description, originalStructure.starting_chips, false]
    );

    const newStructureId = structureResult.insertId;

    // Copy levels
    for (const level of originalLevels) {
      await executeQuery(
        `INSERT INTO structure_levels 
         (structure_id, level_number, small_blind, big_blind, ante, duration_minutes, break_after, break_duration_minutes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          newStructureId,
          level.level_number,
          level.small_blind,
          level.big_blind,
          level.ante,
          level.duration_minutes,
          level.break_after,
          level.break_duration_minutes
        ]
      );
    }

    return NextResponse.json({
      id: newStructureId,
      name: newStructureName,
      description: originalStructure.description,
      starting_chips: originalStructure.starting_chips,
      is_active: false,
      created_at: new Date().toISOString(),
      levels: originalLevels.map(level => ({
        level: level.level_number,
        smallBlind: level.small_blind,
        bigBlind: level.big_blind,
        ante: level.ante,
        durationMinutes: level.duration_minutes,
        breakAfter: level.break_after,
        breakDurationMinutes: level.break_duration_minutes
      }))
    });
  } catch (error) {
    console.error('Error duplicating structure:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate structure' },
      { status: 500 }
    );
  }
}