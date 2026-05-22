'use strict';

const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { query: db }  = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// Review нэмэх/устгах үед product rating болон reviews_count-г database trigger шинэчилдэг.

router.get('/', async (req, res, next) => {
  try {
    const pid = parseInt(req.query.productId);
    if (!pid) return res.status(400).json({ error: 'productId параметр шаардлагатай' });

    const { rows } = await db(
      `SELECT r.*, (u.first_name || ' ' || u.last_name) AS user_name, u.avatar_url
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [pid]
    );

    return res.json({ reviews: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, [
  body('productId').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('body').trim().isLength({ min: 1, max: 2000 }).withMessage('Сэтгэгдлийн урт 1-ээс 2000 тэмдэгт байна'),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { productId, rating, body: reviewBody } = req.body;

    const { rows: prod } = await db('SELECT id FROM products WHERE id=$1', [productId]);
    if (!prod.length) return res.status(404).json({ error: 'Бүтээгдэхүүн олдсонгүй' });

    // Нэг user нэг product дээр нэг review-тэй байна; дахин бичвэл өмнөх review шинэчлэгдэнэ.
    const { rows } = await db(
      `INSERT INTO reviews (user_id, product_id, rating, body)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET rating=$3, body=$4, updated_at=NOW()
       RETURNING *`,
      [req.session.userId, productId, rating, reviewBody]
    );

    const { rows: [user] } = await db(
      'SELECT (first_name || \' \' || last_name) AS name, avatar_url FROM users WHERE id=$1',
      [req.session.userId]
    );

    return res.status(201).json({ review: { ...rows[0], user_name: user.name, avatar_url: user.avatar_url } });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db('SELECT user_id FROM reviews WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Сэтгэгдэл олдсонгүй' });

    if (req.session.role !== 'admin' && rows[0].user_id !== req.session.userId) {
      return res.status(403).json({ error: 'Хандах эрх татгалзсан: Устгах эрхгүй байна' });
    }

    await db('DELETE FROM reviews WHERE id=$1', [req.params.id]);
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/count', requireAuth, async (req, res, next) => {
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Хандах эрх татгалзсан: Админ эрх шаардлагатай' });
  }

  try {
    const { rows } = await db('SELECT COUNT(*) FROM reviews');
    return res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    next(err);
  }
});

router.get('/all', requireAuth, async (req, res, next) => {
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Хандах эрх татгалзсан: Админ эрх шаардлагатай' });
  }

  try {
    const { rows } = await db(
      `SELECT r.*, (u.first_name || ' ' || u.last_name) AS user_name, p.name AS product_name, p.name_mn AS product_name_mn
       FROM reviews r
       JOIN users    u ON u.id = r.user_id
       JOIN products p ON p.id = r.product_id
       ORDER BY r.created_at DESC LIMIT 100`
    );

    return res.json({ reviews: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
