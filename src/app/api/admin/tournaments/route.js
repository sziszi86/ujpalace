import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'palace_poker',
  charset: 'utf8mb4'
};

async function getDbConnection() {
  return mysql.createConnection(dbConfig);
}

export async function GET() {
  let connection;
  try {
    connection = await getDbConnection();
    
    const [rows] = await connection.execute(`
      SELECT 
        id, title, description, long_description as longDescription,
        date, time, buy_in as buyIn, rebuy_price as rebuyPrice,
        rebuy_chips as rebuyChips, addon_price as addonPrice,
        addon_chips as addonChips, guarantee_amount as guarantee,
        structure, status, max_players as maxPlayers,
        current_players as currentPlayers, category, featured,
        venue, late_registration as lateRegistration,
        late_registration_until as lateRegistrationUntil,
        blind_structure as blindStructure, starting_chips as startingChips,
        contact_phone as contactPhone, contact_email as contactEmail,
        registration_deadline as registrationDeadline,
        image_url as image, special_notes as specialNotes,
        visible_from as visibleFrom, visible_until as visibleUntil
      FROM tournaments 
      ORDER BY date DESC, time DESC
    `);

    await connection.end();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    if (connection) {
      await connection.end();
    }
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  let connection;
  try {
    const data = await request.json();
    console.log('Creating tournament:', data);
    
    connection = await getDbConnection();
    
    const [result] = await connection.execute(`
      INSERT INTO tournaments (
        title, description, long_description, date, time, buy_in, rebuy_price, rebuy_chips,
        addon_price, addon_chips, guarantee_amount, structure, category, venue, starting_chips,
        image_url, special_notes, featured, status, max_players, current_players,
        late_registration, blind_structure, contact_phone, contact_email,
        visible_from, visible_until
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.title, data.description, data.longDescription, data.date, data.time, 
      data.buyIn || 0, data.rebuyPrice || 0, data.rebuyChips || 0,
      data.addonPrice || 0, data.addonChips || 0, data.guarantee || 0, 
      data.structure, data.category, data.venue, data.startingChips || 0,
      data.image, data.specialNotes, data.featured || false, data.status || 'upcoming', 
      data.maxPlayers || 80, data.currentPlayers || 0,
      data.lateRegistration || false, data.blindStructure, data.contactPhone, data.contactEmail,
      data.visibleFrom, data.visibleUntil
    ]);

    await connection.end();
    
    return NextResponse.json(
      { message: 'Tournament created successfully', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    if (connection) {
      await connection.end();
    }
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  let connection;
  try {
    const data = await request.json();
    console.log('Updating tournament:', data);
    
    connection = await getDbConnection();
    
    const { id, ...tournamentData } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    // Field mapping
    const fieldMapping = {
      'title': 'title',
      'description': 'description', 
      'longDescription': 'long_description',
      'date': 'date',
      'time': 'time',
      'buyIn': 'buy_in',
      'rebuyPrice': 'rebuy_price',
      'rebuyChips': 'rebuy_chips',
      'addonPrice': 'addon_price',
      'addonChips': 'addon_chips',
      'guarantee': 'guarantee_amount',
      'structure': 'structure',
      'category': 'category',
      'venue': 'venue',
      'startingChips': 'starting_chips',
      'image': 'image_url',
      'specialNotes': 'special_notes',
      'featured': 'featured',
      'status': 'status',
      'maxPlayers': 'max_players',
      'currentPlayers': 'current_players',
      'lateRegistration': 'late_registration',
      'blindStructure': 'blind_structure',
      'contactPhone': 'contact_phone',
      'contactEmail': 'contact_email',
      'visibleFrom': 'visible_from',
      'visibleUntil': 'visible_until'
    };

    const fields = [];
    const values = [];
    
    Object.entries(tournamentData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      await connection.end();
      return NextResponse.json({ message: 'No fields to update' });
    }
    
    values.push(id);
    
    await connection.execute(`
      UPDATE tournaments SET ${fields.join(', ')} WHERE id = ?
    `, values);

    await connection.end();
    
    return NextResponse.json({ message: 'Tournament updated successfully' });
  } catch (error) {
    console.error('PUT error:', error);
    if (connection) {
      await connection.end();
    }
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    connection = await getDbConnection();
    
    await connection.execute('DELETE FROM tournaments WHERE id = ?', [id]);

    await connection.end();
    
    return NextResponse.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('DELETE error:', error);
    if (connection) {
      await connection.end();
    }
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    );
  }
}