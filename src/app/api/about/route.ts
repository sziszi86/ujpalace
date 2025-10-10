import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    const aboutPages = await executeQuery(`
      SELECT * FROM about_pages 
      WHERE active = 1 
      ORDER BY created_at DESC
    `);

    // Parse features JSON if it exists
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