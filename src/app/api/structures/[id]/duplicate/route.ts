import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle, executeInsert } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

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
    
    console.log('Duplicating structure:', {
      id: structureId,
      originalName: originalStructure.name,
      newName: newStructureName,
      originalLevelsCount: originalLevels.length
    });
    
    const structureResult = await executeInsert(
      'INSERT INTO structures (name, description, starting_chips, level_duration, late_registration_levels, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
      [newStructureName, originalStructure.description, originalStructure.starting_chips, originalStructure.level_duration || 20, originalStructure.late_registration_levels || 0, false]
    );
    
    console.log('Structure created with ID:', structureResult.insertId);

    const newStructureId = structureResult.insertId;

    // Copy levels and get their IDs for proper response
    console.log(`Copying ${originalLevels.length} levels for structure ${newStructureId}`);
    
    const newLevels = [];
    for (const level of originalLevels) {
      console.log('Copying level:', {
        level_number: level.level_number,
        small_blind: level.small_blind,
        big_blind: level.big_blind,
        ante: level.ante
      });
      
      try {
        const levelResult = await executeInsert(
          `INSERT INTO structure_levels 
           (structure_id, level_number, small_blind, big_blind, ante, duration_minutes, break_after, break_duration_minutes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            newStructureId,
            level.level_number,
            level.small_blind,
            level.big_blind,
            level.ante || 0,
            level.duration_minutes || 20,
            level.break_after || false,
            level.break_duration_minutes || 0
          ]
        );
        
        // Add the new level with proper ID to our array
        newLevels.push({
          id: levelResult.insertId,
          level: level.level_number,
          smallBlind: level.small_blind,
          bigBlind: level.big_blind,
          ante: level.ante || 0,
          durationMinutes: level.duration_minutes || 20,
          breakAfter: level.break_after || false,
          breakDurationMinutes: level.break_duration_minutes || 0
        });
      } catch (levelError) {
        console.error('Error copying level:', levelError);
        throw levelError;
      }
    }

    console.log('All levels copied successfully!');

    return NextResponse.json({
      id: newStructureId,
      name: newStructureName,
      description: originalStructure.description,
      starting_chips: originalStructure.starting_chips,
      level_duration: originalStructure.level_duration,
      late_registration_levels: originalStructure.late_registration_levels,
      is_active: false,
      created_at: new Date().toISOString(),
      levels: newLevels
    });
  } catch (error) {
    console.error('Error duplicating structure:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate structure' },
      { status: 500 }
    );
  }
}