import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database-postgresql';
import { verifyAuth } from '@/lib/auth';

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
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid cash game ID' },
        { status: 400 }
      );
    }

    const { featured } = await request.json();

    // Update featured status
    const result = await executeQuery(`
      UPDATE cash_games 
      SET featured = $1, updated_at = NOW()
      WHERE id = $2
    `, [featured, id]);

    return NextResponse.json({ 
      success: true, 
      featured,
      message: `Cash game ${featured ? 'marked as featured' : 'removed from featured'}` 
    });
  } catch (error) {
    console.error('Error updating cash game featured status:', error);
    return NextResponse.json(
      { error: 'Failed to update featured status' },
      { status: 500 }
    );
  }
}