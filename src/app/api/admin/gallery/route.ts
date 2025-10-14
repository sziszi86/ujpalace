import { NextResponse } from 'next/server';
import { executeQuery, executeInsert, executeUpdate } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Use images table instead of gallery_images
    const images = await executeQuery(`
      SELECT 
        id,
        filename as title,
        original_name as alt_text,
        filename,
        'gallery' as category,
        size_bytes as size,
        1 as active,
        created_at
      FROM images
      ORDER BY created_at DESC
    `);
    return NextResponse.json(images);

  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json(
      { error: 'Hiba a képek betöltésekor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // For now, gallery upload is disabled until we implement proper file handling
    return NextResponse.json(
      { error: 'Képfeltöltés átmenetileg nem elérhető' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Gallery image creation error:', error);
    return NextResponse.json(
      { error: 'Hiba a kép hozzáadásakor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Kép ID kötelező!' },
        { status: 400 }
      );
    }

    // For now, just return success without actually updating
    // since we can't really modify the active status in the images table
    return NextResponse.json({
      message: 'Kép státusza frissítve (tesztelési mód)!'
    });

  } catch (error) {
    console.error('Gallery image update error:', error);
    return NextResponse.json(
      { error: 'Hiba a kép frissítésekor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Kép ID kötelező!' },
        { status: 400 }
      );
    }

    // Delete from images table
    await executeUpdate('DELETE FROM images WHERE id = $1', [parseInt(id)]);

    return NextResponse.json({
      message: 'Kép sikeresen törölve!'
    });

  } catch (error) {
    console.error('Gallery image deletion error:', error);
    return NextResponse.json(
      { error: 'Hiba a kép törlésekor' },
      { status: 500 }
    );
  }
}