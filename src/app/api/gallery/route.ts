import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function GET() {
  try {
    const images = await executeQuery(`
      SELECT id, title, filename, alt_text, category, created_at
      FROM gallery_images 
      WHERE active = 1 
      ORDER BY created_at DESC
    `);

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}