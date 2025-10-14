import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Restore backup
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const backupId = resolvedParams.id;
    
    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

    // Security check: ensure the filename doesn't contain path traversal
    if (backupId.includes('..') || backupId.includes('/') || backupId.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid backup file name' },
        { status: 400 }
      );
    }

    const backupPath = path.join(BACKUP_DIR, backupId);
    
    // Check if backup file exists
    try {
      await fs.access(backupPath);
    } catch {
      return NextResponse.json(
        { error: 'Backup file not found' },
        { status: 404 }
      );
    }

    // Get database connection details from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    console.log(`Starting restore process for backup: ${backupId}`);

    // Create a timestamp for logging
    const restoreStartTime = new Date();
    
    // Execute the restore using psql from PostgreSQL 17
    const psqlPath = '/opt/homebrew/opt/postgresql@17/bin/psql';
    const restoreCommand = `"${psqlPath}" "${databaseUrl}" -f "${backupPath}"`;
    
    console.log('Executing restore command:', restoreCommand.replace(databaseUrl, '[DATABASE_URL]'));

    const { stdout, stderr } = await execAsync(restoreCommand);
    
    // Log any output
    if (stdout) {
      console.log('Restore stdout:', stdout);
    }
    
    if (stderr && !stderr.includes('NOTICE') && !stderr.includes('does not exist, skipping')) {
      console.error('Restore stderr:', stderr);
      // Don't fail on warnings, but log them
    }

    // Verify the restore by checking some basic tables
    try {
      const [verificationResult] = await executeQuery(`
        SELECT 
          (SELECT COUNT(*) FROM tournaments) as tournaments,
          (SELECT COUNT(*) FROM players) as players,
          (SELECT COUNT(*) FROM cash_games) as cash_games,
          (SELECT COUNT(*) FROM banners) as banners
      `);
      
      console.log('Post-restore verification:', verificationResult);
      
      return NextResponse.json({
        success: true,
        message: `Adatbázis sikeresen visszaállítva a ${backupId} mentésből`,
        restoredAt: new Date().toISOString(),
        backupFile: backupId,
        verificationData: verificationResult,
        duration: `${Math.round((new Date().getTime() - restoreStartTime.getTime()) / 1000)}s`
      });
      
    } catch (verifyError) {
      console.error('Verification failed after restore:', verifyError);
      return NextResponse.json(
        { 
          error: 'Restore completed but verification failed. Database may be in an inconsistent state.',
          details: (verifyError as Error).message
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error during restore:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup: ' + (error as Error).message },
      { status: 500 }
    );
  }
}