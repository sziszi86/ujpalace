import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function GET() {
  try {
    const banners = await executeQuery(`
      SELECT * FROM banners 
      WHERE active = true 
      ORDER BY order_index ASC, created_at DESC
    `);

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}