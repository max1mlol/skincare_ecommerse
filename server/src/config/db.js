'use strict';
// db.js — PostgreSQL connection pool
// Neon (cloud) болон локал Homebrew postgres хоёуланг автоматаар таньдаг.
// sslmode=require байвал (Neon URL) SSL-ийг идэвхжүүлнэ.
const { Pool } = require('pg');

const isNeon = (process.env.DATABASE_URL ?? '').includes('neon.tech');
const isCloud = isNeon || process.env.DATABASE_URL?.includes('sslmode=require');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon / cloud DB: SSL шаардлагатай. Локал Homebrew: SSL хэрэггүй.
  ssl: isCloud ? { rejectUnauthorized: false } : false,
  max:                     isCloud ? 5 : 20, // Neon-д connection хязгаарлагдмал
  idleTimeoutMillis:       30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DB] Connected → ${isCloud ? 'Cloud (Neon)' : 'Local PostgreSQL'}`);
  }
});
pool.on('error', (err) => { console.error('[DB] Pool error:', err.message); });

const query = (text, params) => pool.query(text, params);
module.exports = { pool, query };
