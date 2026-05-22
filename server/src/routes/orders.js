'use strict';

const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { query: db } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const isAdmin = req.session.role === 'admin';
    const { rows } = isAdmin
      ? await db(`
          SELECT o.*, (u.first_name || ' ' || u.last_name) AS user_name, u.email AS user_email
          FROM orders o LEFT JOIN users u ON u.id = o.user_id
          ORDER BY o.created_at DESC
        `)
      : await db(
          `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
          [req.session.userId]
        );

    return res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/count', requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await db("SELECT COUNT(*) FROM orders WHERE status='pending'");
    return res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Захиалга олдсонгүй' });

    const order = rows[0];
    if (req.session.role !== 'admin' && order.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'Хандах эрх хүрэлцэхгүй байна' });
    }

    return res.json({ order });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, [
  body('items').isArray({ min: 1 }).withMessage('Барааны жагсаалт хоосон байна'),
  body('items.*.productId').notEmpty(),
  body('items.*.qty').isInt({ min: 1 }),
  body('items.*.price').isInt({ min: 0 }),
  body('total').isInt({ min: 0 }),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { items, address, deliveryMethod, shippingFee } = req.body;

    // Client-ээс ирсэн price/total-д итгэхгүй; product price-г DB-с уншаад server дээр дахин бодно.
    const productIds = items.map(i => i.productId);
    const { rows: dbProducts } = await db(
      'SELECT id, price FROM products WHERE id = ANY($1::int[])',
      [productIds]
    );

    let calculatedTotal = 0;
    const safeItems = items.map(item => {
      const dbProd = dbProducts.find(p => p.id == item.productId);
      if (!dbProd) throw new Error(`Бараа олдсонгүй: ${item.productId}`);

      const realPrice = dbProd.price;
      calculatedTotal += realPrice * item.qty;
      return { ...item, price: realPrice };
    });

    const safeShippingFee = Number(shippingFee) || 0;
    calculatedTotal += safeShippingFee;

    const { rows: [{ count }] } = await db('SELECT COUNT(*) FROM orders');
    const orderNumber = `AUR-${String(parseInt(count) + 1).padStart(4, '0')}`;

    const { rows } = await db(
      `INSERT INTO orders
         (order_number, user_id, items, total, shipping_address, delivery_method, shipping_fee)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        orderNumber,
        req.session.userId,
        JSON.stringify(safeItems),
        calculatedTotal,
        JSON.stringify(address ?? {}),
        deliveryMethod ?? 'standard',
        safeShippingFee,
      ]
    );

    return res.status(201).json({ order: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', requireAdmin, [
  body('status').isIn(['pending','confirmed','shipped','delivered','cancelled']),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { rows } = await db(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [req.body.status, req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Захиалга олдсонгүй' });
    return res.json({ order: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { rowCount } = await db('DELETE FROM orders WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Захиалга олдсонгүй' });
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
