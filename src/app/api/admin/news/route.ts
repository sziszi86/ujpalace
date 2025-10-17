import { NextResponse } from 'next/server';
import { executeQuery, executeUpdate } from '@/lib/database-postgresql';
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

    const articles = await executeQuery(`
      SELECT 
        n.*,
        n.featured_image as image_url,
        CASE WHEN n.published THEN 'published' ELSE 'draft' END as status,
        nc.name as category_name,
        n.created_at,
        n.updated_at
      FROM news n
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      ORDER BY n.created_at DESC
    `);

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching news articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
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
      content,
      excerpt,
      featured_image,
      author,
      category_id,
      featured,
      published
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const result = await executeQuery(`
      INSERT INTO news (title, content, excerpt, featured_image, author, category_id, featured, published, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `, [
      title,
      content,
      excerpt || null,
      featured_image || null,
      author || 'Palace Poker',
      category_id || null,
      featured ? true : false,
      published ? true : false
    ]);

    return NextResponse.json({
      message: 'Article created successfully',
      id: result[0].id
    });
  } catch (error) {
    console.error('Error creating news article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}