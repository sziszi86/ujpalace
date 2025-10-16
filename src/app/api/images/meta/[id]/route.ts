import { NextResponse } from 'next/server';
import { executeQuerySingle } from '@/lib/database-postgresql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    console.log(`[Images Meta API] Requesting image metadata for ID: ${id}`);
    
    if (isNaN(id)) {
      console.log(`[Images Meta API] Invalid ID provided: ${resolvedParams.id}`);
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    console.log(`[Images Meta API] Querying database for image metadata ID: ${id}`);
    const image = await executeQuerySingle(`
      SELECT id, filename, original_name, mime_type, size_bytes, created_at,
             LENGTH(data) as data_length
      FROM images 
      WHERE id = $1
    `, [id]);

    if (!image) {
      console.log(`[Images Meta API] Image not found for ID: ${id}`);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    console.log(`[Images Meta API] Image metadata found: ${image.filename}, size: ${image.data_length} bytes`);

    return NextResponse.json({
      id: image.id,
      filename: image.filename,
      originalName: image.original_name,
      mimeType: image.mime_type,
      size: image.size_bytes,
      dataLength: image.data_length,
      createdAt: image.created_at,
      url: `/api/images/${image.id}`
    });

  } catch (error) {
    console.error('[Images Meta API] Error getting image metadata:', error);
    return NextResponse.json(
      { error: 'Failed to get image metadata' },
      { status: 500 }
    );
  }
}