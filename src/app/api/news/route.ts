import { NextResponse } from 'next/server';
import { executeQuery, executeInsert, executeUpdate } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const published = searchParams.get('status') === 'published' ? true : false;
    const featured = searchParams.get('featured');

    let query = `
      SELECT id, title, 
             LOWER(REPLACE(title, ' ', '-')) as slug,
             content, excerpt, 
             featured_image as image, 
             created_at as publish_date,
             CASE WHEN published = true THEN 'published' ELSE 'draft' END as status,
             'general' as category, 
             '' as tags, 
             featured, author, 
             CEIL(LENGTH(content) / 1000.0) as read_time,
             created_at, updated_at
      FROM news 
      WHERE published = $1
    `;
    const params: any[] = [published];
    let paramIndex = 2;

    if (featured === 'true') {
      query += ' AND featured = true';
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(parseInt(limit));
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