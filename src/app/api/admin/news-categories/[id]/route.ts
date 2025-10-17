import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeUpdate } from '@/lib/database-postgresql';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { name, description } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const affectedRows = await executeUpdate(`
      UPDATE news_categories 
      SET name = $1, description = $2
      WHERE id = $3
    `, [name, description || null, id]);

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Category updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating news category:', error);
    return NextResponse.json(
      { error: 'Failed to update news category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Check if category is used by any news
    const newsCount = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM news 
      WHERE category_id = $1
    `, [id]);

    if (newsCount[0]?.count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is used by news articles' },
        { status: 400 }
      );
    }

    const affectedRows = await executeUpdate(`
      DELETE FROM news_categories 
      WHERE id = $1
    `, [id]);

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting news category:', error);
    return NextResponse.json(
      { error: 'Failed to delete news category' },
      { status: 500 }
    );
  }
}