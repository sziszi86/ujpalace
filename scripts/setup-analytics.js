#!/usr/bin/env node

/**
 * Analytics Database Migration Script for PostgreSQL (Railway)
 * 
 * This script automatically creates the analytics tables.
 * 
 * Usage:
 *   node scripts/setup-analytics.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function setupAnalytics() {
  log('\n🎯 Palace Poker Analytics - Database Setup (PostgreSQL/Railway)\n', 'cyan');
  log('This script will create the analytics tables in your Railway database.\n', 'blue');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    log('❌ Error: DATABASE_URL not found in .env.local!', 'red');
    log('Please add your Railway database URL.\n', 'red');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false, // Railway requires this
    },
  });

  try {
    // Step 1: Connect to database
    log('📡 Connecting to Railway database...', 'yellow');
    await client.connect();
    log('✅ Connected successfully!\n', 'green');

    // Step 2: Read SQL migration file
    log('📄 Reading migration file...', 'yellow');
    const migrationPath = path.join(__dirname, '..', 'src', 'lib', 'analytics-migration.sql');
    
    if (!fs.existsSync(migrationPath)) {
      log(`❌ Error: Migration file not found at ${migrationPath}`, 'red');
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    log('✅ Migration file loaded!\n', 'green');

    // Step 3: Execute migration
    log('🔧 Creating analytics tables...', 'yellow');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        const trimmed = stmt.trim();
        if (trimmed.length === 0) return false;
        // Only filter out lines that are ONLY comments (no CREATE TABLE etc)
        if (trimmed.startsWith('--') && !trimmed.includes('CREATE')) return false;
        return true;
      });

    log(`Found ${statements.length} statements to execute.\n`, 'blue');

    let created = 0;
    let skipped = 0;

    for (const statement of statements) {
      const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
      const indexMatch = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/i);
      
      if (tableMatch && tableMatch[1]) {
        log(`   Creating table: ${tableMatch[1]}...`, 'blue');
      } else if (indexMatch && indexMatch[1]) {
        log(`   Creating index: ${indexMatch[1]}...`, 'blue');
      }
      
      try {
        await client.query(statement);
        created++;
      } catch (error) {
        if (error.code === '42P07') {
          const name = tableMatch?.[1] || indexMatch?.[1] || 'unknown';
          log(`   ⚠️  ${name} already exists, skipping...`, 'yellow');
          skipped++;
        } else {
          log(`   Error: ${error.message}`, 'red');
        }
      }
    }

    log(`\n✅ Executed ${created} statements (${skipped} already existed)!\n`, 'green');

    // Step 4: Verify tables
    log('🔍 Verifying tables...', 'yellow');
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE 'analytics_%'
      ORDER BY table_name
    `);

    if (result.rows.length > 0) {
      log('\n✅ Analytics tables created:', 'green');
      result.rows.forEach(row => {
        log(`   ✓ ${row.table_name}`, 'green');
      });
    }

    // Step 5: Show summary
    log('\n' + '='.repeat(50), 'cyan');
    log('🎉 Setup Complete!', 'green');
    log('='.repeat(50), 'cyan');
    
    log('\n📊 What\'s next:', 'blue');
    log('   1. Deploy to Railway (git push)', 'reset');
    log('   2. Visit /admin/analytics to see statistics', 'reset');
    log('   3. Wait 24 hours for meaningful data', 'reset');
    
    log('\n📚 Documentation: ANALYTICS_SETUP.md\n', 'blue');

  } catch (error) {
    log('\n❌ Error during setup:', 'red');
    log(`   ${error.message}\n`, 'red');
    process.exit(1);
  } finally {
    await client.end();
    log('👋 Database connection closed.\n', 'blue');
  }
}

// Run the setup
setupAnalytics();
