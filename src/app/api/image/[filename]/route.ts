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

    // Check if data exists and is valid
    if (!image.data) {
      console.error(`[Images API] No image data for filename: ${filename}`);
      return NextResponse.json(
        { error: 'No image data found' },
        { status: 404 }
      );
    }
    
    try {
      // Always create a new Uint8Array from the data to avoid ByteString issues
      let imageData: Uint8Array;
      
      if (image.data instanceof Uint8Array) {
        imageData = image.data;
      } else if (Buffer.isBuffer(image.data)) {
        imageData = new Uint8Array(image.data);
      } else if (typeof image.data === 'string') {
        // If data is base64 encoded string
        const buffer = Buffer.from(image.data, 'base64');
        imageData = new Uint8Array(buffer);
      } else if (Array.isArray(image.data)) {
        // If data comes as array
        imageData = new Uint8Array(image.data);
      } else {
        console.error(`[Images API] Unexpected data type: ${typeof image.data}`, image.data?.constructor?.name);
        return NextResponse.json(
          { error: 'Invalid image data format' },
          { status: 500 }
        );
      }
      
      
      // Create a ReadableStream to avoid any ByteString conversion issues
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(imageData);
          controller.close();
        },
      });
      
      // Return the image data with proper headers using ReadableStream
      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': image.mime_type || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
      
    } catch (bufferError) {
      console.error(`[Images API] Error creating image data:`, bufferError);
      return NextResponse.json(
        { error: 'Failed to process image data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    );
  }
}