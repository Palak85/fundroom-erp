const { isConfigured, supabase } = require('../config/db');
const fs = require('fs');
const path = require('path');

const runSeed = async () => {
  console.log('🌱 Starting Database Seeding...');

  if (isConfigured && supabase) {
    console.log('Connecting to Supabase PostgreSQL database...');
    const seedSql = fs.readFileSync(path.join(__dirname, '../../database/seed.sql'), 'utf-8');
    // Note: If using Supabase JS client directly, queries can be executed or run via SQL Editor.
    console.log('✅ Supabase database configured. SQL seed script is ready at backend/database/seed.sql');
  } else {
    console.log('✅ Local store is preloaded with seed users, products, customers, and challans.');
  }

  console.log('\nDefault Test Accounts:');
  console.log('--------------------------------------------------');
  console.log('1. Admin:     admin@example.com     / Password@123');
  console.log('2. Sales:     sales@example.com     / Password@123');
  console.log('3. Warehouse: warehouse@example.com / Password@123');
  console.log('4. Accounts:  accounts@example.com  / Password@123');
  console.log('--------------------------------------------------');
};

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
