import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'palace_poker',
  charset: 'utf8mb4',
};

let connection;

export async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection(dbConfig);
  }
  return connection;
}

export async function query(sql, params) {
  try {
    const conn = await getConnection();
    const [results] = await conn.execute(sql, params || []);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getAllTournaments() {
  return await query(`
    SELECT t.*, tc.name as category_name, tc.color as category_color
    FROM tournaments t 
    LEFT JOIN tournament_categories tc ON t.category_id = tc.id
    ORDER BY t.tournament_date DESC
  `);
}

export async function getTournamentById(id) {
  const results = await query(`
    SELECT t.*, tc.name as category_name, tc.color as category_color
    FROM tournaments t 
    LEFT JOIN tournament_categories tc ON t.category_id = tc.id
    WHERE t.id = ?
  `, [id]);
  return results[0] || null;
}

export async function getAllCashGames() {
  return await query(`
    SELECT cg.*, cgt.name as game_type_name, cgt.icon, cgt.color
    FROM cash_games cg
    LEFT JOIN cash_game_types cgt ON cg.game_type_id = cgt.id
    ORDER BY cg.stakes
  `);
}

export async function insertTournament(tournamentData) {
  const {
    title, description, category_id, tournament_date, tournament_time,
    registration_deadline, buy_in, guarantee_amount, structure, max_players,
    image_url, rules
  } = tournamentData;

  return await query(`
    INSERT INTO tournaments (
      title, description, category_id, tournament_date, tournament_time,
      registration_deadline, buy_in, guarantee_amount, structure, max_players,
      image_url, rules
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    title, description, category_id, tournament_date, tournament_time,
    registration_deadline, buy_in, guarantee_amount, structure, max_players,
    image_url, rules
  ]);
}

export async function updateTournament(id, tournamentData) {
  const fields = [];
  const values = [];
  
  Object.entries(tournamentData).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (fields.length === 0) return null;
  
  values.push(id);
  
  return await query(`
    UPDATE tournaments SET ${fields.join(', ')} WHERE id = ?
  `, values);
}

export async function deleteTournament(id) {
  return await query('DELETE FROM tournaments WHERE id = ?', [id]);
}

export async function insertCashGame(cashGameData) {
  const {
    name, game_type_id, stakes, min_buy_in, max_buy_in,
    description, schedule
  } = cashGameData;

  return await query(`
    INSERT INTO cash_games (
      name, game_type_id, stakes, min_buy_in, max_buy_in,
      description, schedule
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [name, game_type_id, stakes, min_buy_in, max_buy_in, description, schedule]);
}

export async function updateCashGame(id, cashGameData) {
  const fields = [];
  const values = [];
  
  Object.entries(cashGameData).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (fields.length === 0) return null;
  
  values.push(id);
  
  return await query(`
    UPDATE cash_games SET ${fields.join(', ')} WHERE id = ?
  `, values);
}

export async function deleteCashGame(id) {
  return await query('DELETE FROM cash_games WHERE id = ?', [id]);
}

export default { query, getAllTournaments, getTournamentById, getAllCashGames };