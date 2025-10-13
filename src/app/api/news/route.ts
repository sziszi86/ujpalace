import { NextResponse } from 'next/server';
import { executeQuery, executeInsert, executeUpdate } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured');

    let query = `
      SELECT id, title, slug, content, excerpt, image, publish_date, 
             status, category, tags, featured, author, read_time, 
             created_at, updated_at
      FROM news 
      WHERE status = ?
    `;
    const params = [status];

    if (featured === 'true') {
      query += ' AND featured = 1';
    }

    query += ' ORDER BY publish_date DESC, created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const news = await executeQuery(query, params);
    
    return NextResponse.json(news);
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json(
      { error: 'Hiba a hírek betöltésekor' },
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
      slug,
      content,
      excerpt,
      image,
      publish_date,
      status = 'published',
      category,
      tags,
      featured = false,
      author,
      read_time
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Cím és tartalom kötelező!' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[áàâäã]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôöõ]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[ő]/g, 'o')
      .replace(/[ű]/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const result = await executeInsert(`
      INSERT INTO news 
      (title, slug, content, excerpt, image, publish_date, status, category, tags, featured, author, read_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      finalSlug,
      content,
      excerpt || null,
      image || null,
      publish_date || new Date().toISOString().split('T')[0],
      status,
      category || null,
      tags || null,
      featured ? 1 : 0,
      author || authResult.user.username,
      read_time || Math.ceil(content.length / 1000) // Rough estimate: 1000 chars per minute
    ]);

    return NextResponse.json({ 
      id: result.insertId,
      message: 'Hír sikeresen létrehozva!'
    });

  } catch (error) {
    console.error('News creation error:', error);
    return NextResponse.json(
      { error: 'Hiba a hír létrehozásakor' },
      { status: 500 }
    );
  }
}