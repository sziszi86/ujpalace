import { NextResponse } from 'next/server';
import { executeQuery, executeInsert } from '@/lib/database';

export async function GET() {
  try {
    const aboutPages = await executeQuery(`
      SELECT * FROM about_pages 
      ORDER BY created_at DESC
    `);

    const processedPages = aboutPages.map(page => ({
      ...page,
      features: page.features ? JSON.parse(page.features) : null
    }));

    return NextResponse.json(processedPages);
  } catch (error) {
    console.error('Error fetching about pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, features = [], image = '', active = true } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const result = await executeInsert(
      'INSERT INTO about_pages (title, content, features, image, active) VALUES (?, ?, ?, ?, ?)',
      [title, content, JSON.stringify(features), image, active]
    );

    return NextResponse.json({
      id: result.insertId,
      title,
      content,
      features,
      image,
      active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating about page:', error);
    return NextResponse.json(
      { error: 'Failed to create about page' },
      { status: 500 }
    );
  }
}