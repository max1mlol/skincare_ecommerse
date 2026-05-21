'use strict'; // JavaScript-ийн strict горимыг идэвхжүүлж, алдаа гаргахаас сэргийлж, илүү найдвартай код бичих нөхцөлийг бүрдүүлнэ

// Энэ файл нь хэрэглэгчийн мэдээлэл засах, нууц үг солих, аватар зураг хуулах, админы удирдлагын замуудыг тодорхойлно.
const path   = require('node:path'); // Файлын замтай ажиллах Node-ийн path модуль
const router = require('express').Router(); // Express Router-ийг дуудаж хэрэглэгчийн замуудыг тодорхойлно
const crypto = require('node:crypto'); // Санамсаргүй найдвартай salt үүсгэх Node-ийн crypto сан
const bcrypt = require('bcryptjs'); // Нууц үг хэшлэх, тулгах bcryptjs сан
const multer = require('multer'); // Файл хүлээн авах multer сан
const { body, validationResult } = require('express-validator'); // Оролтын өгөгдөл шалгах express-validator
const { query: db }                = require('../config/db'); // Өгөгдлийн сантай ажиллах query wrapper
const { requireAuth, requireAdmin, requireOwnerOrAdmin } = require('../middleware/auth'); // Эрх шалгах middleware-үүд

// Multer тохиргоо: Хэрэглэгчийн аватар зургийг 'uploads/avatars' хавтаст хадгалах ба хэрэглэгчийн ID, цаг хугацаагаар нэрлэнэ
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/avatars'), // Аватар хадгалагдах хавтасны замыг заана
  filename:    (req, file, cb) => cb(null, `${req.session.userId}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`), // Файлын нэрийг форматлана
});

// Хэмжээ болон форматын шүүлтүүрийн тохиргоог хийнэ
const upload = multer({
  storage,
  limits:     { fileSize: 2 * 1024 * 1024 }, // Файлын дээд хэмжээг 2MB байхаар хязгаарлана
  fileFilter: (_req, file, cb) => {
    // Зөвхөн jpeg, png, webp форматтай зургуудыг зөвшөөрнө
    if (/image\/(jpeg|png|webp)/.test(file.mimetype)) return cb(null, true); // Формат таарвал зөвшөөрнө
    cb(new Error('Зөвхөн JPEG, PNG, WebP форматтай зураг оруулах боломжтой')); // Алдаа буцаана
  },
});

// GET /api/users - Нийт бүртгэлтэй хэрэглэгчдийн жагсаалтыг авах зам (Админ-only)
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await db( // Нууц үгийн хэш болон давсгүйгээр хэрэглэгчдийг уншина
      '/* Нийт хэрэглэгчдийн аюулгүй мэдээллийг унших SQL */ SELECT id, first_name, last_name, email, role, avatar_url, phone, created_at FROM users ORDER BY created_at DESC'
    );
    rows.forEach(r => r.name = `${r.first_name} ${r.last_name}`); // Хэрэглэгч тус бүрийн бүтэн нэрийг тооцоолж онооно
    return res.json({ users: rows }); // Хэрэглэгчдийн жагсаалтыг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// GET /api/users/:id - Тодорхой нэг хэрэглэгчийн профайлыг ID-аар унших зам (Зөвхөн өөрийн профайл эсвэл админ)
