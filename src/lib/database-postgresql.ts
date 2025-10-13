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

const dbConfig: DatabaseConfig = {
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
    SELECT t.*, t.date as tournament_date, t.time as tournament_time,
           t.category as category_name, null as category_color,
           t.current_players, t.max_players
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
  
  query += ' ORDER BY t.date ASC, t.time ASC';
  
  if (limit) {
    query += ` LIMIT $${paramIndex++}`;
    params.push(limit);
  }
  
  return executeQuery(query, params);
}

export async function getTournamentById(id: number) {
  const query = `
    SELECT t.*, t.date as tournament_date, t.time as tournament_time,
           t.category as category_name, null as category_color
    FROM tournaments t
    WHERE t.id = $1
  `;
  return executeQuerySingle(query, [id]);
}

export async function createTournament(data: any) {
  const query = `
    INSERT INTO tournaments 
    (title, description, category_id, tournament_date, tournament_time, buy_in, guarantee_amount, structure, max_players, rules) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;
  const params = [
    data.title,
    data.description || null,
    data.category_id || null,
    data.tournament_date,
    data.tournament_time,
    data.buy_in,
    data.guarantee_amount || null,
    data.structure || null,
    data.max_players || null,
    data.rules || null
  ];
  return executeInsert(query, params);
}

export async function updateTournament(id: number, data: any) {
  const query = `
    UPDATE tournaments 
    SET title = $1, description = $2, category_id = $3, tournament_date = $4, tournament_time = $5, 
        buy_in = $6, guarantee_amount = $7, structure = $8, max_players = $9, rules = $10, updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
  `;
  const params = [
    data.title,
    data.description || null,
    data.category_id || null,
    data.tournament_date,
    data.tournament_time,
    data.buy_in,
    data.guarantee_amount || null,
    data.structure || null,
    data.max_players || null,
    data.rules || null,
    id
  ];
  return executeUpdate(query, params);
}

export async function deleteTournament(id: number) {
  const query = 'DELETE FROM tournaments WHERE id = $1';
  return executeUpdate(query, [id]);
}

// Cash game functions (PostgreSQL compatible)
export async function getAllCashGames(activeOnly: boolean = true) {
  let query = `
    SELECT cg.*, cg.game as game_type_name, null as game_type_icon 
    FROM cash_games cg 
  `;
  
  if (activeOnly) {
    query += ' WHERE cg.active = true';
  }
  
  query += ' ORDER BY cg.created_at DESC';
  
  return executeQuery(query);
}

export async function getCashGameById(id: number) {
  const query = `
    SELECT cg.*, cg.game as game_type_name, null as game_type_icon 
    FROM cash_games cg 
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