#!/usr/bin/env node
// seed.js — бараа болон admin хэрэглэгчийг DB-д оруулна (Neon болон локал аль алинд ажиллана)
'use strict';
require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Pool } = require('pg');

const isCloud = (process.env.DATABASE_URL ?? '').includes('neon.tech') ||
                (process.env.DATABASE_URL ?? '').includes('sslmode=require');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isCloud ? { rejectUnauthorized: false } : false,
});

async function main() {
  // ── 1. Бараа ──────────────────────────────────────────────
  const code  = require('fs').readFileSync(
    require('path').join(__dirname, '../../src/lib/products.js'), 'utf8'
  );
  const match = code.match(/export const PRODUCTS\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error('PRODUCTS not found in products.js');
  const PRODUCTS = eval(match[1]);

  console.log(`Seeding ${PRODUCTS.length} products...`);
  for (const p of PRODUCTS) {
    await pool.query(
      `INSERT INTO products
         (id, slug, brand, name, name_mn, description, price, original_price,
          image, badge, rating, reviews_count, category, category_mn,
          skin_types, skin_concerns, tags, in_stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT (id) DO UPDATE SET
         slug=EXCLUDED.slug, brand=EXCLUDED.brand, name=EXCLUDED.name,
         name_mn=EXCLUDED.name_mn, description=EXCLUDED.description,
         price=EXCLUDED.price, original_price=EXCLUDED.original_price,
         image=EXCLUDED.image, badge=EXCLUDED.badge,
         rating=EXCLUDED.rating, reviews_count=EXCLUDED.reviews_count,
         category=EXCLUDED.category, category_mn=EXCLUDED.category_mn,
         skin_types=EXCLUDED.skin_types, skin_concerns=EXCLUDED.skin_concerns,
         tags=EXCLUDED.tags, in_stock=EXCLUDED.in_stock`,
      [
        p.id, p.slug, p.brand, p.name, p.nameMn, p.description,
        p.price, p.originalPrice ?? null, p.image, p.badge ?? null,
        p.rating, p.reviews ?? 0,
        p.category, p.categoryMn,
        p.skinTypes ?? [], p.skinConcerns ?? [], p.tags ?? [],
        p.inStock !== false,
      ]
    );
    console.log(`  ✓ ${p.id}. ${p.nameMn}`);
  }
  await pool.query(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`);

  // ── 2. Admin хэрэглэгч ────────────────────────────────────
  console.log('\nCreating admin user...');
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = await bcrypt.hash('Admin_1234' + salt, 12);
  await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, salt, role, phone)
     VALUES ($1, $2, $3, $4, $5, 'admin', $6)
     ON CONFLICT (email) DO UPDATE SET
       password_hash=$4, salt=$5, role='admin', first_name=$1, last_name=$2, phone=$6`,
    ['System', 'Admin', 'admin@gmail.com', hash, salt, '00000000']
  );
  console.log('  ✓ admin@gmail.com (Admin_1234)');

  console.log('\n✅ Seed complete!');
  await pool.end();
}

main().catch((e) => { console.error('❌ Seed error:', e.message); process.exit(1); });
