import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeInsert } from '@/lib/database-postgresql';
import sharp from 'sharp';

// GET - List all images for gallery
export async function GET() {
  try {
    const images = await executeQuery(`
      SELECT id, filename, original_name, mime_type, size_bytes, created_at
      FROM images 
      ORDER BY created_at DESC
    `);
    
    // Transform to format expected by ImageUploader
    const formattedImages = images.map((img: any) => ({
      id: img.id,
      url: `/api/images/${img.id}`, // URL to fetch the actual image
      originalName: img.original_name || img.filename,
      filename: img.filename,
      mimeType: img.mime_type,
      size: img.size_bytes,
      createdAt: img.created_at
    }));
    
    return NextResponse.json(formattedImages);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST - Upload new image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const category = (formData.get('category') as string) || 'gallery';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }
    
    // Validate file size (500KB limit for Vercel)
    if (file.size > 500 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500KB' },
        { status: 400 }
      );
    }
    
    // Read file data
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Optimize image using Sharp
    let processedBuffer: Buffer = new Uint8Array(buffer) as Buffer;
    let mimeType = file.type;
    
    try {
      // Convert to WebP for better compression and resize for Vercel
      processedBuffer = await sharp(processedBuffer)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 70 })
        .toBuffer();
      mimeType = 'image/webp';
    } catch (sharpError) {
      console.warn('Sharp optimization failed, using original file:', sharpError);
      // Fall back to original file if Sharp fails
      processedBuffer = buffer;
      mimeType = file.type;
    }
    
    // Generate filename
    const timestamp = Date.now();
    const extension = mimeType === 'image/webp' ? 'webp' : file.name.split('.').pop();
    const filename = `${timestamp}.${extension}`;
    
    // Save to database
    const result = await executeInsert(`
      INSERT INTO images (filename, original_name, mime_type, size_bytes, data, category)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [filename, file.name, mimeType, processedBuffer.length, processedBuffer, category]);
    
    return NextResponse.json({
      id: result.insertId,
      url: `/api/images/${result.insertId}`,
      filename,
      originalName: file.name,
      mimeType,
      size: processedBuffer.length
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}