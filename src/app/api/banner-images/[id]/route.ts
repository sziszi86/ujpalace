import { NextResponse } from 'next/server';
import { executeQuerySingle } from '@/lib/database-postgresql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const imageId = parseInt(resolvedParams.id);

    if (isNaN(imageId)) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    // Fetch image data from banner_images table
    const image = await executeQuerySingle(`
      SELECT filename, original_name, mime_type, size_bytes, data
      FROM banner_images WHERE id = $1
    `, [imageId]);

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Serve the actual image data
    const buffer = Buffer.from(image.data);
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': image.mime_type || 'image/jpeg',
        'Content-Length': image.size_bytes.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Disposition': `inline; filename="${image.filename}"`,
      },
    });

  } catch (error) {
    console.error('Error fetching banner image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}