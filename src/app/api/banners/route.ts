import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function GET() {
  try {
    const banners = await executeQuery(`
      SELECT * FROM banners 
      WHERE active = true 
      AND (visible_from IS NULL OR visible_from <= CURDATE())
      AND (visible_until IS NULL OR visible_until >= CURDATE())
      ORDER BY order_position ASC, created_at DESC
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