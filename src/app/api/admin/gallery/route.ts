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

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = 'SELECT * FROM gallery_images';
    const params: any[] = [];

    if (activeOnly) {
      query += ' WHERE active = true';
    }

    query += ' ORDER BY created_at DESC';

    const images = await executeQuery(query, params);
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

    const body = await request.json();
    const {
      title,
      filename,
      alt_text,
      category = 'gallery',
      size,
      active = true
    } = body;

    if (!title || !filename) {
      return NextResponse.json(
        { error: 'Cím és fájlnév kötelező!' },
        { status: 400 }
      );
    }

    const result = await executeInsert(`
      INSERT INTO gallery_images 
      (title, filename, alt_text, category, size, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      title,
      filename,
      alt_text || null,
      category,
      size || null,
      active ? 1 : 0
    ]);

    return NextResponse.json({
      id: result.insertId,
      message: 'Kép sikeresen hozzáadva!'
    });

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
    const {
      id,
      title,
      alt_text,
      category,
      active
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Kép ID kötelező!' },
        { status: 400 }
      );
    }

    let updateQuery = 'UPDATE gallery_images SET updated_at = NOW()';
    const params: any[] = [];

    if (title !== undefined) {
      updateQuery += ', title = $1';
      params.push(title);
    }

    if (alt_text !== undefined) {
      updateQuery += ', alt_text = $1';
      params.push(alt_text);
    }

    if (category !== undefined) {
      updateQuery += ', category = $1';
      params.push(category);
    }

    if (active !== undefined) {
      updateQuery += ', active = $1';
      params.push(active ? 1 : 0);
    }

    updateQuery += ' WHERE id = $1';
    params.push(id);

    await executeUpdate(updateQuery, params);

    return NextResponse.json({
      message: 'Kép sikeresen frissítve!'
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

    // Get image info before deletion for file cleanup
    const image = await executeQuery('SELECT filename FROM gallery_images WHERE id = $1', [parseInt(id)]);
    
    await executeUpdate('DELETE FROM gallery_images WHERE id = $1', [parseInt(id)]);

    // TODO: Delete physical file from /public/images/gallery/ directory
    // This could be implemented later with fs operations

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