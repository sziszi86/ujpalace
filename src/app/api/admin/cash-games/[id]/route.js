import { NextResponse } from 'next/server';
import { getCashGameById, updateCashGame, deleteCashGame, executeUpdate } from '@/lib/database-postgresql';

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    const cashGame = await getCashGameById(id);
    
    if (!cashGame) {
      return NextResponse.json({ error: 'Cash game not found' }, { status: 404 });
    }
    
    // Transform database format to edit form format
    const formattedCashGame = {
      id: cashGame.id,
      name: cashGame.name,
      stakes: cashGame.stakes,
      game: cashGame.game || cashGame.game_type_name || 'Texas Holdem',
      minBuyIn: cashGame.min_buy_in || cashGame.minBuyIn,
      maxBuyIn: cashGame.max_buy_in || cashGame.maxBuyIn,
      schedule: cashGame.schedule,
      active: cashGame.active === 1 || cashGame.active === true,
      description: cashGame.description || '',
      image: cashGame.image_url || cashGame.image || '',
      scheduledDates: cashGame.scheduled_dates ? 
        (typeof cashGame.scheduled_dates === 'string' ? 
          JSON.parse(cashGame.scheduled_dates) : cashGame.scheduled_dates) : []
    };
    
    return NextResponse.json(formattedCashGame);
  } catch (error) {
    console.error('Error fetching cash game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cash game' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    // Use executeUpdate directly to handle all fields including JSON
    const query = `
      UPDATE cash_games 
      SET name = ?, stakes = ?, game = ?, min_buy_in = ?, max_buy_in = ?, 
          description = ?, schedule = ?, active = ?, image_url = ?, 
          scheduled_dates = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const params_array = [
      data.name,
      data.stakes,
      'Texas Holdem', // Default game type
      data.minBuyIn || 0,
      data.maxBuyIn || 0,
      data.description || '',
      data.schedule || '',
      data.active ? 1 : 0,
      data.image || null,
      data.scheduledDates ? JSON.stringify(data.scheduledDates) : null,
      id
    ];
    
    const affectedRows = await executeUpdate(query, params_array);
    
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Cash game not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Cash game updated successfully' });
  } catch (error) {
    console.error('Error updating cash game:', error);
    console.error('Error details:', error.message);
    return NextResponse.json(
      { error: 'Failed to update cash game: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    const affectedRows = await deleteCashGame(id);
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Cash game not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Cash game deleted successfully' });
  } catch (error) {
    console.error('Error deleting cash game:', error);
    return NextResponse.json(
      { error: 'Failed to delete cash game' },
      { status: 500 }
    );
  }
}