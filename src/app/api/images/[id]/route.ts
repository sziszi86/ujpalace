import { NextResponse } from 'next/server';
import { executeQuerySingle, executeQuery } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    console.log(`[Images API] Requesting image with ID: ${id}`);
    
    if (isNaN(id)) {
      console.log(`[Images API] Invalid ID provided: ${resolvedParams.id}`);
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    console.log(`[Images API] Querying database for image ID: ${id}`);
    
    // Set a timeout for the database query (5 seconds max)
    const queryPromise = executeQuerySingle(`
      SELECT filename, original_name, mime_type, data
      FROM images 
      WHERE id = $1
    `, [id]);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000);
    });
    
    const image = await Promise.race([queryPromise, timeoutPromise]);

    if (!image) {
      console.log(`[Images API] Image not found for ID: ${id}`);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    console.log(`[Images API] Image found: ${image.filename}, size: ${image.data?.length || 0} bytes, mime: ${image.mime_type}`);

    // Check if data exists and is valid
    if (!image.data || !Buffer.isBuffer(image.data)) {
      console.error(`[Images API] Invalid image data for ID: ${id}`, typeof image.data);
      return NextResponse.json(
        { error: 'Invalid image data' },
        { status: 500 }
      );
    }

    // Return the image data with proper headers
    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.mime_type,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${image.original_name || image.filename}"`
      }
    });

  } catch (error) {
    console.error('[Images API] Error serving image:', error);
    console.error('[Images API] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    // Check if image exists
    const image = await executeQuerySingle(`
      SELECT id FROM images WHERE id = $1
    `, [id]);

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete image from database
    await executeQuery(`
      DELETE FROM images WHERE id = $1
    `, [id]);

    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}