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
        n.publish_date,
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
      author,
      publish_date,
      status,
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
      SET title = $1, content = $2, excerpt = $3, image_url = $4, author = $5,
          publish_date = $6, status = $7, featured = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
    `, [
      title,
      content,
      excerpt || null,
      image_url || null,
      author || 'Palace Poker',
      publish_date,
      status || 'draft',
      featured ? true : false,
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