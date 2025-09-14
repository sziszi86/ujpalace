import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  connectionLimit: number;
  charset: string;
  multipleStatements?: boolean;
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || '185.208.225.77',
  user: process.env.DB_USER || 'salamons_poker',
  password: process.env.DB_PASSWORD || 'Subaru86iok200',
  database: process.env.DB_NAME || 'salamons_palacepoker',
  port: parseInt(process.env.DB_PORT || '3306'),
  connectionLimit: 10,
  charset: 'utf8mb4',
  multipleStatements: true,
};

// Connection pool for better performance
const pool = mysql.createPool(dbConfig);

// Test connection and log status
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Database connected successfully to:', dbConfig.host);
    }
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Execute query with connection pool
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
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

// Execute insert and return insertId
export async function executeInsert(query: string, params: any[] = []): Promise<{ insertId: number; affectedRows: number }> {
  try {
    const [result] = await pool.execute(query, params);
    const insertResult = result as mysql.ResultSetHeader;
    return {
      insertId: insertResult.insertId,
      affectedRows: insertResult.affectedRows,
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
    const [result] = await pool.execute(query, params);
    const updateResult = result as mysql.ResultSetHeader;
    return updateResult.affectedRows;
  } catch (error) {
    console.error('Update execution failed:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// Tournament functions
export async function getAllTournaments(limit?: number, status?: string) {
  let query = `
    SELECT t.*, tc.name as category_name, tc.color as category_color 
    FROM tournaments t 
    LEFT JOIN tournament_categories tc ON t.category_id = tc.id
  `;
  
  const params: any[] = [];
  
  if (status) {
    query += ' WHERE t.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY t.tournament_date ASC';
  
  if (limit) {
    query += ' LIMIT ?';
    params.push(limit.toString());
  }
  
  return executeQuery(query, params);
}

export async function getTournamentById(id: number) {
  const query = `
    SELECT t.*, tc.name as category_name, tc.color as category_color 
    FROM tournaments t 
    LEFT JOIN tournament_categories tc ON t.category_id = tc.id 
    WHERE t.id = ?
  `;
  return executeQuerySingle(query, [id]);
}

export async function createTournament(data: any) {
  const query = `
    INSERT INTO tournaments 
    (title, description, category_id, tournament_date, tournament_time, buy_in, guarantee_amount, structure, max_players, rules) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    SET title = ?, description = ?, category_id = ?, tournament_date = ?, tournament_time = ?, 
        buy_in = ?, guarantee_amount = ?, structure = ?, max_players = ?, rules = ?, updated_at = NOW()
    WHERE id = ?
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
  const query = 'DELETE FROM tournaments WHERE id = ?';
  return executeUpdate(query, [id]);
}

// Cash game functions
export async function getAllCashGames(activeOnly: boolean = true) {
  let query = `
    SELECT cg.*, cgt.name as game_type_name, cgt.icon as game_type_icon 
    FROM cash_games cg 
    LEFT JOIN cash_game_types cgt ON cg.game_type_id = cgt.id
  `;
  
  if (activeOnly) {
    query += ' WHERE cg.active = 1';
  }
  
  query += ' ORDER BY cg.created_at DESC';
  
  return executeQuery(query);
}

export async function getCashGameById(id: number) {
  const query = `
    SELECT cg.*, cgt.name as game_type_name, cgt.icon as game_type_icon 
    FROM cash_games cg 
    LEFT JOIN cash_game_types cgt ON cg.game_type_id = cgt.id 
    WHERE cg.id = ?
  `;
  return executeQuerySingle(query, [id]);
}

export async function createCashGame(data: any) {
  const query = `
    INSERT INTO cash_games 
    (name, game_type_id, stakes, min_buy_in, max_buy_in, description, schedule, active) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
    SET name = ?, game_type_id = ?, stakes = ?, min_buy_in = ?, max_buy_in = ?, 
        description = ?, schedule = ?, active = ?, updated_at = NOW()
    WHERE id = ?
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
  const query = 'DELETE FROM cash_games WHERE id = ?';
  return executeUpdate(query, [id]);
}

// Banner functions
export async function getAllBanners(activeOnly: boolean = true) {
  let query = 'SELECT * FROM banners';
  
  if (activeOnly) {
    query += ' WHERE active = 1';
  }
  
  query += ' ORDER BY display_order ASC, created_at DESC';
  
  return executeQuery(query);
}

export async function getBannerById(id: number) {
  const query = 'SELECT * FROM banners WHERE id = ?';
  return executeQuerySingle(query, [id]);
}

export async function createBanner(data: any) {
  const query = `
    INSERT INTO banners 
    (title, description, image_url, link_url, display_order, active, start_date, end_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.title,
    data.description || null,
    data.image_url,
    data.link_url || null,
    data.display_order || 0,
    data.active !== undefined ? data.active : true,
    data.start_date || null,
    data.end_date || null
  ];
  return executeInsert(query, params);
}

export async function updateBanner(id: number, data: any) {
  const query = `
    UPDATE banners 
    SET title = ?, description = ?, image_url = ?, link_url = ?, display_order = ?, 
        active = ?, start_date = ?, end_date = ?, updated_at = NOW()
    WHERE id = ?
  `;
  const params = [
    data.title,
    data.description || null,
    data.image_url,
    data.link_url || null,
    data.display_order || 0,
    data.active !== undefined ? data.active : true,
    data.start_date || null,
    data.end_date || null,
    id
  ];
  return executeUpdate(query, params);
}

export async function deleteBanner(id: number) {
  const query = 'DELETE FROM banners WHERE id = ?';
  return executeUpdate(query, [id]);
}

// News functions
export async function getAllNews(limit?: number, status: string = 'published') {
  let query = 'SELECT * FROM news WHERE status = ?';
  const params = [status];
  
  query += ' ORDER BY publish_date DESC, created_at DESC';
  
  if (limit) {
    query += ' LIMIT ?';
    params.push(limit.toString());
  }
  
  return executeQuery(query, params);
}

// Initialize connection pool on import
testConnection().catch(console.error);

export default pool;