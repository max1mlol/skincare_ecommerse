'use strict';

const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { query: db } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// Cart route-ууд бүгд session userId ашигладаг тул хэрэглэгч зөвхөн өөрийн сагстай ажиллана.

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db(`
      SELECT c.id, c.qty, p.id as product_id, p.name, p.name_mn, p.price, p.image, p.category, p.category_mn
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at ASC
    `, [req.session.userId]);

    return res.json({ items: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, [
  body('productId').isInt().withMessage('Бүтээгдэхүүний ID зөвхөн бүхэл тоо байна'),
  body('qty').isInt({ min: 1 }).withMessage('Тоо хэмжээ хамгийн багадаа 1 байна'),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { productId, qty } = req.body;

    // Ижил product байвал qty-г нэмэгдүүлж, байхгүй бол шинэ cart item үүсгэнэ.
    const { rows } = await db(`
      INSERT INTO cart_items (user_id, product_id, qty)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty, updated_at = NOW()
      RETURNING *
    `, [req.session.userId, productId, qty]);

    return res.json({ item: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.patch('/:productId', requireAuth, [
  body('qty').isInt({ min: 1 }).withMessage('Тоо хэмжээ хамгийн багадаа 1 байна'),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { rows } = await db(`
      UPDATE cart_items
      SET qty = $1, updated_at = NOW()
      WHERE user_id = $2 AND product_id = $3
      RETURNING *
    `, [req.body.qty, req.session.userId, req.params.productId]);

    if (!rows.length) return res.status(404).json({ error: 'Сагснаас тухайн бүтээгдэхүүн олдсонгүй' });
    return res.json({ item: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:productId', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await db(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.session.userId, req.params.productId]
    );

    if (!rowCount) return res.status(404).json({ error: 'Сагснаас тухайн бүтээгдэхүүн олдсонгүй' });
    return res.json({ message: 'Бүтээгдэхүүнийг сагснаас амжилттай устгалаа' });
  } catch (err) {
    next(err);
  }
});

router.delete('/', requireAuth, async (req, res, next) => {
  try {
    await db('DELETE FROM cart_items WHERE user_id = $1', [req.session.userId]);
    return res.json({ message: 'Сагс амжилттай хоослогдлоо' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
