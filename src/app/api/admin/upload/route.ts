import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { executeInsert } from '@/lib/database';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface UploadResult {
  filename: string;
  originalName: string;
  size: number;
  optimizedSize: number;
  category: string;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'gallery';

    if (!file) {
      return NextResponse.json(
        { error: 'Nincs fájl kiválasztva!' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Csak JPG, PNG és WebP fájlok engedélyezettek!' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'A fájl túl nagy! Maximum 10MB engedélyezett.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Determine upload directory based on category
    const uploadDir = category === 'banner' ? 'banners' : 'gallery';
    const uploadsPath = join(process.cwd(), 'public', 'images', uploadDir);
    
    try {
      await mkdir(uploadsPath, { recursive: true });
    } catch (error) {
      // Directory already exists, continue
    }

    const filePath = join(uploadsPath, filename);

    try {
      // Optimize image with Sharp
      let optimizedBuffer: Buffer = new Uint8Array(buffer) as Buffer;
      let optimizedSize = buffer.length;

      // Only optimize if the image is larger than 1MB
      if (buffer.length > 1024 * 1024) {
        optimizedBuffer = await sharp(optimizedBuffer)
          .resize(1920, 1080, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 85, 
            progressive: true 
          })
          .toBuffer();
        
        optimizedSize = optimizedBuffer.length;
      }

      // Write optimized file
      await writeFile(filePath, optimizedBuffer);

      // Save to database
      const title = file.name.split('.')[0]; // Remove extension for title
      
      const result = await executeInsert(`
        INSERT INTO gallery_images 
        (title, filename, alt_text, category, size, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
      `, [
        title,
        filename,
        `${title} - Palace Poker Szombathely`,
        category,
        optimizedSize
      ]);

      const uploadResult: UploadResult = {
        filename,
        originalName: file.name,
        size: file.size,
        optimizedSize,
        category
      };

      return NextResponse.json({
        success: true,
        message: 'Fájl sikeresen feltöltve és optimalizálva!',
        data: uploadResult,
        imageId: result.insertId,
        savings: file.size > optimizedSize ? 
          `${((file.size - optimizedSize) / file.size * 100).toFixed(1)}% méretcsökkentés` : 
          'Nincs optimalizálás szükséges'
      });

    } catch (sharpError) {
      console.error('Image optimization error:', sharpError);
      
      // Fallback: save original file without optimization
      await writeFile(filePath, buffer);
      
      const title = file.name.split('.')[0];
      
      const result = await executeInsert(`
        INSERT INTO gallery_images 
        (title, filename, alt_text, category, size, active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
      `, [
        title,
        filename,
        `${title} - Palace Poker Szombathely`,
        category,
        file.size
      ]);

      return NextResponse.json({
        success: true,
        message: 'Fájl feltöltve (optimalizálás nélkül)',
        data: {
          filename,
          originalName: file.name,
          size: file.size,
          optimizedSize: file.size,
          category
        },
        imageId: result.insertId,
        savings: 'Optimalizálás sikertelen, eredeti fájl mentve'
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Hiba a fájl feltöltésekor',
        details: error instanceof Error ? error.message : 'Ismeretlen hiba'
      },
      { status: 500 }
    );
  }
}