import { NextResponse } from 'next/server';
import { executeQuery, executeInsert, executeUpdate, executeQuerySingle } from '@/lib/database-postgresql';
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

    let query = 'SELECT * FROM banners';
    const params: any[] = [];

    if (activeOnly) {
      query += ' WHERE active = true';
    }

    query += ' ORDER BY order_index ASC, created_at DESC';

    const banners = await executeQuery(query, params);
    return NextResponse.json(banners);

  } catch (error) {
    console.error('Banners fetch error:', error);
    return NextResponse.json(
      { error: 'Hiba a bannerek betöltésekor' },
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
      description,
      image_url,
      url,
      order_index = 0,
      active = true,
      visible_from,
      visible_until
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Cím és leírás kötelező!' },
        { status: 400 }
      );
    }

    const result = await executeInsert(`
      INSERT INTO banners 
      (title, description, image_url, link_url, order_index, active)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      title,
      description,
      image_url || null,
      url || null,
      order_index,
      active ? true : false
    ]);

    return NextResponse.json({
      id: result.insertId,
      message: 'Banner sikeresen létrehozva!'
    });

  } catch (error) {
    console.error('Banner creation error:', error);
    return NextResponse.json(
      { error: 'Hiba a banner létrehozásakor' },
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
      description,
      image_url,
      url,
      order_index,
      active,
      visible_from,
      visible_until
    } = body;

    if (!id || !title || !description) {
      return NextResponse.json(
        { error: 'ID, cím és leírás kötelező!' },
        { status: 400 }
      );
    }

    await executeUpdate(`
      UPDATE banners 
      SET title = $1, description = $2, image_url = $3, link_url = $4, order_index = $5, 
          active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [
      title,
      description,
      image_url || null,
      url || null,
      order_index || 0,
      active ? true : false,
      id
    ]);

    return NextResponse.json({
      message: 'Banner sikeresen frissítve!'
    });

  } catch (error) {
    console.error('Banner update error:', error);
    return NextResponse.json(
      { error: 'Hiba a banner frissítésekor' },
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
        { error: 'Banner ID kötelező!' },
        { status: 400 }
      );
    }

    await executeUpdate('DELETE FROM banners WHERE id = $1', [parseInt(id)]);

    return NextResponse.json({
      message: 'Banner sikeresen törölve!'
    });

  } catch (error) {
    console.error('Banner deletion error:', error);
    return NextResponse.json(
      { error: 'Hiba a banner törlésekor' },
      { status: 500 }
    );
  }
}