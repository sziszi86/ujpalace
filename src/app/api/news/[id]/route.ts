import { NextResponse } from 'next/server';
import { executeQuerySingle } from '@/lib/database-postgresql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      WHERE n.id = $1 AND n.status = 'published'
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