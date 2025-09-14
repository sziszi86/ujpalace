-- Palace Poker Database Schema
-- For tarhely.eu MySQL: salamons_palacepoker
-- Import this SQL file via cPanel phpMyAdmin or MySQL command line

-- Set charset
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Database salamons_palacepoker should already exist on tarhely.eu
-- USE salamons_palacepoker; -- uncomment if running via command line

-- Users table for admin authentication
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);

-- Tournament categories
CREATE TABLE tournament_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#228B22', -- hex color for UI
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments table
CREATE TABLE tournaments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INT,
  tournament_date DATE NOT NULL,
  tournament_time TIME NOT NULL,
  registration_deadline DATETIME,
  buy_in DECIMAL(10,2) NOT NULL,
  guarantee_amount DECIMAL(10,2) NOT NULL,
  structure VARCHAR(100) NOT NULL, -- 'Freeze-out', 'Rebuy', 'Bounty', etc.
  max_players INT,
  current_players INT DEFAULT 0,
  status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
  image_url VARCHAR(255),
  rules TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES tournament_categories(id),
  INDEX idx_tournament_date (tournament_date),
  INDEX idx_status (status)
);

-- Tournament results
CREATE TABLE tournament_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tournament_id INT NOT NULL,
  position INT NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  prize_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tournament_position (tournament_id, position)
);

-- Cash game types
CREATE TABLE cash_game_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL, -- 'Texas Hold\'em', 'Pot Limit Omaha', etc.
  description TEXT,
  icon VARCHAR(10) DEFAULT '♠',
  color VARCHAR(7) DEFAULT '#228B22',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cash games table
CREATE TABLE cash_games (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  game_type_id INT NOT NULL,
  stakes VARCHAR(20) NOT NULL, -- '25/50', '50/100', etc.
  min_buy_in DECIMAL(10,2) NOT NULL,
  max_buy_in DECIMAL(10,2) NOT NULL,
  description TEXT,
  schedule VARCHAR(200), -- 'Hétfő-Vasárnap 18:00-06:00'
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (game_type_id) REFERENCES cash_game_types(id),
  INDEX idx_active (active)
);

-- Banners for homepage slider
CREATE TABLE banners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(255) NOT NULL,
  link_url VARCHAR(255),
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active_order (active, display_order)
);

-- News and articles
CREATE TABLE news (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  image_url VARCHAR(255),
  category VARCHAR(50) DEFAULT 'general',
  status ENUM('published', 'draft') DEFAULT 'draft',
  publish_date DATETIME,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_status_publish (status, publish_date),
  INDEX idx_category (category)
);

-- Gallery images
CREATE TABLE gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  description TEXT,
  image_url VARCHAR(255) NOT NULL,
  thumbnail_url VARCHAR(255),
  category VARCHAR(50) DEFAULT 'general',
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active_category (active, category),
  INDEX idx_order (display_order)
);

-- Contact form submissions
CREATE TABLE contact_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied') DEFAULT 'new',
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

-- Site settings/configuration
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description VARCHAR(255),
  setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tournament registrations (if tracking online registrations)
CREATE TABLE tournament_registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tournament_id INT NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  player_email VARCHAR(100),
  player_phone VARCHAR(20),
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('registered', 'confirmed', 'cancelled') DEFAULT 'registered',
  notes TEXT,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  INDEX idx_tournament_status (tournament_id, status)
);

-- Insert default data
INSERT IGNORE INTO tournament_categories (name, description, color) VALUES
('Weekly Tournament', 'Heti rendszeresen megrendezett versenyek', '#228B22'),
('Special Event', 'Különleges események és nagyobb versenyek', '#D4AF37'),
('Satellite', 'Satellite versenyek nagyobb eseményekre', '#DC143C');

