import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function GET() {
  try {
    // Fetch images from the database
    const images = await executeQuery(`
      SELECT 
        id,
        filename,
        original_name as title,
        filename,
        original_name as alt_text,
        COALESCE(category, 'gallery') as category,
        size_bytes as size,
        created_at
      FROM images
      WHERE mime_type LIKE 'image/%' 
        AND COALESCE(category, 'gallery') != 'tournament'
      ORDER BY created_at DESC
    `);

    // Transform the data to match the expected format
    const galleryImages = images.map(image => ({
      id: image.id,
      title: image.title || image.filename,
      filename: image.filename,
      alt_text: image.alt_text,
      category: image.category,
      created_at: image.created_at
    }));

    return NextResponse.json(galleryImages);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}