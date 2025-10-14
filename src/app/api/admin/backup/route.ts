import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BackupFile {
  id: string;
  name: string;
  size: string;
  date: string;
  type: 'database' | 'full';
}

const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Get list of backup files
export async function GET() {
  try {
    // Ensure backup directory exists
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    // Read actual backup files from directory
    const files = await fs.readdir(BACKUP_DIR);
    const backups: BackupFile[] = [];

    for (const file of files) {
      if (file.endsWith('.sql') || file.endsWith('.tar.gz')) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        
        backups.push({
          id: file,
          name: file,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          date: stats.mtime.toISOString(),
          type: file.endsWith('.sql') ? 'database' : 'full'
        });
      }
    }

    // Sort by date (newest first)
    backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ backups });
  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    );
  }
}

// Create new backup
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    // Ensure backup directory exists
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // Get database connection details from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    // Generate backup filename
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '_') + '_' + 
                     new Date().toTimeString().split(':').slice(0, 2).join('_');
    const backupName = name ? 
      `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.sql` : 
      `palace_poker_backup_${timestamp}.sql`;
    
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Create PostgreSQL backup using pg_dump from PostgreSQL 17
    const pgDumpPath = '/opt/homebrew/opt/postgresql@17/bin/pg_dump';
    const pgDumpCommand = `"${pgDumpPath}" "${databaseUrl}" --verbose --clean --no-acl --no-owner --format=plain --file="${backupPath}"`;
    
    console.log('Creating backup with command:', pgDumpCommand.replace(databaseUrl, '[DATABASE_URL]'));

    const { stdout, stderr } = await execAsync(pgDumpCommand);
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.error('pg_dump stderr:', stderr);
    }
    
    // Verify the backup file was created and get its size
    const stats = await fs.stat(backupPath);
    
    // Get database statistics for backup info
    const [tableStats] = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM tournaments) as tournaments,
        (SELECT COUNT(*) FROM players) as players,
        (SELECT COUNT(*) FROM player_transactions) as transactions,
        (SELECT COUNT(*) FROM cash_games) as cash_games,
        (SELECT COUNT(*) FROM banners) as banners,
        (SELECT COUNT(*) FROM about_pages) as about_pages,
        (SELECT COUNT(*) FROM news) as news,
        (SELECT COUNT(*) FROM gallery_images) as gallery_images
    `);

    const backupInfo = {
      id: backupName,
      name: backupName,
      type: 'database',
      size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      created: new Date().toISOString(),
      tables: tableStats,
      success: true,
      message: `Biztonsági mentés sikeresen létrehozva: ${backupName}`
    };

    return NextResponse.json(backupInfo);
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Delete backup file
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const backupName = url.searchParams.get('file');

    if (!backupName) {
      return NextResponse.json(
        { error: 'Backup file name is required' },
        { status: 400 }
      );
    }

    // Security check: ensure the filename doesn't contain path traversal
    if (backupName.includes('..') || backupName.includes('/') || backupName.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid backup file name' },
        { status: 400 }
      );
    }

    const backupPath = path.join(BACKUP_DIR, backupName);
    
    // Check if file exists before attempting to delete
    try {
      await fs.access(backupPath);
    } catch {
      return NextResponse.json(
        { error: 'Backup file not found' },
        { status: 404 }
      );
    }

    // Delete the actual file
    await fs.unlink(backupPath);
    console.log(`Deleted backup file: ${backupName}`);

    return NextResponse.json({ 
      success: true, 
      message: `Backup ${backupName} deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup: ' + (error as Error).message },
      { status: 500 }
    );
  }
}