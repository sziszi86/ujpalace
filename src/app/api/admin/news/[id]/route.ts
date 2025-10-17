import { NextResponse } from 'next/server';
import { executeQuerySingle, executeUpdate } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const newsId = parseInt(resolvedParams.id);

    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const article = await executeQuerySingle(`
      SELECT 
        n.*,
        n.featured_image as image_url,
        CASE WHEN n.published THEN 'published' ELSE 'draft' END as status,
        n.created_at as publish_date,
        n.created_at,
        n.updated_at
      FROM news n
      WHERE n.id = $1
    `, [newsId]);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching news article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const newsId = parseInt(resolvedParams.id);

    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      image_url,
      featured_image,
      author,
      publish_date,
      status,
      category_id,
      featured
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const affectedRows = await executeUpdate(`
      UPDATE news 
      SET title = $1, content = $2, excerpt = $3, featured_image = $4, author = $5,
          published = $6, featured = $7, category_id = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
    `, [
      title,
      content,
      excerpt || null,
      featured_image || image_url || null,
      author || 'Palace Poker',
      status === 'published' ? true : false,
      featured ? true : false,
      category_id || null,
      newsId
    ]);

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Article updated successfully'
    });
  } catch (error) {
    console.error('Error updating news article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const newsId = parseInt(resolvedParams.id);

    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const affectedRows = await executeUpdate(`
      DELETE FROM news WHERE id = $1
    `, [newsId]);

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}