INSERT IGNORE INTO cash_game_types (name, description, icon, color) VALUES
('Texas Hold\'em', 'Klasszikus Texas Hold\'em póker', '♠', '#228B22'),
('Pot Limit Omaha', 'PLO - négy lap, nagyobb akció', '♦', '#DC143C'),
('Mixed Games', 'Vegyes játékok haladóknak', '♣', '#4169E1');

INSERT IGNORE INTO settings (setting_key, setting_value, description, setting_type) VALUES
('site_name', 'Palace Poker Szombathely', 'Website neve', 'text'),
('contact_email', 'info@palace-poker.hu', 'Kapcsolat email cím', 'text'),
('contact_phone', '+36 30 971 5832', 'Kapcsolat telefon', 'text'),
('address', '9700 Szombathely, Semmelweis u. 2.', 'Cím', 'text'),
('opening_hours', 'Hétfő-Vasárnap 18:00-06:00', 'Nyitvatartás', 'text'),
('facebook_url', '#', 'Facebook oldal URL', 'text'),
('twitter_url', '#', 'Twitter oldal URL', 'text'),
('instagram_url', '#', 'Instagram oldal URL', 'text');

-- Sample tournaments
INSERT IGNORE INTO tournaments (id, title, description, category_id, tournament_date, tournament_time, buy_in, guarantee_amount, structure, max_players, status) VALUES
(1, 'Weekend Main Event', 'Hétvégi főesemény nagy nyereményekkel!', 1, '2025-01-18', '18:00:00', 15000.00, 100000.00, 'Freezeout', 120, 'upcoming'),
(2, 'Daily Deepstack', 'Napi mély stack verseny türelmes játékosoknak.', 1, '2025-01-19', '20:00:00', 8000.00, 50000.00, 'Freezeout', 80, 'upcoming');

-- Sample cash games
INSERT IGNORE INTO cash_games (id, name, game_type_id, stakes, min_buy_in, max_buy_in, description, schedule, active) VALUES
(1, 'Micro Stakes Hold\'em', 1, '25/50', 2500.00, 10000.00, 'Kezdőknek ajánlott alacsony tét', 'Hétfő-Vasárnap 14:00-02:00', 1),
(2, 'Low Stakes Hold\'em', 1, '50/100', 5000.00, 20000.00, 'Közepes szintű játékosoknak', 'Hétfő-Vasárnap 16:00-02:00', 1);

-- Sample banners
INSERT IGNORE INTO banners (id, title, description, image_url, display_order, active) VALUES
(1, 'Üdvözlünk a Palace Pokerben!', 'Szombathely legjobb poker terme', '/images/banner-welcome.jpg', 1, 1),
(2, 'Weekend Main Event', 'Minden hétvégén nagy verseny!', '/images/banner-tournament.jpg', 2, 1);

-- Sample news
INSERT IGNORE INTO news (id, title, content, excerpt, status, publish_date) VALUES
(1, 'Palace Poker megnyitás', 'Üdvözlünk Szombathely új poker termében! Modern környezet, professzionális kiszolgálás.', 'Üdvözlünk Szombathely új poker termében!', 'published', NOW()),
(2, 'Heti versenyprogram', 'Minden hétfőn új versenyprogram indul. Tekintse meg a részleteket!', 'Minden hétfőn új versenyprogram indul.', 'published', NOW());

-- Create a default admin user (password: admin123 - should be properly hashed in production)
INSERT IGNORE INTO users (id, username, email, password_hash, role) VALUES
(1, 'sziszi86', 'salamonszilard@gmail.com', '$2b$10$rXzQqG8QqG8QqG8QqG8QqO', 'admin');

-- Create indexes for better performance (IF NOT EXISTS for safety)
CREATE INDEX IF NOT EXISTS idx_tournaments_date_status ON tournaments(tournament_date, status);
CREATE INDEX IF NOT EXISTS idx_news_publish ON news(status, publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_banners_active_order ON banners(active, display_order);

-- Restore foreign key checks
SET FOREIGN_KEY_CHECKS = 1;