import { NextResponse } from 'next/server';
import { executeQuerySingle, executeUpdate } from '@/lib/database-postgresql';

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

    // Fetch image data from database
    const image = await executeQuerySingle(`
      SELECT filename, original_name, mime_type, size_bytes, data
      FROM images WHERE id = ?
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
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if image exists
    const image = await executeQuerySingle(`
      SELECT * FROM images WHERE id = ?
    `, [imageId]);

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete from database
    const affectedRows = await executeUpdate(`
      DELETE FROM images WHERE id = ?
    `, [imageId]);
    
    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // In production, also delete the physical file
    // await fs.unlink(path.join(process.cwd(), 'uploads', image.filename));

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const imageId = parseInt(resolvedParams.id);
    const body = await request.json();

    if (isNaN(imageId)) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    const { title, alt } = body;

    // Update image metadata
    const result = await executeQuerySingle(`
      UPDATE images 
      SET title = ?, alt = ?, updated_at = NOW()
      WHERE id = ?
    `, [title || null, alt || null, imageId]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Return updated image
    const updatedImage = await executeQuerySingle(`
      SELECT * FROM images WHERE id = ?
    `, [imageId]);

    return NextResponse.json(updatedImage);

  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}