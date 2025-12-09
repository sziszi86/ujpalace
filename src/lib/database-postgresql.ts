import { Pool, QueryResult } from 'pg';

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  max: number;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

// Function to parse DATABASE_URL for Railway
function parseDatabaseUrl(databaseUrl: string): DatabaseConfig {
  try {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      port: parseInt(url.port || '5432'),
      max: 20,
      ssl: { rejectUnauthorized: false },
    };
  } catch (error) {
    console.warn('Invalid DATABASE_URL format, falling back to individual env vars');
    throw error;
  }
}

// Check if DATABASE_URL is valid and not a Railway template
// Prefer DATABASE_PUBLIC_URL for external access (e.g., from Vercel to Railway)
// Fall back to DATABASE_URL for internal access (e.g., within Railway)
const databaseUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
const isValidDatabaseUrl = databaseUrl &&
  !databaseUrl.includes('{{') &&
  !databaseUrl.includes('}}') &&
  databaseUrl.startsWith('postgresql://');

const dbConfig: DatabaseConfig = isValidDatabaseUrl
  ? parseDatabaseUrl(databaseUrl)
  : {
      host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
      user: process.env.DATABASE_USER || process.env.DB_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.DATABASE_NAME || process.env.DB_NAME || 'palace_poker',
      port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '5432'),
      max: 20,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

// Connection pool for better performance
const pool = new Pool(dbConfig);

// Test connection and log status
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ PostgreSQL Database connected successfully to:', dbConfig.host);
    }
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL Database connection failed:', error);
    return false;
  }
}

