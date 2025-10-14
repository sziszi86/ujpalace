import { NextRequest, NextResponse } from 'next/server';
import { executeQuerySingle } from '@/lib/database-postgresql';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Fetch image data from database
    const image = await executeQuerySingle(`
      SELECT 
        filename,
        original_name,
        mime_type,
        size_bytes,
        data
      FROM images
      WHERE filename = $1
    `, [filename]);

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Return the image data with proper headers
    return new NextResponse(image.data, {
      status: 200,
      headers: {
        'Content-Type': image.mime_type,
        'Content-Length': image.size_bytes.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${image.original_name}"`,
      },
    });

  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    );
  }
}