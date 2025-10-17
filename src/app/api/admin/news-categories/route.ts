import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeInsert } from '@/lib/database-postgresql';

export async function GET() {
  try {
    const categories = await executeQuery(`
      SELECT id, name, description, created_at 
      FROM news_categories 
      ORDER BY name ASC
    `);
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching news categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await executeInsert(`
      INSERT INTO news_categories (name, description)
      VALUES ($1, $2)
    `, [name, description || null]);

    return NextResponse.json(
      { id: result.insertId, message: 'Category created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating news category:', error);
    return NextResponse.json(
      { error: 'Failed to create news category' },
      { status: 500 }
    );
  }
}