'use strict';
// cart.js: Хэрэглэгчийн сагсны CRUD үйлдлүүд (route).
// Энэхүү файл нь хэрэглэгчийн сагсанд бүтээгдэхүүн нэмэх, тоо ширхгийг шинэчлэх, сагснаас хасах болон сагсыг бүхэлд нь хоослох API замуудыг тодорхойлно.
const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { query: db } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/cart: Нэвтэрсэн хэрэглэгчийн сагсан дахь бүх бүтээгдэхүүний мэдээллийг авах
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
  } catch (err) { next(err); }
});

// POST /api/cart: Сагсанд бүтээгдэхүүн нэмэх эсвэл хэрэв аль хэдийн нэмэгдсэн байвал тоог нь нэмэгдүүлэх
router.post('/', requireAuth, [
  body('productId').isInt().withMessage('Бүтээгдэхүүний ID зөвхөн бүхэл тоо байна'),
  body('qty').isInt({ min: 1 }).withMessage('Тоо хэмжээ хамгийн багадаа 1 байна'),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    const { productId, qty } = req.body;
    
    // Upsert logic (Ижил бүтээгдэхүүн байвал тоо ширхгийг нь нэмж шинэчилнэ, байхгүй бол шинээр нэмнэ)
    const { rows } = await db(`
      INSERT INTO cart_items (user_id, product_id, qty)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty, updated_at = NOW()
      RETURNING *
    `, [req.session.userId, productId, qty]);
    
    return res.json({ item: rows[0] });
  } catch (err) { next(err); }
});

// PATCH /api/cart/:productId: Сагсан дахь тодорхой нэг бүтээгдэхүүний тоог шинэчлэх (Жишээ нь: Сагсны хуудас дээр ширхэг өөрчлөхөд)
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
  } catch (err) { next(err); }
});

// DELETE /api/cart/:productId: Сагснаас бүтээгдэхүүнийг ID-аар нь устгах
router.delete('/:productId', requireAuth, async (req, res, next) => {
  try {
    await db('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.session.userId, req.params.productId]);
    return res.json({ message: 'Амжилттай устгалаа' });
  } catch (err) { next(err); }
});

// DELETE /api/cart: Хэрэглэгчийн сагсыг бүхэлд нь хоослох (Жишээ нь захиалга хийгдэж дууссаны дараа)
router.delete('/', requireAuth, async (req, res, next) => {
  try {
    await db('DELETE FROM cart_items WHERE user_id = $1', [req.session.userId]);
    return res.json({ message: 'Сагс амжилттай хоослогдлоо' });
  } catch (err) { next(err); }
});

module.exports = router;
