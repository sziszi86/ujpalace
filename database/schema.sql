-- Palace Poker Database Schema
-- Created for Next.js application

CREATE DATABASE IF NOT EXISTS palace_poker 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE palace_poker;

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
INSERT INTO tournament_categories (name, description, color) VALUES
('Weekly Tournament', 'Heti rendszeresen megrendezett versenyek', '#228B22'),
('Special Event', 'Különleges események és nagyobb versenyek', '#D4AF37'),
('Satellite', 'Satellite versenyek nagyobb eseményekre', '#DC143C');

INSERT INTO cash_game_types (name, description, icon, color) VALUES
('Texas Hold\'em', 'Klasszikus Texas Hold\'em póker', '♠', '#228B22'),
('Pot Limit Omaha', 'PLO - négy lap, nagyobb akció', '♦', '#DC143C'),
('Mixed Games', 'Vegyes játékok haladóknak', '♣', '#4169E1');

INSERT INTO settings (setting_key, setting_value, description, setting_type) VALUES
('site_name', 'Palace Poker Szombathely', 'Website neve', 'text'),
('contact_email', 'info@palace-poker.hu', 'Kapcsolat email cím', 'text'),
('contact_phone', '+36 30 971 5832', 'Kapcsolat telefon', 'text'),
('address', '9700 Szombathely, Semmelweis u. 2.', 'Cím', 'text'),
('opening_hours', 'Hétfő-Vasárnap 18:00-06:00', 'Nyitvatartás', 'text'),
('facebook_url', '#', 'Facebook oldal URL', 'text'),
('twitter_url', '#', 'Twitter oldal URL', 'text'),
('instagram_url', '#', 'Instagram oldal URL', 'text');

-- Create indexes for better performance
CREATE INDEX idx_tournaments_date_status ON tournaments(tournament_date, status);
CREATE INDEX idx_news_publish ON news(status, publish_date DESC);
CREATE INDEX idx_banners_active_order ON banners(active, display_order);

-- Create a default admin user (password should be hashed in real application)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@palace-poker.hu', '$2b$10$placeholder_hash', 'admin');