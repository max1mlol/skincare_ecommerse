'use strict'; // JavaScript-ийн strict горимыг идэвхжүүлж, алдаа гаргахаас сэргийлж, илүү найдвартай код бичих нөхцөлийг бүрдүүлнэ

// Энэ файл нь захиалга үүсгэх, захиалгын түүх харах, төлөв өөрчлөх зэрэг захиалгын замуудыг тодорхойлно.
const router = require('express').Router(); // Express-ийн Router-ийг дуудаж захиалгын замуудыг тодорхойлно
const { body, validationResult } = require('express-validator'); // Оролтын өгөгдлийг шалгах express-validator сангийн хэрэгслүүд
const { query: db }              = require('../config/db'); // Өгөгдлийн сангийн query функцийг db нэрээр оруулж ирнэ
const { requireAuth, requireAdmin } = require('../middleware/auth'); // Нэвтрэлт болон админ эрх шалгах middleware-үүд

// GET /api/orders - Захиалгын түүхийг авах (Админ бол бүх захиалгыг, хэрэглэгч бол зөвхөн өөрийнхийг харна)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const isAdmin  = req.session.role === 'admin'; // Хэрэглэгч админ эрхтэй эсэхийг тодорхойлно
    const { rows } = isAdmin
      ? await db(`/* Админ хэрэглэгч бүх захиалгыг унших SQL */
                  SELECT o.*, (u.first_name || ' ' || u.last_name) AS user_name, u.email AS user_email
                  FROM orders o LEFT JOIN users u ON u.id = o.user_id
                  ORDER BY o.created_at DESC`) // Админ бол бүх захиалгыг хэрэглэгчийн мэдээллийн хамт уншина
      : await db(`/* Жирийн хэрэглэгч өөрийн захиалгын түүхийг унших SQL */
                  SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
                 [req.session.userId]); // Жирийн хэрэглэгч бол зөвхөн өөрийн захиалгыг уншина
    return res.json({ orders: rows }); // Захиалгуудын жагсаалтыг JSON хэлбэрээр буцаана
  } catch (err) { 
    next(err); // Алдааг алдааны middleware руу дамжуулна
  }
});

// GET /api/orders/count - Шинээр хүлээгдэж буй (pending) захиалгын тоог авах (Админ-only)
router.get('/count', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await db("/* Хүлээгдэж буй нийт захиалгыг тоолох SQL */ SELECT COUNT(*) FROM orders WHERE status='pending'"); // Захиалгын төлөв 'pending' байгаа захиалгуудыг тоолно
    return res.json({ count: parseInt(rows[0].count) }); // Тоолсон утгыг бүхэл тоо болгон буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// GET /api/orders/:id - Захиалгыг ID-аар нь унших (Зөвхөн захиалгыг үүсгэсэн эзэн эсвэл админ хандах эрхтэй)
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db('/* Захиалгыг ID-аар унших SQL */ SELECT * FROM orders WHERE id = $1', [req.params.id]); // ID-аар хайх хүсэлт ажиллуулна
    if (!rows.length) return res.status(404).json({ error: 'Захиалга олдсонгүй' }); // Захиалга олдохгүй бол 404 өгнө
    const order = rows[0]; // Захиалгын өгөгдлийг авна
    
    // Хэрэглэгч админ биш бөгөөд захиалгын user_id нь нэвтэрсэн хэрэглэгчийн ID-тай таарахгүй бол хандалтыг хаана
    if (req.session.role !== 'admin' && order.user_id !== req.session.userId)
      return res.status(403).json({ error: 'Хандах эрх хүрэлцэхгүй байна' }); // 403 Forbidden хариу өгнө
      
    return res.json({ order }); // Захиалгын дэлгэрэнгүйг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// POST /api/orders - Шинээр захиалга үүсгэх
router.post('/', requireAuth, [
  body('items').isArray({ min: 1 }).withMessage('Барааны жагсаалт хоосон байна'), // Бараануудын массив хамгийн багадаа 1 урттай байна
  body('items.*.productId').notEmpty(), // Бараа бүр productId-тай байх ёстой
  body('items.*.qty').isInt({ min: 1 }), // Бараа бүрийн тоо ширхэг 1-ээс багагүй байна
  body('items.*.price').isInt({ min: 0 }), // Бараа бүрийн үнэ 0-ээс багагүй байна
  body('total').isInt({ min: 0 }), // Нийт дүн 0-ээс багагүй байна
], async (req, res, next) => {
  try {
    const errs = validationResult(req); // Өгөгдлийн шалгалтын үр дүнг авна
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() }); // Алдаа байвал 400 буцаана

    const { items, address, deliveryMethod, shippingFee } = req.body; // Хүсэлтийн өгөгдлийг авна

    // Хэрэглэгч вэб дээр барааны үнийг хуурамчаар өөрчлөн серверийг хуурахаас сэргийлнэ.
    // Захиалгын барааны ID-аар өгөгдлийн сангаас бодит үнүүдийг шүүж, нийт дүнг сервер талд дахин тооцоолно.
    const productIds = items.map(i => i.productId); // Захиалгын барааны ID-уудын жагсаалтыг бэлтгэнэ
    const { rows: dbProducts } = await db('/* Барааны ID жагсаалтаар бодит үнийг авах SQL */ SELECT id, price FROM products WHERE id = ANY($1::int[])', [productIds]); // Өгөгдлийн сангаас үнийг авна

    let calculatedTotal = 0; // Тооцоолсон нийт дүнгийн эхлэх утга
    const safeItems = items.map(item => {
      const dbProd = dbProducts.find(p => p.id == item.productId); // DB-ийн үр дүнгээс тохирох барааг олно
      if (!dbProd) throw new Error(`Бараа олдсонгүй: ${item.productId}`); // Бараа олдохгүй бол алдаа шиднэ
      
      const realPrice = dbProd.price; // DB дээрх бодит үнийг авна
      calculatedTotal += realPrice * item.qty; // Бодит үнийг тоо ширхгээр үржүүлж нийт дүн дээр нэмнэ
      return { ...item, price: realPrice }; // Хэрэглэгчийн ирүүлсэн үнийг дараад бодит үнээр сольж бичнэ
    });

    const safeShippingFee = Number(shippingFee) || 0; // Хүргэлтийн төлбөрийг тоо руу хөрвүүлнэ, байхгүй бол 0
    calculatedTotal += safeShippingFee; // Нийт дүн дээр хүргэлтийн төлбөрийг нэмнэ

    // Захиалгын дугаарыг AUR-0001 хэлбэртэй автоматаар дараалуулан үүсгэх логик
    const { rows: [{ count }] } = await db('/* Нийт захиалгын тоог авах SQL */ SELECT COUNT(*) FROM orders'); // Нийт захиалгын мөрийн тоог олно
    const orderNumber = `AUR-${String(parseInt(count) + 1).padStart(4, '0')}`; // Одоогийн тоон дээр 1-ийг нэмж, 4 оронтой болгож 0-ээр дүүргэнэ

    const { rows } = await db( // Шинэ захиалгыг өгөгдлийн санд хадгална
      `/* Шинэ захиалгыг өгөгдлийн санд нэмэх SQL */
       INSERT INTO orders
         (order_number, user_id, items, total, shipping_address, delivery_method, shipping_fee)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        orderNumber,
        req.session.userId, // Хэрэглэгчийн ID-ийг сессээс авна
        JSON.stringify(safeItems), // Бараануудыг JSON хэлбэрээр тэмдэгт мөр рүү хөрвүүлнэ
        calculatedTotal, // Серверт тооцоолсон найдвартай нийт дүнг оруулна
        JSON.stringify(address ?? {}), // Хаягийг JSON болгож хувиргана, байхгүй бол хоосон объект
        deliveryMethod ?? 'standard', // Хүргэлтийн төрөл, байхгүй бол 'standard'
        safeShippingFee, // Хүргэлтийн төлбөр
      ]
    );
    return res.status(201).json({ order: rows[0] }); // 201 Created статус болон үүссэн захиалгыг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// PATCH /api/orders/:id/status - Захиалгын төлөвийг (статус) өөрчлөх (Админ-only)