router.get('/:id', requireAuth, requireOwnerOrAdmin('id'), async (req, res, next) => {
  try {
    const { rows } = await db( // Хэрэглэгчийн мэдээллийг өгөгдлийн сангаас уншина
      '/* Хэрэглэгчийг ID-аар унших SQL */ SELECT id, first_name, last_name, email, role, avatar_url, phone, created_at FROM users WHERE id=$1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' }); // Байхгүй бол 404 өгнө
    const user = rows[0]; // Хэрэглэгчийг авна
    user.name = `${user.first_name} ${user.last_name}`; // Бүтэн нэрийг онооно
    return res.json({ user }); // Профайлыг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// PATCH /api/users/:id - Хэрэглэгчийн хувийн мэдээллийг (нэр, утас, үүрэг) шинэчлэх зам
router.patch('/:id', requireAuth, requireOwnerOrAdmin('id'), [
  body('firstName').optional().trim().notEmpty().withMessage('Нэр хоосон байж болохгүй'), // Хэрэв ирүүлбэл хоосон биш байна
  body('lastName').optional().trim().notEmpty().withMessage('Овог хоосон байж болохгүй'), // Хэрэв ирүүлбэл хоосон биш байна
  body('phone').optional().trim(), // Утасны дугаар (optional)
], async (req, res, next) => {
  try {
    const errs = validationResult(req); // Өгөгдлийн шалгалтын алдааг авна
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() }); // Алдаа байвал 400 буцаана
    
    // Ирүүлсэн camelCase утгуудыг өгөгдлийн сангийн snake_case баганы нэр рүү хөрвүүлнэ
    if (req.body.firstName) req.body.first_name = req.body.firstName;
    if (req.body.lastName) req.body.last_name = req.body.lastName;

    const isAdmin = req.session?.role === 'admin'; // Хэрэглэгч админ эсэхийг тогтооно
    // Жирийн хэрэглэгч зөвхөн нэр, утсаа засах эрхтэй бол админ хэрэглэгчийн систем дэх үүргийг (role) мөн солих боломжтой
    const allowed = isAdmin ? ['first_name', 'last_name', 'phone', 'role'] : ['first_name', 'last_name', 'phone'];
    const sets = []; const vals = []; let n = 1; // SQL SET илэрхийлэл болон утгын параметрүүд
    for (const k of allowed) {
      if (req.body[k] !== undefined) { sets.push(`${k}=$${n++}`); vals.push(req.body[k]); } // Ирүүлсэн талбаруудыг нэмнэ
    }
    if (!sets.length) return res.status(400).json({ error: 'Шинэчлэх мэдээлэл илгээгүй байна' }); // Засах талбар байхгүй бол 400 өгнө
    vals.push(req.params.id); // Утгуудын төгсгөлд ID-ийг нэмнэ
    const { rows } = await db( // Шинэчлэх SQL хүсэлт ажиллуулна
      `/* Хэрэглэгчийн өгөгдлийг засаж шинэчлэх SQL */ UPDATE users SET ${sets.join(',')} , updated_at=NOW() WHERE id=$${n} RETURNING id,first_name,last_name,email,role,avatar_url,phone`,
      vals
    );
    if (!rows.length) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' }); // Хэрэглэгч олдохгүй бол 404 өгнө
    const user = rows[0]; // Засагдсан хэрэглэгчийг авна
    user.name = `${user.first_name} ${user.last_name}`; // Бүтэн нэрийг онооно
    return res.json({ user }); // Засагдсан хэрэглэгчийг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// PATCH /api/users/:id/password - Нууц үг солих зам (Хуучин нууц үгийг заавал шалгана)
router.patch('/:id/password', requireAuth, requireOwnerOrAdmin('id'), [
  body('currentPassword').notEmpty().withMessage('Одоогийн нууц үг шаардлагатай'), // Одоогийн нууц үг заавал байна
  body('newPassword').isLength({ min: 8 }).withMessage('Шинэ нууц үг хамгийн багадаа 8 тэмдэгт байна'), // Шинэ нууц үг 8-аас багагүй тэмдэгттэй байна
], async (req, res, next) => {
  try {
    const errs = validationResult(req); // Өгөгдлийн шалгалтын алдааг авна
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() }); // Алдаа байвал 400 буцаана
    const { currentPassword, newPassword } = req.body; // Нууц үгүүдийг авна
    const { rows } = await db('/* Нууц үг шалгахаар хэш болон давс унших SQL */ SELECT password_hash, salt FROM users WHERE id=$1', [req.params.id]); // Хэрэглэгчийн хэш болон давсыг уншина
    if (!rows.length) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' }); // Олдохгүй бол 404 өгнө
    
    const { password_hash, salt } = rows[0]; // Утгуудыг авна
    const valid = await bcrypt.compare(currentPassword + salt, password_hash); // Одоогийн нууц үг зөв эсэхийг bcrypt-ээр харьцуулж шалгана
    if (!valid) return res.status(400).json({ error: 'Одоогийн нууц үг буруу байна' }); // Буруу бол 400 өгнө
    
    // Шинэ нууц үгийг шинээр үүсгэсэн 32-byte давстай хослуулан дахин хэшлэнэ
    const newSalt = crypto.randomBytes(32).toString('hex'); // Шинэ давс үүсгэнэ
    const newHash = await bcrypt.hash(newPassword + newSalt, 12); // Шинэ хэш үүсгэнэ
    await db('/* Шинэ нууц үгийг хадгалах SQL */ UPDATE users SET password_hash=$1, salt=$2, updated_at=NOW() WHERE id=$3', [newHash, newSalt, req.params.id]); // Өгөгдлийн санд шинэчилж хадгална
    return res.json({ message: 'Нууц үг амжилттай солигдлоо' }); // Амжилттай болсон мэдэгдлийг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// POST /api/users/:id/avatar - Профайл зураг (аватар) хуулах зам (Эзэн эсвэл админ)
router.post('/:id/avatar', requireAuth, requireOwnerOrAdmin('id'), upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Хуулах файл олдсонгүй' }); // Файл ирүүлсэн эсэхийг шалгана
    const url = `/uploads/avatars/${req.file.filename}`; // Вэбээс хандах зургийн замыг бэлтгэнэ
    const { rows } = await db( // Өгөгдлийн санд зургийн хаягийг хадгална
      '/* Аватар зургийн замыг хадгалах SQL */ UPDATE users SET avatar_url=$1, updated_at=NOW() WHERE id=$2 RETURNING id,first_name,last_name,email,role,avatar_url',
      [url, req.params.id]
    );
    const user = rows[0]; // Шинэчлэгдсэн хэрэглэгчийг авна
    user.name = `${user.first_name} ${user.last_name}`; // Бүтэн нэрийг онооно
    return res.json({ user }); // Шинэчлэгдсэн хэрэглэгчийн мэдээллийг буцаана
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// DELETE /api/users/:id - Хэрэглэгч устгах зам (Админ-only)
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { rowCount } = await db('/* Хэрэглэгчийг өгөгдлийн сангаас устгах SQL */ DELETE FROM users WHERE id=$1', [req.params.id]); // Хэрэглэгчийг устгах SQL хүсэлт ажиллуулна
    if (!rowCount) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' }); // Устгах хэрэглэгч байхгүй бол 404 өгнө
    return res.status(204).end(); // Амжилттай бол 204 No Content хариу өгнө
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// Хэрэглэгчийн чиглүүлэгчийг экспортолно
module.exports = router;
