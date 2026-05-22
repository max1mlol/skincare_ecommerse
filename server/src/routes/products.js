'use strict'; // JavaScript-ийн strict горимыг идэвхжүүлж, алдаа гаргахаас сэргийлж, илүү найдвартай код бичих нөхцөлийг бүрдүүлнэ

// Энэ файл нь бүтээгдэхүүний CRUD үйлдлүүд, хайлт, шүүлтүүр болон зураг хуулах (upload) API замуудыг тодорхойлно
const fs     = require('node:fs'); // Upload хавтас байхгүй үед автоматаар үүсгэхэд ашиглана
const path   = require('node:path'); // Файлын систем болон хавтасны замуудтай ажиллах Node-ийн path модуль
const router = require('express').Router(); // Express-ийн Router-ийг дуудаж бүтээгдэхүүний замуудыг тодорхойлно
const multer = require('multer'); // Файл болон зураг хүлээн авахад ашиглах multer сан
const { body, validationResult } = require('express-validator'); // Оролтын өгөгдлийг шалгах express-validator сангийн хэрэгслүүд
const { query: db }    = require('../config/db'); // Өгөгдлийн сантай ажиллах query wrapper
const { requireAdmin } = require('../middleware/auth'); // Зөвхөн админ хандахыг шаардах middleware

// 1. Multer тохиргоо: Бүтээгдэхүүний зургийг 'uploads/products' хавтаст хадгалах ба нэрийг цаг хугацааны тамгаар давхцуулахгүй үүсгэнэ
const PRODUCT_UPLOAD_DIR = path.join(__dirname, '../../uploads/products');
fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });

