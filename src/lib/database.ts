import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'palace_poker',
  port: parseInt(process.env.DB_PORT || '3306'),
};

let connection: mysql.Connection | null = null;

export async function getConnection() {
  if (!connection) {
    try {
      connection = await mysql.createConnection(dbConfig);
      if (process.env.NODE_ENV === 'development') {
        console.log('Database connected successfully');
      }
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }
  return connection;
}

export async function createTables() {
  const conn = await getConnection();
  
  // Create admin_users table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Create password_reset_tokens table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
      INDEX (token),
      INDEX (expires_at)
    )
  `);

  // Create news_categories table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS news_categories (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      color VARCHAR(20) DEFAULT '#007bff',
      order_index INT DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (active),
      INDEX (order_index)
    )
  `);

  // Create news table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS news (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      image VARCHAR(500),
      images TEXT,
      publish_date DATE,
      status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
      category VARCHAR(100),
      tags TEXT,
      featured BOOLEAN DEFAULT FALSE,
      author VARCHAR(100),
      read_time INT DEFAULT 0,
      visible_from DATETIME NULL,
      visible_until DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (status),
      INDEX (publish_date),
      INDEX (visible_from),
      INDEX (visible_until)
    )
  `);

  // Create about_pages table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS about_pages (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      hero_image VARCHAR(500),
      meta_description TEXT,
      features TEXT,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (active)
    )
  `);

  // Create banners table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS banners (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      link_url VARCHAR(500),
      alt_text VARCHAR(255),
      position ENUM('homepage', 'sidebar', 'footer', 'tournaments', 'news') DEFAULT 'homepage',
      status ENUM('active', 'inactive') DEFAULT 'active',
      order_index INT DEFAULT 0,
      start_date DATETIME NULL,
      end_date DATETIME NULL,
      author_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE CASCADE,
      INDEX (status),
      INDEX (position),
      INDEX (order_index)
    )
  `);

  // Create tournaments table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      tournament_date DATE NOT NULL,
      tournament_time TIME NOT NULL,
      buy_in DECIMAL(10,2) NOT NULL,
      guarantee_amount DECIMAL(10,2),
      structure VARCHAR(100),
      status ENUM('upcoming', 'running', 'finished', 'cancelled') DEFAULT 'upcoming',
      max_players INT,
      current_players INT DEFAULT 0,
      prize_structure TEXT,
      rules TEXT,
      author_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE CASCADE,
      INDEX (tournament_date),
      INDEX (status)
    )
  `);

  // Create cash_games table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS cash_games (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      stakes VARCHAR(100) NOT NULL,
      game_type VARCHAR(100) NOT NULL,
      min_buy_in DECIMAL(10,2) NOT NULL,
      max_buy_in DECIMAL(10,2),
      description TEXT,
      schedule VARCHAR(255),
      active BOOLEAN DEFAULT TRUE,
      author_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE CASCADE,
      INDEX (active)
    )
  `);

  // Create gallery table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      thumbnail_url VARCHAR(500),
      alt_text VARCHAR(255),
      description TEXT,
      category VARCHAR(100),
      tags TEXT,
      status ENUM('active', 'inactive') DEFAULT 'active',
      order_index INT DEFAULT 0,
      author_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE CASCADE,
      INDEX (status),
      INDEX (category),
      INDEX (order_index)
    )
  `);
}

// Mock database functions for development
export class MockDatabase {
  static async query(sql: string, params?: any[]): Promise<any[]> {
    // In development, return mock data
    console.log('Mock DB Query:', sql, params);
    
    if (sql.includes('tournaments')) {
      return [
        {
          id: 1,
          title: 'Friday Night Tournament',
          description: 'Heti nagy verseny minden pénteken',
          tournament_date: '2024-01-12',
          tournament_time: '20:00',
          buy_in: 15000,
          guarantee_amount: 100000,
          structure: 'Freeze-out',
          status: 'upcoming',
          max_players: 50,
          current_players: 23,
        },
        {
          id: 2,
          title: 'Saturday Bounty Hunt',
          description: 'Fejvadász verseny szombat este',
          tournament_date: '2024-01-13',
          tournament_time: '19:30',
          buy_in: 20000,
          guarantee_amount: 150000,
          structure: 'Bounty',
          status: 'upcoming',
          max_players: 60,
          current_players: 31,
        }
      ];
    }
    
    if (sql.includes('cash_games')) {
      return [
        {
          id: 1,
          name: 'Texas Hold\'em 25/50',
          stakes: '25/50 Ft',
          game_type: 'Texas Hold\'em',
          min_buy_in: 2500,
          max_buy_in: 10000,
          description: 'Alapszintű cash game',
          schedule: 'Hétfő-Vasárnap 18:00-06:00',
          active: true,
        }
      ];
    }
    
    return [];
  }

  static async insert(table: string, data: any): Promise<{ insertId: number }> {
    console.log('Mock DB Insert:', table, data);
    return { insertId: Math.floor(Math.random() * 1000) };
  }

  static async update(table: string, data: any, where: any): Promise<{ affectedRows: number }> {
    console.log('Mock DB Update:', table, data, where);
    return { affectedRows: 1 };
  }

  static async delete(table: string, where: any): Promise<{ affectedRows: number }> {
    console.log('Mock DB Delete:', table, where);
    return { affectedRows: 1 };
  }
}

// Export individual functions for API routes
export async function getAllTournaments() {
  return MockDatabase.query('SELECT * FROM tournaments ORDER BY tournament_date ASC');
}

export async function createTournament(data: any) {
  return MockDatabase.insert('tournaments', data);
}

export async function updateTournament(id: number, data: any) {
  return MockDatabase.update('tournaments', data, { id });
}

export async function deleteTournament(id: number) {
  return MockDatabase.delete('tournaments', { id });
}

export async function getAllCashGames() {
  return MockDatabase.query('SELECT * FROM cash_games WHERE active = 1');
}

export async function createCashGame(data: any) {
  return MockDatabase.insert('cash_games', data);
}

export async function updateCashGame(id: number, data: any) {
  return MockDatabase.update('cash_games', data, { id });
}

export async function deleteCashGame(id: number) {
  return MockDatabase.delete('cash_games', { id });
}

export default MockDatabase;