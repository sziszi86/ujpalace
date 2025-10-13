import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function GET() {
  try {
    const images = await executeQuery(`
      SELECT 
        g.id,
        g.title,
        g.description as alt_text,
        g.category,
        g.created_at,
        i.filename,
        i.original_name
      FROM gallery g
      LEFT JOIN gallery_images gi ON g.id = gi.gallery_id
      LEFT JOIN images i ON gi.image_id = i.id
      WHERE g.featured = true OR g.featured IS NULL
      ORDER BY g.created_at DESC
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