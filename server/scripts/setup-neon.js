#!/usr/bin/env node
// setup-neon.js — Neon cloud DB-г тохируулах туслах script
// node scripts/setup-neon.js <NEON_CONNECTION_STRING>
'use strict';
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connStr = process.argv[2];
if (!connStr) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║        AURA SKIN — Neon Cloud DB Setup                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  1. https://neon.tech → бүртгэл үүсгэх                      ║
║  2. New Project → auraskin → Asia Pacific (Singapore)        ║
║  3. Dashboard → Connection string → копи                     ║
║  4. Доорх командыг ажиллуулах:                               ║
║                                                              ║
║  node scripts/setup-neon.js "postgresql://user:pass@..."     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
  process.exit(0);
}

async function main() {
  console.log('🔌 Neon DB-д холбогдож байна...');
  const pool = new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false } });

  try {
    await pool.query('SELECT 1');
    console.log('✅ Холболт амжилттай!');
  } catch (e) {
    console.error('❌ Холболт амжилтгүй:', e.message);
    process.exit(1);
  }

  // Schema файл уншиж ажиллуулна
  const schemaPath = path.join(__dirname, '../migrations/001_schema.sql');
  const schema     = fs.readFileSync(schemaPath, 'utf8');
  console.log('📦 Schema үүсгэж байна...');
  await pool.query(schema);
  console.log('✅ Schema амжилттай!');

  // .env файл шинэчлэх
  const envPath    = path.join(__dirname, '../.env');
  let   envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(/^DATABASE_URL=.*/m, `DATABASE_URL=${connStr}`);
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env файл шинэчлэгдлээ');

  // Seed хийх эсэхийг асуух
  console.log('\n⏳ Бараа оруулж байна...');
  const { Pool: Pool2 } = require('pg');
  process.env.DATABASE_URL = connStr;

  // seed.js-г дуудна
  require('./seed');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
