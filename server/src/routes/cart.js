'use strict';

// Энэхүү файл нь хэрэглэгчийн сагсны CRUD (нэмэх, унших, засах, устгах) үйлдлүүдхийг гүйцэтгэх замуудыг тодорхойлно.
const router = require('express').Router(); // Модулийн замуудыг тодорхойлохын тулд Express Router-ийг ашиглана
const { body, validationResult } = require('express-validator'); // Оролтын өгөгдлийг шалгах express-validator сангийн хэрэгслүүд
const { query: db } = require('../config/db'); // Өгөгдлийн сантай ажиллах query wrapper
const { requireAuth } = require('../middleware/auth'); // Нэвтрэх шаардлагатайг шалгах middleware

// GET /api/cart - Нэвтэрсэн хэрэглэгчийн сагсан дахь бүх бүтээгдэхүүний мэдээллийг авах
router.get('/', requireAuth, async (req, res, next) => { // GET / замд хандахад requireAuth-оор шалгаж async функцийг ажиллуулна
  try {
    const { rows } = await db(`
      /* Сагсан дахь бараануудыг бүтээгдэхүүний өгөгдөлтэй холбож унших SQL */
      SELECT c.id, c.qty, p.id as product_id, p.name, p.name_mn, p.price, p.image, p.category, p.category_mn
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at ASC
    `, [req.session.userId]); // Сагсан дахь бараануудыг бүтээгдэхүүний мэдээлэлтэй холбож (JOIN), хэрэглэгчийн session ID-аар шүүж авна
    return res.json({ items: rows }); // Сагсны барааны жагсаалтыг JSON хэлбэрээр буцаана
  } catch (err) { 
    next(err); // Алдаа гарвал алдааны middleware руу дамжуулна
  }
});

// POST /api/cart - Сагсанд бүтээгдэхүүн нэмэх, хэрэв аль хэдийн нэмэгдсэн байвал тоо ширхгийг нь нэмэгдүүлэх
router.post('/', requireAuth, [
  body('productId').isInt().withMessage('Бүтээгдэхүүний ID зөвхөн бүхэл тоо байна'), // Бүтээгдэхүүний ID бүхэл тоо байх шаардлагатай
  body('qty').isInt({ min: 1 }).withMessage('Тоо хэмжээ хамгийн багадаа 1 байна'), // Тоо хэмжээ хамгийн багадаа 1 байна
], async (req, res, next) => {
  try {
    const errs = validationResult(req); // Өгөгдлийн шалгалтын алдааг авна
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() }); // Алдаа байвал 400 статус код буцаана
    
    const { productId, qty } = req.body; // Хүсэлтийн биеэс бүтээгдэхүүний ID болон тоог авна
    
    // Upsert logic (Ижил хэрэглэгч болон бүтээгдэхүүн байвал тоог нь нэмэгдүүлж шинэчилнэ, байхгүй бол шинээр нэмнэ)
    const { rows } = await db(`
      /* Сагсанд шинээр нэмэх эсвэл байгаа барааны тоо ширхгийг нэмэгдүүлэх SQL */
      INSERT INTO cart_items (user_id, product_id, qty)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty, updated_at = NOW()
      RETURNING *
    `, [req.session.userId, productId, qty]); // Safe SQL ашиглан өгөгдлийн санд сагсны барааг хадгална эсвэл шинэчилнэ
    
    return res.json({ item: rows[0] }); // Хадгалагдсан сагсны барааны мэдээллийг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// PATCH /api/cart/:productId - Сагсан дахь тодорхой нэг бүтээгдэхүүний тоо ширхгийг шинэчлэх
router.patch('/:productId', requireAuth, [
  body('qty').isInt({ min: 1 }).withMessage('Тоо хэмжээ хамгийн багадаа 1 байна'), // Тоо хэмжээ хамгийн багадаа 1 байна
], async (req, res, next) => {
  try {
    const errs = validationResult(req); // Шалгалтын алдааг цуглуулна
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() }); // Алдаа байвал 400 алдааг буцаана
    
    const { rows } = await db(`
      /* Сагсан дахь барааны тоо ширхгийг шинэчлэн засах SQL */
      UPDATE cart_items
      SET qty = $1, updated_at = NOW()
      WHERE user_id = $2 AND product_id = $3
      RETURNING *
    `, [req.body.qty, req.session.userId, req.params.productId]); // Өгөгдсөн хэрэглэгч болон бүтээгдэхүүний ID-тай тохирох сагсны мөрийг шинэчилнэ
    
    if (!rows.length) return res.status(404).json({ error: 'Сагснаас тухайн бүтээгдэхүүн олдсонгүй' }); // Засах мөр олдохгүй бол 404 алдаа өгнө
    return res.json({ item: rows[0] }); // Шинэчлэгдсэн сагсны барааг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// DELETE /api/cart/:productId - Сагснаас бүтээгдэхүүнийг ID-аар нь устгах
router.delete('/:productId', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await db(
      '/* Сагснаас тодорхой нэг бүтээгдэхүүнийг устгах SQL */ DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.session.userId, req.params.productId]
    ); // Хэрэглэгчийн ID болон бүтээгдэхүүний ID-аар устгах SQL хүсэлтийг ажиллуулна
    if (!rowCount) return res.status(404).json({ error: 'Сагснаас тухайн бүтээгдэхүүн олдсонгүй' }); // Устгах бараа олдохгүй бол 404 өгнө
    return res.json({ message: 'Бүтээгдэхүүнийг сагснаас амжилттай устгалаа' }); // Амжилттай устгасан тухай хариу буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// DELETE /api/cart - Хэрэглэгчийн сагсыг бүхэлд нь хоослох
router.delete('/', requireAuth, async (req, res, next) => {
  try {
    await db('/* Хэрэглэгчийн сагсыг бүхэлд нь хоослох SQL */ DELETE FROM cart_items WHERE user_id = $1', [req.session.userId]); // Хэрэглэгчийн ID-аар бүх сагсны мөрүүдийг устгана
    return res.json({ message: 'Сагс амжилттай хоослогдлоо' }); // Амжилттай хоосолсон тухай хариу буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

module.exports = router;
