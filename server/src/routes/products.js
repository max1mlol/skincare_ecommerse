'use strict';

const fs     = require('node:fs');
const path   = require('node:path');
const router = require('express').Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { query: db }    = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

const PRODUCT_UPLOAD_DIR = path.join(__dirname, '../../uploads/products');
fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });

// Product image upload: зөвхөн image MIME type зөвшөөрч, filename-д timestamp нэмнэ.
const imgStorage = multer.diskStorage({
  destination: PRODUCT_UPLOAD_DIR,
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

const upload = multer({
  storage:    imgStorage,
  limits:     { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp)$/i.test(file.mimetype)) return cb(null, true);
    cb(new Error('Зөвхөн JPEG, PNG, WebP форматтай зураг оруулах боломжтой'));
  },
});

// Product name-г URL-д ашиглах богино slug болгож хувиргана.
function toSlug(text) {
  return text.toLowerCase().trim()
             .replace(/[^\w\s-]/g, '')
             .replace(/\s+/g, '-')
             .replace(/-+/g, '-')
             .slice(0, 80);
}

const PROD_SELECT = `
  SELECT p.id, p.slug, p.brand, p.name, p.name_mn, p.description, p.price, p.original_price,
         p.image, p.images, p.badge, p.category, p.category_mn, p.skin_types, p.skin_concerns, p.tags,
         p.in_stock, p.stock_qty, p.how_to_use, p.ingredients, p.created_at, p.updated_at,
         COALESCE((SELECT COUNT(*)::int FROM reviews r WHERE r.product_id = p.id), 0) as reviews_count,
         COALESCE((SELECT ROUND(AVG(rating), 1)::float FROM reviews r WHERE r.product_id = p.id), 0) as rating
  FROM products p
`;

function normalizeImages(images, mainImage) {
  const list = Array.isArray(images) ? images : [];
  return Array.from(new Set([mainImage, ...list].filter((img) => typeof img === 'string' && img.trim()).map((img) => img.trim())));
}

const parsePositiveInt = (value, fallback, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

router.get('/', async (req, res, next) => {
  try {
    const { cat, brand, skinType, concern, inStock, sort, page = 1, limit = 20, q } = req.query;
    const currentPage = parsePositiveInt(page, 1);
    const pageSize = parsePositiveInt(limit, 20, 1000);
    const conds = [];
    const vals = [];
    let i = 1;

    if (cat)      { conds.push(`category = $${i++}`); vals.push(cat); }
    if (brand)    { conds.push(`brand = $${i++}`);    vals.push(brand); }
    if (skinType) { conds.push(`$${i++} = ANY(skin_types)`);    vals.push(skinType); }
    if (concern)  { conds.push(`$${i++} = ANY(skin_concerns)`); vals.push(concern); }
    if (inStock === 'true') conds.push('in_stock = TRUE');
    if (q) {
      conds.push(`(name ILIKE $${i} OR name_mn ILIKE $${i} OR brand ILIKE $${i})`);
      vals.push(`%${q}%`);
      i++;
    }

    const where   = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const orderBy = { 'price-asc':'price ASC', 'price-desc':'price DESC', rating:'rating DESC', newest:'created_at DESC' }[sort] || 'id ASC';
    const offset  = (currentPage - 1) * pageSize;

    // Product list болон нийт count-г хамтад нь уншиж pagination metadata үүсгэнэ.
    const [data, count] = await Promise.all([
      db(`${PROD_SELECT} ${where} ORDER BY ${orderBy} LIMIT $${i} OFFSET $${i+1}`, [...vals, pageSize, offset]),
      db(`SELECT COUNT(*) FROM products p ${where}`, vals),
    ]);

    const total = parseInt(count.rows[0].count, 10);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return res.json({
      products: data.rows,
      total,
      page: currentPage,
      limit: pageSize,
      totalPages,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/upload', requireAdmin, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Зураг шаардлагатай байна' });

  const paths = req.files.map(f => `/uploads/products/${f.filename}`);
  return res.json({ paths });
});

router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    const { rows } = await db(
      isId ? `${PROD_SELECT} WHERE p.id=$1` : `${PROD_SELECT} WHERE p.slug=$1`,
      [isId ? parseInt(idOrSlug) : idOrSlug]
    );

    if (!rows.length) return res.status(404).json({ error: 'Бүтээгдэхүүн олдсонгүй' });
    return res.json({ product: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAdmin, [
  body('name').trim().notEmpty().withMessage('Нэр заавал шаардлагатай'),
  body('price').isInt({ min: 0 }).withMessage('Үнэ 0-ээс их бүхэл тоо байна'),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const {
      name, name_mn, brand, description, price, original_price,
      image, images = [], badge, category = 'serum', category_mn, how_to_use,
      ingredients, skin_types = [], skin_concerns = [], tags = [],
      in_stock = true, stock_qty = 0,
    } = req.body;

    const productImages = normalizeImages(images, image);
    const mainImage = productImages[0] ?? null;

    const baseSlug = toSlug(name_mn || name);
    const { rows: existing } = await db('SELECT slug FROM products WHERE slug = $1', [baseSlug]);
    const slug = existing.length ? `${baseSlug}-${Date.now()}` : baseSlug;

    const { rows } = await db(
      `INSERT INTO products
         (slug,brand,name,name_mn,description,price,original_price,image,images,badge,
          category,category_mn,skin_types,skin_concerns,tags,in_stock,stock_qty,how_to_use,ingredients)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [slug,brand,name,name_mn,description,price,original_price??null,mainImage,productImages,badge??null,
       category,category_mn??category,skin_types,skin_concerns,tags,in_stock,stock_qty,how_to_use??null,ingredients??null]
    );

    return res.status(201).json({ product: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Slug давхцаж байна' });
    next(err);
  }
});

router.patch('/:idOrSlug', requireAdmin, async (req, res, next) => {
  try {
    if (req.body.images !== undefined || req.body.image !== undefined) {
      const productImages = normalizeImages(req.body.images, req.body.image);
      req.body.images = productImages;
      req.body.image = productImages[0] ?? null;
    }

    const ALLOWED = ['brand','name','name_mn','description','price','original_price',
                     'image','images','badge','category','category_mn','skin_types','skin_concerns',
                     'tags','in_stock','stock_qty','how_to_use','ingredients'];
    const sets = [];
    const vals = [];
    let i = 1;

    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) {
        sets.push(`${key}=$${i++}`);
        vals.push(req.body[key]);
      }
    }

    if (!sets.length) return res.status(400).json({ error: 'Засах талбар илгээгээгүй байна' });

    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    vals.push(isId ? parseInt(idOrSlug) : idOrSlug);
    const where = isId ? `id=$${i}` : `slug=$${i}`;

    const { rows } = await db(
      `UPDATE products SET ${sets.join(',')}, updated_at=NOW() WHERE ${where} RETURNING *`,
      vals
    );

    if (!rows.length) return res.status(404).json({ error: 'Бүтээгдэхүүн олдсонгүй' });
    return res.json({ product: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:idOrSlug', requireAdmin, async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    const { rowCount } = await db(
      isId ? 'DELETE FROM products WHERE id=$1' : 'DELETE FROM products WHERE slug=$1',
      [isId ? parseInt(idOrSlug) : idOrSlug]
    );

    if (!rowCount) return res.status(404).json({ error: 'Бүтээгдэхүүн олдсонгүй' });
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
