-- PostgreSQL migration script for Palace Poker
-- Converted from MySQL dump

-- about_pages table
CREATE TABLE about_pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  hero_image VARCHAR(500),
  meta_description TEXT,
  features TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_about_pages_updated_at BEFORE UPDATE ON about_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- admin_users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- banner_images table
CREATE TABLE banner_images (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- banners table
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- cash_game_types table
CREATE TABLE cash_game_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- cash_games table
CREATE TABLE cash_games (
  id SERIAL PRIMARY KEY,
  game_type_id INTEGER REFERENCES cash_game_types(id),
  min_buyin INTEGER NOT NULL,
  max_buyin INTEGER,
  small_blind INTEGER NOT NULL,
  big_blind INTEGER NOT NULL,
  ante INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_cash_games_updated_at BEFORE UPDATE ON cash_games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- gallery table
CREATE TABLE gallery (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- gallery_images table
CREATE TABLE gallery_images (
  id SERIAL PRIMARY KEY,
  gallery_id INTEGER REFERENCES gallery(id) ON DELETE CASCADE,
  image_id INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- images table
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  data BYTEA NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- news table
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  category_id INTEGER,
  author VARCHAR(100),
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- news_categories table
CREATE TABLE news_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- password_reset_tokens table
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- player_statistics table
CREATE TABLE player_statistics (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL,
  total_buyins INTEGER DEFAULT 0,
  total_rebuys INTEGER DEFAULT 0,
  total_addons INTEGER DEFAULT 0,
  tournaments_played INTEGER DEFAULT 0,
  cashes INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  total_winnings DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  roi DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_player_statistics_updated_at BEFORE UPDATE ON player_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- player_transactions table
CREATE TABLE player_transactions (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  tournament_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- players table
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  registration_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- structure_levels table
CREATE TABLE structure_levels (
  id SERIAL PRIMARY KEY,
  structure_id INTEGER NOT NULL,
  level_number INTEGER NOT NULL,
  small_blind INTEGER NOT NULL,
  big_blind INTEGER NOT NULL,
  ante INTEGER DEFAULT 0,
  duration_minutes INTEGER NOT NULL,
  break_after BOOLEAN DEFAULT FALSE,
  break_duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- structures table
CREATE TABLE structures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  starting_chips INTEGER NOT NULL,
  level_duration INTEGER NOT NULL,
  late_registration_levels INTEGER DEFAULT 6,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_structures_updated_at BEFORE UPDATE ON structures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- tournament_structures table
CREATE TABLE tournament_structures (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL,
  structure_id INTEGER REFERENCES structures(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- tournaments table
CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  date TIMESTAMP NOT NULL,
  buyin_amount INTEGER NOT NULL,
  starting_chips INTEGER NOT NULL,
  structure_id INTEGER,
  max_players INTEGER,
  late_registration_end TIMESTAMP,
  rebuy_allowed BOOLEAN DEFAULT FALSE,
  rebuy_price INTEGER,
  rebuy_chips INTEGER,
  rebuy_count INTEGER DEFAULT 0,
  rebuy_amounts TEXT,
  rebuy_period_end TIMESTAMP,
  addon_allowed BOOLEAN DEFAULT FALSE,
  addon_price INTEGER,
  addon_chips INTEGER,
  addon_count INTEGER,
  addon_period_start TIMESTAMP,
  addon_period_end TIMESTAMP,
  category VARCHAR(255),
  venue VARCHAR(255),
  special_notes TEXT,
  visible_from DATE,
  visible_until DATE,
  guarantee_amount INTEGER,
  status VARCHAR(50) DEFAULT 'upcoming',
  featured BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_banners_active ON banners(active);
CREATE INDEX idx_banners_order ON banners(order_index);
CREATE INDEX idx_cash_games_active ON cash_games(active);
CREATE INDEX idx_cash_games_featured ON cash_games(featured);
CREATE INDEX idx_gallery_featured ON gallery(featured);
CREATE INDEX idx_news_published ON news(published);
CREATE INDEX idx_news_featured ON news(featured);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_featured ON tournaments(featured);
CREATE INDEX idx_tournaments_date ON tournaments(date);
CREATE INDEX idx_players_active ON players(active);
CREATE INDEX idx_structure_levels_structure_id ON structure_levels(structure_id);