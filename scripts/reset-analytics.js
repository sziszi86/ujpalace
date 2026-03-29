#!/usr/bin/env node

/**
 * Analytics Reset Script
 * Törli az összes teszt adatot az analytics táblákból
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function resetAnalytics() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('\n🗑️  Analytics adatok törlése...\n');

    // Truncate all analytics tables
    await client.query('TRUNCATE TABLE analytics_page_views RESTART IDENTITY');
    console.log('   ✅ analytics_page_views törölve');

    await client.query('TRUNCATE TABLE analytics_daily_stats RESTART IDENTITY');
    console.log('   ✅ analytics_daily_stats törölve');

    await client.query('TRUNCATE TABLE analytics_top_pages RESTART IDENTITY');
    console.log('   ✅ analytics_top_pages törölve');

    await client.query('TRUNCATE TABLE analytics_referrers RESTART IDENTITY');
    console.log('   ✅ analytics_referrers törölve');

    await client.query('TRUNCATE TABLE analytics_sessions RESTART IDENTITY');
    console.log('   ✅ analytics_sessions törölve');

    console.log('\n✅ Minden teszt adat törölve!\n');
    console.log('📊 A statisztikák mostantól valós felhasználói adatokat mutatnak.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

resetAnalytics();
