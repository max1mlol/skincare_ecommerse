'use strict';
// db.js: Өгөгдлийн сангийн холболтын тохиргоо (PostgreSQL Connection Pool).
// Энэхүү файл нь Neon (үүлэн өгөгдлийн сан) эсвэл локал машин дээрх PostgreSQL рүү холбогдох Pool-ийг үүсгэж удирдах бөгөөд SSL горимыг автоматаар илрүүлнэ.
const { Pool } = require('pg');

// Neon өгөгдлийн сан мөн эсэх болон SSL шаардлагатай эсэхийг илрүүлэх логик
const rawDatabaseUrl = process.env.DATABASE_URL ?? '';
const connectionString = rawDatabaseUrl.replace('sslmode=require', 'sslmode=verify-full');
const isNeon = rawDatabaseUrl.includes('neon.tech');
const isCloud = isNeon || /sslmode=(require|verify-full)/.test(rawDatabaseUrl);

const pool = new Pool({
  connectionString,
  // Үүлэн (Neon) санд холбогдоход SSL ашиглаж, локал сан ашиглах үед SSL шаардахгүй
  ssl: isCloud,
  max:                     isCloud ? 5 : 20, // Үүлэн сангийн холболтын тоог хязгаарлах (Neon холболтын дээд хязгаартай)
  idleTimeoutMillis:       30_000,           // Холболт сул (идэвхгүй) байж болох дээд хугацаа (миллисекунд)
  connectionTimeoutMillis: 5_000,            // Шинэ холболт үүсгэхэд хүлээх дээд хугацаа
});

// Өгөгдлийн сантай амжилттай холбогдоход консол дээр мэдээлэл хэвлэх
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DB] Connected → ${isCloud ? 'Cloud (Neon)' : 'Local PostgreSQL'}`);
  }
});

// Холболтын явцад гарсан алдааг бүртгэх
pool.on('error', (err) => { console.error('[DB] Pool error:', err.message); });

// query: Express route-ууд дээр SQL хүсэлт ажиллуулах хялбаршуулсан wrapper функц
const query = (text, params) => pool.query(text, params);
module.exports = { pool, query };
