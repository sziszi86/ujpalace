import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';

export async function GET() {
  try {
    // For now, return empty array as we need to set up proper gallery system
    // TODO: Implement proper gallery with images
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}