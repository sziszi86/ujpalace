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
      SELECT n.id, n.title, 
             n.content, n.excerpt, 
             n.featured_image as image_url,
             n.featured_image as image, 
             n.created_at as publish_date,
             CASE WHEN n.published = true THEN 'published' ELSE 'draft' END as status,
             n.featured, n.author, 
             n.created_at, n.updated_at,
             nc.name as category
      FROM news n
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      WHERE n.published = $1
    `;
    const params: any[] = [status === 'published'];

    if (featured === 'true') {
      query += ' AND featured = true';
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ' LIMIT $2';
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
      category_id,
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
      (title, content, excerpt, featured_image, published, featured, author, category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      title,
      content,
      excerpt || null,
      image || null,
      status === 'published',
      featured ? true : false,
      author || authResult.user.username,
      category_id ? parseInt(category_id) : null
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