// Execute query with connection pool
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const result: QueryResult = await pool.query(query, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Query execution failed:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// Execute query and return single result
export async function executeQuerySingle<T = any>(query: string, params: any[] = []): Promise<T | null> {
  const rows = await executeQuery<T>(query, params);
  return rows.length > 0 ? rows[0] : null;
}

// Execute insert and return insertId (using RETURNING clause)
export async function executeInsert(query: string, params: any[] = []): Promise<{ insertId: number; affectedRows: number }> {
  try {
    // Modify query to include RETURNING id if not already present
    const returningQuery = query.includes('RETURNING') ? query : query + ' RETURNING id';
    const result: QueryResult = await pool.query(returningQuery, params);
    return {
      insertId: result.rows[0]?.id || 0,
      affectedRows: result.rowCount || 0,
    };
  } catch (error) {
    console.error('Insert execution failed:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// Execute update/delete and return affected rows
export async function executeUpdate(query: string, params: any[] = []): Promise<number> {
  try {
    const result: QueryResult = await pool.query(query, params);
    return result.rowCount || 0;
  } catch (error) {
    console.error('Update execution failed:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// Tournament functions (PostgreSQL compatible)
export async function getAllTournaments(limit?: number, status?: string, featured?: boolean) {
  try {
    console.log('getAllTournaments called with params:', { limit, status, featured });
    
    let query = `
      SELECT t.id, t.title, t.description, t.date, t.buyin_amount, t.starting_chips, 
             t.max_players, t.status, t.featured, t.image_url, t.structure_id,
             t.date as tournament_date,
             EXTRACT(HOUR FROM t.date) || ':' || LPAD(EXTRACT(MINUTE FROM t.date)::text, 2, '0') as tournament_time,
             t.buyin_amount as buy_in,
             'Tournament' as category_name, 
             null as category_color,
             0 as current_players,
             s.name as structure
      FROM tournaments t
      LEFT JOIN structures s ON t.structure_id = s.id
    `;
    
    console.log('Base query constructed');
  
  const params: any[] = [];
  const conditions: string[] = [];
  let paramIndex = 1;
  
  // Always exclude inactive tournaments unless specifically requested
  if (status) {
    conditions.push(`t.status = $${paramIndex++}`);
    params.push(status);
  } else {
    conditions.push(`t.status != 'inactive'`);
  }

  if (featured) {
    conditions.push(`t.featured = $${paramIndex++}`);
    params.push(true);
    // For featured tournaments, only show upcoming ones (date >= today)
    conditions.push(`t.date >= CURRENT_DATE`);
  }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY t.date ASC';
    
    if (limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(limit);
    }
    
    console.log('Final query:', query);
    console.log('Query params:', params);
    
    const result = await executeQuery(query, params);
    console.log('Query executed successfully, rows:', result.length);
    return result;
    
  } catch (error) {
    console.error('Error in getAllTournaments:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}

export async function getTournamentById(id: number) {
  try {
    console.log('getTournamentById called with id:', id);
    
    const query = `
      SELECT t.id, t.title, t.description, t.long_description, t.date, t.buyin_amount, t.starting_chips,
             t.starting_chips_note,
             t.max_players, t.status, t.featured, t.image_url, t.structure_id,
             t.rebuy_count, t.rebuy_price, t.rebuy_chips, t.rebuy_amounts,
             t.addon_price, t.addon_chips, t.category, t.venue, t.special_notes,
             t.visible_from, t.visible_until, t.guarantee_amount,
             t.date as tournament_date,
             EXTRACT(HOUR FROM t.date) || ':' || LPAD(EXTRACT(MINUTE FROM t.date)::text, 2, '0') as tournament_time,
             t.buyin_amount as buy_in,
             'Tournament' as category_name,
             null as category_color,
             s.name as structure
      FROM tournaments t
      LEFT JOIN structures s ON t.structure_id = s.id
      WHERE t.id = $1
    `;
    
    console.log('Executing query:', query);
    console.log('With params:', [id]);
    
    const result = await executeQuerySingle(query, [id]);
    console.log('Tournament found:', result ? 'Yes' : 'No');
    
    return result;
  } catch (error) {
    console.error('Error in getTournamentById:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}

export async function createTournament(data: any) {
  console.log('createTournament called with data:', JSON.stringify(data, null, 2));
  
  // Combine date and time into timestamp if separate
  let tournamentTimestamp;
  if (data.date && data.time) {
    tournamentTimestamp = `${data.date} ${data.time}`;
  } else if (data.tournament_date && data.tournament_time) {
    tournamentTimestamp = `${data.tournament_date} ${data.tournament_time}`;
  } else if (data.date) {
    tournamentTimestamp = data.date;
  } else {
    tournamentTimestamp = new Date().toISOString();
  }
  
  // Map structure name to structure_id if needed
  let structureId = data.structure_id;
  if (data.structure && !structureId) {
    const structureResult = await executeQuerySingle(
      'SELECT id FROM structures WHERE name = $1',
      [data.structure]
    );
    structureId = structureResult?.id || null;
  }
  
  const query = `
    INSERT INTO tournaments 
    (title, description, date, buyin_amount, starting_chips, structure_id, max_players, status, featured, image_url) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
  `;
  const params = [
    data.title,
    data.description || null,
    tournamentTimestamp,
    data.buyin_amount || data.buy_in || data.buyIn || 0,
    data.starting_chips || data.startingChips || 15000,
    structureId,
    data.max_players || data.maxPlayers || 80,
    data.status || 'upcoming',
    data.featured || false,
    data.image_url || data.image || null
  ];
  
  console.log('createTournament query:', query);
  console.log('createTournament params:', params);
  
  try {
    const result = await executeInsert(query, params);
    console.log('createTournament result:', result);
    return result;
  } catch (error) {
    console.error('createTournament error:', error);
    throw error;
  }
}

export async function updateTournament(id: number, data: any) {
  console.log('updateTournament called with ID:', id);
  console.log('updateTournament data:', JSON.stringify(data, null, 2));
  
  // Map structure name to structure_id if needed
  let structureId = data.structure_id;
  if (data.structure && !structureId) {
    const structureResult = await executeQuerySingle(
      'SELECT id FROM structures WHERE name = $1',
      [data.structure]
    );
    structureId = structureResult?.id || null;
  }
  
  // Combine date and time if provided separately
  let tournamentDateTime = data.date || data.tournament_date;
  if (data.date && data.time) {
    tournamentDateTime = `${data.date} ${data.time}:00`;
  }

  // Update all tournament fields including rebuy and addon fields
  const query = `
    UPDATE tournaments
    SET title = $1, description = $2, long_description = $3, date = $4, buyin_amount = $5,
        starting_chips = $6, starting_chips_note = $7, max_players = $8, status = $9, featured = $10,
        structure_id = $11, image_url = $12, rebuy_price = $13, rebuy_chips = $14,
        rebuy_count = $15, rebuy_amounts = $16, addon_price = $17, addon_chips = $18,
        category = $19, venue = $20, special_notes = $21, visible_from = $22,
        visible_until = $23, guarantee_amount = $24
    WHERE id = $25
  `;
  const params = [
    data.title,
    data.description || null,
    data.long_description || data.longDescription || null,
    tournamentDateTime,
    data.buyin_amount || data.buy_in || data.buyIn || 0,
    data.starting_chips || data.startingChips || 15000,
    data.starting_chips_note || data.startingChipsNote || null,
    data.max_players || data.maxPlayers || null,
    data.status || 'upcoming',
    data.featured || false,
    structureId,
    data.image_url || data.image || data.imageUrl || null,
    data.rebuy_price || data.rebuyPrice ? parseInt(data.rebuy_price || data.rebuyPrice) || null : null,
    data.rebuy_chips || data.rebuyChips ? parseInt(data.rebuy_chips || data.rebuyChips) || null : null,
    data.rebuy_count || data.rebuyCount ? parseInt(data.rebuy_count || data.rebuyCount) || 1 : 1,
    data.rebuy_amounts || data.rebuyAmounts || null,
    data.addon_price || data.addonPrice ? parseInt(data.addon_price || data.addonPrice) || null : null,
    data.addon_chips || data.addonChips ? parseInt(data.addon_chips || data.addonChips) || null : null,
    data.category || null,
    data.venue || 'Palace Poker Szombathely',
    data.special_notes || data.specialNotes || null,
    data.visible_from || data.visibleFrom ? (data.visible_from || data.visibleFrom).split('T')[0] : null,
    data.visible_until || data.visibleUntil ? (data.visible_until || data.visibleUntil).split('T')[0] : null,
    data.guarantee_amount || data.guarantee ? parseInt(data.guarantee_amount || data.guarantee) || null : null,
    id
  ];
  
  console.log('updateTournament params:', params);
  console.log('updateTournament params count:', params.length);
  
  try {
    const result = await executeUpdate(query, params);
    console.log('updateTournament result:', result);
    return result;
  } catch (error) {
    console.error('updateTournament error:', error);
    throw error;
  }
}

export async function deleteTournament(id: number) {
  const query = 'DELETE FROM tournaments WHERE id = $1';
  return executeUpdate(query, [id]);
}

// Cash game functions (PostgreSQL compatible)
export async function getAllCashGames(activeOnly: boolean = true) {
  let query = `
    SELECT cg.*, 
           COALESCE(cgt.name, 'Texas Hold''em') as game_type_name, 
           null as game_type_icon,
           cg.small_blind || '/' || cg.big_blind as stakes,
           cg.min_buyin,
           cg.max_buyin,
           COALESCE(cg.name, 'Cash Game') as name,
           cg.description,
           cg.schedule
    FROM cash_games cg 
    LEFT JOIN cash_game_types cgt ON cg.game_type_id = cgt.id
  `;
  
  if (activeOnly) {
    query += ' WHERE cg.active = true';
  }
  
  query += ' ORDER BY cg.created_at DESC';
  
  return executeQuery(query);
}

export async function getCashGameById(id: number) {
  const query = `
    SELECT cg.*, 
           COALESCE(cgt.name, 'Texas Hold''em') as game_type_name, 
           null as game_type_icon,
           cg.small_blind || '/' || cg.big_blind as stakes,
           cg.min_buyin,
           cg.max_buyin
    FROM cash_games cg 
    LEFT JOIN cash_game_types cgt ON cg.game_type_id = cgt.id
    WHERE cg.id = $1
  `;
  return executeQuerySingle(query, [id]);
}

export async function createCashGame(data: any) {
  // Parse stakes to extract small_blind and big_blind
  let small_blind = 0;
  let big_blind = 0;
  
  if (data.stakes) {
    // Handle multiple stakes (e.g., "100/200, 200/400") by taking the first one
    const firstStake = data.stakes.split(',')[0].trim();
    const stakesMatch = firstStake.match(/(\d+)\/(\d+)/);
    if (stakesMatch) {
      small_blind = parseInt(stakesMatch[1]);
      big_blind = parseInt(stakesMatch[2]);
    }
  }
  
  const query = `
    INSERT INTO cash_games 
    (name, game_type_id, stakes, small_blind, big_blind, min_buyin, max_buyin, description, schedule, active) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;
  const params = [
    data.name,
    data.game_type_id || null,
    data.stakes,
    small_blind,
    big_blind,
    data.min_buy_in || data.min_buyin,
    data.max_buy_in || data.max_buyin || null,
    data.description || null,
    data.schedule || null,
    data.active !== undefined ? data.active : true
  ];
  return executeInsert(query, params);
}

export async function updateCashGame(id: number, data: any) {
  // Parse stakes to extract small_blind and big_blind
  let small_blind = 0;
  let big_blind = 0;
  
  if (data.stakes) {
    // Handle multiple stakes (e.g., "100/200, 200/400") by taking the first one
    const firstStake = data.stakes.split(',')[0].trim();
    const stakesMatch = firstStake.match(/(\d+)\/(\d+)/);
    if (stakesMatch) {
      small_blind = parseInt(stakesMatch[1]);
      big_blind = parseInt(stakesMatch[2]);
    }
  }
  
  const query = `
    UPDATE cash_games 
    SET name = $1, game_type_id = $2, stakes = $3, small_blind = $4, big_blind = $5,
        min_buyin = $6, max_buyin = $7, description = $8, schedule = $9, active = $10, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
  `;
  const params = [
    data.name,
    data.game_type_id || null,
    data.stakes,
    small_blind,
    big_blind,
    data.min_buy_in || data.min_buyin,
    data.max_buy_in || data.max_buyin || null,
    data.description || null,
    data.schedule || null,
    data.active !== undefined ? data.active : true,
    id
  ];
  return executeUpdate(query, params);
}

export async function deleteCashGame(id: number) {
  const query = 'DELETE FROM cash_games WHERE id = $1';
  return executeUpdate(query, [id]);
}

// Banner functions (PostgreSQL compatible)
export async function getAllBanners(activeOnly: boolean = true) {
  let query = 'SELECT * FROM banners';
  
  if (activeOnly) {
    query += ' WHERE active = true';
  }
  
  query += ' ORDER BY order_index ASC, created_at DESC';
  
  return executeQuery(query);
}

export async function getBannerById(id: number) {
  const query = 'SELECT * FROM banners WHERE id = $1';
  return executeQuerySingle(query, [id]);
}

export async function createBanner(data: any) {
  const query = `
    INSERT INTO banners 
    (title, description, image_url, link_url, order_index, active, start_date, end_date) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const params = [
    data.title,
    data.description || null,
    data.image_url,
    data.link_url || null,
    data.order_index || 0,
    data.active !== undefined ? data.active : true,
    data.start_date || null,
    data.end_date || null
  ];
  return executeInsert(query, params);
}

export async function updateBanner(id: number, data: any) {
  const query = `
    UPDATE banners 
    SET title = $1, description = $2, image_url = $3, link_url = $4, order_index = $5, 
        active = $6, start_date = $7, end_date = $8, updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
  `;
  const params = [
    data.title,
    data.description || null,
    data.image_url,
    data.link_url || null,
    data.order_index || 0,
    data.active !== undefined ? data.active : true,
    data.start_date || null,
    data.end_date || null,
    id
  ];
  return executeUpdate(query, params);
}

export async function deleteBanner(id: number) {
  const query = 'DELETE FROM banners WHERE id = $1';
  return executeUpdate(query, [id]);
}

// News functions (PostgreSQL compatible)
export async function getAllNews(limit?: number, status: string = 'published') {
  let query = 'SELECT * FROM news WHERE status = $1';
  const params = [status];
  
  query += ' ORDER BY publish_date DESC, created_at DESC';
  
  if (limit) {
    query += ' LIMIT $2';
    params.push(limit.toString());
  }
  
  return executeQuery(query, params);
}

// Initialize connection pool on import
testConnection().catch(console.error);

export default pool;