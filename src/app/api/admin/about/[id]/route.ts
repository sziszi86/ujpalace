import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/database-postgresql';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const aboutPage = await executeQuerySingle(`
      SELECT * FROM about_pages WHERE id = $1
    `, [id]);

    if (!aboutPage) {
      return NextResponse.json(
        { error: 'About page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...aboutPage,
      features: aboutPage.features ? JSON.parse(aboutPage.features) : null
    });
  } catch (error) {
    console.error('Error fetching about page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about page' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, features = [], image = '', active = true } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    await executeQuery(
      'UPDATE about_pages SET title = $1, content = $1, features = $1, image = $1, active = $1 WHERE id = $1',
      [title, content, JSON.stringify(features), image, active, id]
    );

    return NextResponse.json({
      id: parseInt(id),
      title,
      content,
      features,
      image,
      active,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating about page:', error);
    return NextResponse.json(
      { error: 'Failed to update about page' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await executeQuery('DELETE FROM about_pages WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting about page:', error);
    return NextResponse.json(
      { error: 'Failed to delete about page' },
      { status: 500 }
    );
  }
}