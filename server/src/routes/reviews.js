'use strict'; // JavaScript-ийн strict горимыг идэвхжүүлж, алдаа гаргахаас сэргийлж, илүү найдвартай код бичих нөхцөлийг бүрдүүлнэ

// Энэ файл нь бүтээгдэхүүний сэтгэгдэл, үнэлгээ болон хэрэглэгчийн санал хүсэлтийн замуудыг тодорхойлно.
// Анхааруулга: Сэтгэгдэл нэмэгдэх/устгагдах үед бүтээгдэхүүний дундаж үнэлгээ болон нийт сэтгэгдлийн тоо нь өгөгдлийн сангийн trigger функцээр автоматаар шинэчлэгдэнэ.
const router = require('express').Router(); // Express-ийн Router-ийг дуудаж сэтгэгдлийн замуудыг тодорхойлно
const { body, query, validationResult } = require('express-validator'); // Оролтын өгөгдлийг шалгах express-validator сангийн хэрэгслүүд
const { query: db }  = require('../config/db'); // Өгөгдлийн сантай ажиллах query wrapper
const { requireAuth, requireOwnerOrAdmin } = require('../middleware/auth'); // Нэвтрэлт болон эрх шалгах middleware-үүд

// GET /api/reviews - Тухайн бүтээгдэхүүний ID-аар холбоотой бүх сэтгэгдлүүдийг хэрэглэгчийн овог нэр, аватарын хамт авах зам
router.get('/', async (req, res, next) => {
  try {
    const pid = parseInt(req.query.productId); // Хүсэлтийн query параметрээс бүтээгдэхүүний ID-ийг бүхэл тоо болгон авна
    if (!pid) return res.status(400).json({ error: 'productId параметр шаардлагатай' }); // ID байхгүй бол 400 алдаа өгнө
    const { rows } = await db( // Бүтээгдэхүүний ID-аар сэтгэгдлийг бичсэн хэрэглэгчийн мэдээлэлтэй холбож уншина
      `/* Бүтээгдэхүүний сэтгэгдлүүдийг хэрэглэгчийн нэртэй холбож авах SQL */
       SELECT r.*, (u.first_name || ' ' || u.last_name) AS user_name, u.avatar_url
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [pid]
    );
    return res.json({ reviews: rows }); // Олдсон сэтгэгдлүүдийг JSON хэлбэрээр буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// POST /api/reviews - Бүтээгдэхүүнд үнэлгээ (1-5 од) болон сэтгэгдэл бичих эсвэл өмнөх үнэлгээг шинэчлэх зам
router.post('/', requireAuth, [
  body('productId').isInt({ min: 1 }), // Бүтээгдэхүүний ID нь 1-ээс их бүхэл тоо байна
  body('rating').isInt({ min: 1, max: 5 }), // Үнэлгээ нь 1-ээс 5-ын хооронд байна
  body('body').trim().isLength({ min: 1, max: 2000 }).withMessage('Сэтгэгдлийн урт 1-ээс 2000 тэмдэгт байна'), // Сэтгэгдлийн урт шалгах дүрэм
], async (req, res, next) => {
  try {
    const errs = validationResult(req); // Өгөгдлийн шалгалтын алдааг авна
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() }); // Алдаа байвал 400 буцаана

    const { productId, rating, body: reviewBody } = req.body; // Ирүүлсэн утгуудыг авна

    // Сэтгэгдэл бичиж буй бүтээгдэхүүн системд бодитоор байгаа эсэхийг шалгана
    const { rows: prod } = await db('/* Бүтээгдэхүүн бодитоор оршин буй эсэхийг унших SQL */ SELECT id FROM products WHERE id=$1', [productId]);
    if (!prod.length) return res.status(404).json({ error: 'Бүтээгдэхүүн олдсонгүй' }); // Байхгүй бол 404 өгнө

    // Сэтгэгдэл оруулах хүсэлт. Хэрэв тухайн хэрэглэгч тухайн бүтээгдэхүүнд өмнө нь сэтгэгдэл бичсэн бол шинэчилнэ (Upsert).
    const { rows } = await db(
      `/* Шинэ сэтгэгдэл нэмэх эсвэл байвал шинэчлэн засах SQL */
       INSERT INTO reviews (user_id, product_id, rating, body)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET rating=$3, body=$4, updated_at=NOW()
       RETURNING *`,
      [req.session.userId, productId, rating, reviewBody] // Safe SQL параметрүүд
    );
    
    // Сэтгэгдэл үлдээсэн хэрэглэгчийн овог нэр, аватарыг өгөгдлийн сангаас авч UI руу шууд харуулахаар буцаана
    const { rows: [user] } = await db('/* Хэрэглэгчийн нэр, аватарыг авах SQL */ SELECT (first_name || \' \' || last_name) AS name, avatar_url FROM users WHERE id=$1', [req.session.userId]);
    return res.status(201).json({ review: { ...rows[0], user_name: user.name, avatar_url: user.avatar_url } }); // Нэгтгэсэн сэтгэгдлийг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// DELETE /api/reviews/:id - Сэтгэгдлийг устгах зам (Зөвхөн сэтгэгдэл бичсэн эзэн эсвэл админ эрхтэй хэрэглэгч устгах боломжтой)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db('/* Сэтгэгдлийг бичсэн хэрэглэгчийн ID-ийг унших SQL */ SELECT user_id FROM reviews WHERE id=$1', [req.params.id]); // Сэтгэгдлийг бичсэн хэрэглэгчийн ID-ийг уншина
    if (!rows.length) return res.status(404).json({ error: 'Сэтгэгдэл олдсонгүй' }); // Сэтгэгдэл байхгүй бол 404 өгнө
    
    // Хандах эрхийн шалгалт: админ биш бөгөөд сэтгэгдлийг бичсэн эзэн нь биш бол устгахыг зөвшөөрөхгүй
    if (req.session.role !== 'admin' && rows[0].user_id !== req.session.userId)
      return res.status(403).json({ error: 'Хандах эрх татгалзсан: Устгах эрхгүй байна' }); // 403 Forbidden алдаа
      
    await db('/* Сэтгэгдлийг ID-аар устгах SQL */ DELETE FROM reviews WHERE id=$1', [req.params.id]); // Сэтгэгдлийг устгана
    return res.status(204).end(); // Амжилттай бол 204 No Content хариу өгнө
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// GET /api/reviews/count - Системд байгаа нийт сэтгэгдлийн тоог авах зам (Админ-only)
router.get('/count', requireAuth, async (req, res, next) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: 'Хандах эрх татгалзсан: Админ эрх шаардлагатай' }); // Админ мөн эсэхийг шалгана
  try {
    const { rows } = await db("/* Нийт сэтгэгдлийн мөрийг тоолох SQL */ SELECT COUNT(*) FROM reviews"); // Нийт сэтгэгдлийн тоог олно
    return res.json({ count: parseInt(rows[0].count) }); // Тоог бүхэл тоо болгон буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// GET /api/reviews/all - Системд байгаа сүүлийн 100 сэтгэгдлийг бүтээгдэхүүний нэртэй холбож авах зам (Админ-only)
router.get('/all', requireAuth, async (req, res, next) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: 'Хандах эрх татгалзсан: Админ эрх шаардлагатай' }); // Эрх шалгана
  try {
    const { rows } = await db( // Сүүлийн 100 сэтгэгдлийг хэрэглэгчийн нэр болон бүтээгдэхүүний нэртэй холбож уншина
      `/* Сүүлийн 100 сэтгэгдлийг хэрэглэгч болон бүтээгдэхүүнтэй холбож унших SQL */
       SELECT r.*, (u.first_name || ' ' || u.last_name) AS user_name, p.name AS product_name, p.name_mn AS product_name_mn
       FROM reviews r
       JOIN users    u ON u.id = r.user_id
       JOIN products p ON p.id = r.product_id
       ORDER BY r.created_at DESC LIMIT 100`
    );
    return res.json({ reviews: rows }); // Жагсаалтыг JSON хэлбэрээр буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// Сэтгэгдлийн чиглүүлэгчийг экспортолно
module.exports = router;
