import { NextResponse } from 'next/server';
import { getCashGameById, executeUpdate } from '@/lib/database-postgresql';

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    // Check if cash game exists
    const cashGame = await getCashGameById(id);
    if (!cashGame) {
      return NextResponse.json({ error: 'Cash game not found' }, { status: 404 });
    }
    
    // Update only the featured field
    const query = 'UPDATE cash_games SET featured = ? WHERE id = ?';
    const affectedRows = await executeUpdate(query, [data.featured ? 1 : 0, id]);
    
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Failed to update featured status' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Cash game featured status updated successfully',
      featured: data.featured
    });
  } catch (error) {
    console.error('Error updating cash game featured status:', error);
    return NextResponse.json(
      { error: 'Failed to update cash game featured status' },
      { status: 500 }
    );
  }
}