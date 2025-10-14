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
const databaseUrl = process.env.DATABASE_URL;
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
  let query = `
    SELECT t.*, 
           t.date as tournament_date,
           EXTRACT(HOUR FROM t.date) || ':' || LPAD(EXTRACT(MINUTE FROM t.date)::text, 2, '0') as tournament_time,
           t.buyin_amount as buy_in,
           'Tournament' as category_name, 
           null as category_color,
           0 as current_players,
           t.max_players,
           t.starting_chips
    FROM tournaments t
  `;
  
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
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY t.date ASC';
  
  if (limit) {
    query += ` LIMIT $${paramIndex++}`;
    params.push(limit);
  }
  
  return executeQuery(query, params);
}

export async function getTournamentById(id: number) {
  const query = `
    SELECT t.*, 
           t.date as tournament_date,
           EXTRACT(HOUR FROM t.date) || ':' || LPAD(EXTRACT(MINUTE FROM t.date)::text, 2, '0') as tournament_time,
           'Tournament' as category_name, 
           null as category_color
    FROM tournaments t
    WHERE t.id = $1
  `;
  return executeQuerySingle(query, [id]);
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
    data.structure_id || null,
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
  
  // Try a simpler approach first - only update basic fields
  const query = `
    UPDATE tournaments 
    SET title = $1, description = $2, date = $3, buyin_amount = $4, starting_chips = $5,
        max_players = $6, status = $7, featured = $8, updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
  `;
  const params = [
    data.title,
    data.description || null,
    data.date || data.tournament_date,
    data.buyin_amount || data.buy_in || data.buyIn,
    data.starting_chips || data.startingChips || 15000,
    data.max_players || data.maxPlayers || null,
    data.status || 'upcoming',
    data.featured || false,
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
           cg.min_buyin as min_buy_in,
           cg.max_buyin as max_buy_in,
           'Cash Game' as name
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
           cg.min_buyin as min_buy_in,
           cg.max_buyin as max_buy_in
    FROM cash_games cg 
    LEFT JOIN cash_game_types cgt ON cg.game_type_id = cgt.id
    WHERE cg.id = $1
  `;
  return executeQuerySingle(query, [id]);
}

export async function createCashGame(data: any) {
  const query = `
    INSERT INTO cash_games 
    (name, game_type_id, stakes, min_buy_in, max_buy_in, description, schedule, active) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const params = [
    data.name,
    data.game_type_id || null,
    data.stakes,
    data.min_buy_in,
    data.max_buy_in || null,
    data.description || null,
    data.schedule || null,
    data.active !== undefined ? data.active : true
  ];
  return executeInsert(query, params);
}

export async function updateCashGame(id: number, data: any) {
  const query = `
    UPDATE cash_games 
    SET name = $1, game_type_id = $2, stakes = $3, min_buy_in = $4, max_buy_in = $5, 
        description = $6, schedule = $7, active = $8, updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
  `;
  const params = [
    data.name,
    data.game_type_id || null,
    data.stakes,
    data.min_buy_in,
    data.max_buy_in || null,
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