router.patch('/:id/status', requireAdmin, [
  body('status').isIn(['pending','confirmed','shipped','delivered','cancelled']), // Зөвхөн тодорхойлсон төлөвүүдийг зөвшөөрнө
], async (req, res, next) => {
  try {
    const errs = validationResult(req); // Алдааг авна
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() }); // Алдаа байвал 400 өгнө
    const { rows } = await db(
      '/* Захиалгын төлөвийг шинэчлэн засах SQL */ UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [req.body.status, req.params.id]
    ); // Захиалгын төлөвийг шинэчилж одоогийн цагийг тавина
    if (!rows.length) return res.status(404).json({ error: 'Захиалга олдсонгүй' }); // Захиалга байхгүй бол 404 өгнө
    return res.json({ order: rows[0] }); // Шинэчлэгдсэн захиалгыг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// DELETE /api/orders/:id - Захиалгыг устгах (Админ-only)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { rowCount } = await db('/* Захиалгыг өгөгдлийн сангаас устгах SQL */ DELETE FROM orders WHERE id=$1', [req.params.id]); // Захиалгыг устгах SQL ажиллуулна
    if (!rowCount) return res.status(404).json({ error: 'Захиалга олдсонгүй' }); // Устгах захиалга байхгүй бол 404 өгнө
    return res.status(204).end(); // Амжилттай бол 204 No Content хариуг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

module.exports = router;