const imgStorage = multer.diskStorage({
  destination: PRODUCT_UPLOAD_DIR, // Зураг хадгалагдах хавтасны бүтэн замыг заана
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`), // Зайнуудыг доогуур зураасаар солино
});

// Хэмжээний хязгаарлалт болон файлын форматын шүүлтүүрийг тохируулна
const upload = multer({
  storage:    imgStorage, // Дээр тодорхойлсон хадгалах байршлыг ашиглана
  limits:     { fileSize: 5 * 1024 * 1024 }, // Файлын дээд хэмжээг 5MB байхаар хязгаарлана
  fileFilter: (_req, file, cb) => {
    // Зөвхөн jpeg, png, webp форматын зураг оруулахыг зөвшөөрнө
    if (/^image\/(jpeg|png|webp)$/i.test(file.mimetype)) return cb(null, true); // Формат таарвал зөвшөөрнө
    cb(new Error('Зөвхөн JPEG, PNG, WebP форматтай зураг оруулах боломжтой')); // Буруу формат байвал алдаа буцаана
  },
});

/**
 * toSlug - Бүтээгдэхүүний нэрийг вэбийн хаягт (URL) тохирох slug тэмдэгт мөр рүү хөрвүүлнэ
 * Жишээ нь: "COSRX Salicylic Acid Cleanser" -> "cosrx-salicylic-acid-cleanser"
 */
function toSlug(text) {
  return text.toLowerCase().trim() // Жижиг үсэг рүү хөрвүүлж, эхлэл төгсгөлийн зайг арилгана
             .replace(/[^\w\s-]/g, '') // Үсэг, тоо, зай, зурааснаас бусад тэмдэгтүүдийг устгана
             .replace(/\s+/g, '-') // Олон зай байвал нэг зураас ашиглан солино
             .replace(/-+/g, '-') // Олон зураас байвал нэг зураас болгон цэвэрлэнэ
             .slice(0, 80); // Хамгийн ихдээ 80 тэмдэгт урттай байхаар тасална
}

// PROD_SELECT: SQL дээр бүтээгдэхүүний өгөгдлийг уншихад ашиглах үндсэн SELECT хүсэлт. Сэтгэгдлийн тоо болон дундаж үнэлгээг дэд хүсэлтээр холбоно.
const PROD_SELECT = `
  SELECT p.id, p.slug, p.brand, p.name, p.name_mn, p.description, p.price, p.original_price, 
         p.image, p.images, p.badge, p.category, p.category_mn, p.skin_types, p.skin_concerns, p.tags, 
         p.in_stock, p.stock_qty, p.how_to_use, p.ingredients, p.created_at, p.updated_at,
         COALESCE((SELECT /* Сэтгэгдлийг тоолох дэд SQL */ COUNT(*)::int FROM reviews r WHERE r.product_id = p.id), 0) as reviews_count,
         COALESCE((SELECT /* Дундаж үнэлгээг тооцоолох дэд SQL */ ROUND(AVG(rating), 1)::float FROM reviews r WHERE r.product_id = p.id), 0) as rating
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

// GET /api/products - Бүтээгдэхүүнүүдийг шүүлтүүр, эрэмбэ болон хуудаслалттайгаар унших
router.get('/', async (req, res, next) => {
  try {
    const { cat, brand, skinType, concern, inStock, sort, page = 1, limit = 20, q } = req.query; // Шүүх параметрүүдийг уншина
    const currentPage = parsePositiveInt(page, 1);
    const pageSize = parsePositiveInt(limit, 20, 1000);
    const conds = []; const vals = []; let i = 1; // SQL хайлтын нөхцөлүүд болон утгуудыг хадгалах массивууд
    
    // Ирүүлсэн параметр тус бүрээр SQL хайлтын нөхцөл (WHERE clause)-ийг бэлтгэнэ
    if (cat)      { conds.push(`category = $${i++}`); vals.push(cat); } // Ангиллаар шүүх
    if (brand)    { conds.push(`brand = $${i++}`);    vals.push(brand); } // Брэндээр шүүх
    if (skinType) { conds.push(`$${i++} = ANY(skin_types)`);    vals.push(skinType); } // Арьсны төрөл шүүх
    if (concern)  { conds.push(`$${i++} = ANY(skin_concerns)`); vals.push(concern); } // Тулгамдсан асуудлаар шүүх
    if (inStock === 'true') conds.push('in_stock = TRUE'); // Зөвхөн агуулахад байгаа барааг шүүх
    if (q) { // Нэр, монгол нэр эсвэл брэндийн нэрээр ILIKE хайлт хийх
      conds.push(`(name ILIKE $${i} OR name_mn ILIKE $${i} OR brand ILIKE $${i})`); 
      vals.push(`%${q}%`); 
      i++; 
    }
    
    const where   = conds.length ? `WHERE ${conds.join(' AND ')}` : ''; // Шүүх нөхцөлүүдийг AND-оор холбож тэмдэгт мөр үүсгэнэ
    const orderBy = { 'price-asc':'price ASC', 'price-desc':'price DESC', rating:'rating DESC', newest:'created_at DESC' }[sort] || 'id ASC'; // Эрэмбэлэх дүрмийг онооно
    const offset  = (currentPage - 1) * pageSize; // Хуудаслалтын зөрүү offset индексийг тооцоолно
    
    // Бүтээгдэхүүний жагсаалт болон нийт тоог нэгэн зэрэг уншина
    const [data, count] = await Promise.all([
      db(`/* Бүтээгдэхүүний жагсаалтыг шүүж, хуудаслаж авах SQL */ ${PROD_SELECT} ${where} ORDER BY ${orderBy} LIMIT $${i} OFFSET $${i+1}`, [...vals, pageSize, offset]),
      db(`/* Шүүсэн нийт бүтээгдэхүүнийг тоолох SQL */ SELECT COUNT(*) FROM products p ${where}`, vals),
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
    }); // Хуудасласан үр дүнг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// POST /api/products/upload - Зураг серверт хуулах (Админ-only)
router.post('/upload', requireAdmin, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Зураг шаардлагатай байна' }); // Зураг ирүүлсэн эсэхийг шалгана
  const paths = req.files.map(f => `/uploads/products/${f.filename}`); // Хуулагдсан зургуудын замыг цуглуулна
  return res.json({ paths }); // Зургуудын замыг JSON хэлбэрээр буцаана
});

// GET /api/products/:idOrSlug - Бүтээгдэхүүнийг ID эсвэл Slug-ээр нь унших
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params; // Замын параметрыг авна
    const isId = /^\d+$/.test(idOrSlug); // Хэрэв зөвхөн тоо байвал ID гэж үзнэ
    const { rows } = await db(
      isId ? `/* ID-аар бүтээгдэхүүн унших SQL */ ${PROD_SELECT} WHERE p.id=$1` : `/* Slug-ээр бүтээгдэхүүн унших SQL */ ${PROD_SELECT} WHERE p.slug=$1`, // ID эсвэл Slug ашиглан хайлт хийх сонголт
      [isId ? parseInt(idOrSlug) : idOrSlug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Бүтээгдэхүүн олдсонгүй' }); // Бүтээгдэхүүн олдохгүй бол 404 өгнө
    return res.json({ product: rows[0] }); // Олдсон бүтээгдэхүүнийг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// POST /api/products - Шинэ бүтээгдэхүүн нэмэх (Админ-only)
router.post('/', requireAdmin, [
  body('name').trim().notEmpty().withMessage('Нэр заавал шаардлагатай'), // Бүтээгдэхүүний нэр заавал байна
  body('price').isInt({ min: 0 }).withMessage('Үнэ 0-ээс их бүхэл тоо байна'), // Бүтээгдэхүүний үнэ зөв тоо байна
], async (req, res, next) => {
  try {
    const errs = validationResult(req); // Өгөгдлийн шалгалтын алдааг авна
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() }); // Алдаа байвал 400 буцаана
    const {
      name, name_mn, brand, description, price, original_price,
      image, images = [], badge, category = 'serum', category_mn, how_to_use,
      ingredients, skin_types = [], skin_concerns = [], tags = [],
      in_stock = true, stock_qty = 0,
    } = req.body; // Ирүүлсэн утгуудыг авна
    const productImages = normalizeImages(images, image);
    const mainImage = productImages[0] ?? null;
    
    const baseSlug = toSlug(name_mn || name); // Монгол эсвэл Англи нэрнээс үндсэн slug үүсгэнэ
    const { rows: existing } = await db('/* Давхцах slug байгаа эсэхийг унших SQL */ SELECT slug FROM products WHERE slug = $1', [baseSlug]); // Slug давхцаж байгаа эсэхийг шалгана
    const slug = existing.length ? `${baseSlug}-${Date.now()}` : baseSlug; // Давхцвал цаг хугацааны тамга нэмж үүсгэнэ

    const { rows } = await db( // Өгөгдлийн санд шинэ бүтээгдэхүүн нэмнэ
      `/* Шинэ бүтээгдэхүүн нэмж оруулах SQL */
       INSERT INTO products
         (slug,brand,name,name_mn,description,price,original_price,image,images,badge,
          category,category_mn,skin_types,skin_concerns,tags,in_stock,stock_qty,how_to_use,ingredients)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [slug,brand,name,name_mn,description,price,original_price??null,mainImage,productImages,badge??null,
       category,category_mn??category,skin_types,skin_concerns,tags,in_stock,stock_qty,how_to_use??null,ingredients??null]
    );
    return res.status(201).json({ product: rows[0] }); // Үүссэн бүтээгдэхүүнийг буцаана
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Slug давхцаж байна' }); // Хэрэв өгөгдлийн сангийн дахин давтагдашгүй түлхүүрийн алдаа гарвал 409 алдаа өгнө
    next(err); // Алдааг дамжуулна
  }
});

// PATCH /api/products/:idOrSlug - Бүтээгдэхүүний мэдээлэл засах (Админ-only)
router.patch('/:idOrSlug', requireAdmin, async (req, res, next) => {
  try {
    if (req.body.images !== undefined || req.body.image !== undefined) {
      const productImages = normalizeImages(req.body.images, req.body.image);
      req.body.images = productImages;
      req.body.image = productImages[0] ?? null;
    }

    const ALLOWED = ['brand','name','name_mn','description','price','original_price',
                     'image','images','badge','category','category_mn','skin_types','skin_concerns',
                     'tags','in_stock','stock_qty','how_to_use','ingredients']; // Засахыг зөвшөөрсөн талбарууд
    const sets = []; const vals = []; let i = 1; // SQL SET илэрхийлэл болон утгын параметрүүд
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) { sets.push(`${key}=$${i++}`); vals.push(req.body[key]); } // Зөвхөн ирүүлсэн утгуудыг нэмнэ
    }
    if (!sets.length) return res.status(400).json({ error: 'Засах талбар илгээгээгүй байна' }); // Засах талбар байхгүй бол 400 өгнө
    const { idOrSlug } = req.params; // Параметрийг авна
    const isId = /^\d+$/.test(idOrSlug); // Тоо эсэхийг тодорхойлно
    vals.push(isId ? parseInt(idOrSlug) : idOrSlug); // Утгын массивын төгсгөлд ID эсвэл Slug утгыг нэмнэ
    const where = isId ? `id=$${i}` : `slug=$${i}`; // Нөхцөлийг бэлтгэнэ
    const { rows } = await db( // Шинэчлэх SQL хүсэлт ажиллуулна
      `/* Бүтээгдэхүүний талбаруудыг шинэчлэн засах SQL */ UPDATE products SET ${sets.join(',')}, updated_at=NOW() WHERE ${where} RETURNING *`, vals
    );
    if (!rows.length) return res.status(404).json({ error: 'Бүтээгдэхүүн олдсонгүй' }); // Шинэчлэх бараа олдохгүй бол 404 өгнө
    return res.json({ product: rows[0] }); // Шинэчлэгдсэн бүтээгдэхүүнийг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// DELETE /api/products/:idOrSlug - Бүтээгдэхүүн устгах зам (Админ-only)
router.delete('/:idOrSlug', requireAdmin, async (req, res, next) => {
  try {
    const { idOrSlug } = req.params; // Параметрийг авна
    const isId = /^\d+$/.test(idOrSlug); // Тоо эсэхийг шалгана
    const { rowCount } = await db( // Устгах хүсэлтийг ID эсвэл Slug ашиглан ажиллуулна
      isId ? '/* ID-аар бүтээгдэхүүн устгах SQL */ DELETE FROM products WHERE id=$1' : '/* Slug-ээр бүтээгдэхүүн устгах SQL */ DELETE FROM products WHERE slug=$1',
      [isId ? parseInt(idOrSlug) : idOrSlug]
    );
    if (!rowCount) return res.status(404).json({ error: 'Бүтээгдэхүүн олдсонгүй' }); // Устгах бараа олдохгүй бол 404 өгнө
    return res.status(204).end(); // Амжилттай бол 204 No Content хариу өгнө
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// Бүтээгдэхүүний чиглүүлэгчийг экспортолно
module.exports = router;
