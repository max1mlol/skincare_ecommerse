'use strict'; // JavaScript-ийн strict горимыг идэвхжүүлж, алдаа гаргахаас сэргийлж, илүү найдвартай код бичих нөхцөлийг бүрдүүлнэ

// Энэ файл нь хэрэглэгч бүртгэх, нэвтрэх, гарах болон session шалгах API замуудыг тодорхойлно.
// Нууц үгийг аюулгүй хадгалахын тулд санамсаргүй 32-byte давс (salt) үүсгэж, bcrypt-тэй хослуулан хэшлэх арга ашигласан.
const router   = require('express').Router(); // Модулийн замуудыг тодорхойлоход Express Router-ийг ашиглана
const crypto   = require('node:crypto'); // Санамсаргүй найдвартай байт үүсгэхэд зориулж Node-ийн crypto санг ашиглана
const bcrypt   = require('bcryptjs'); // Нууц үг хэшлэх болон харьцуулж шалгахад bcryptjs санг ашиглана
const { body, validationResult } = require('express-validator'); // Оролтын өгөгдлийг шалгах express-validator сангийн хэрэгслүүд
const { query: db } = require('../config/db'); // Өгөгдлийн сантай холбогдож ажиллах query wrapper
const { requireAuth }   = require('../middleware/auth'); // Нэвтрэх шаардлагатайг шалгах middleware
const { loginLimiter }  = require('../middleware/rateLimiter'); // Брут-форс халдлагаас сэргийлж нэвтрэх хурдыг хязгаарлагч

// Нууц үгэнд тавигдах шаардлага: Хамгийн багадаа 8 тэмдэгт, 1 том үсэг, 1 жижиг үсэг, 1 тоо, 1 тусгай тэмдэгт
const passwordRule = body('password')
  .isLength({ min: 8 }).withMessage('Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой')
  .matches(/[A-Z]/).withMessage('Дор хаяж нэг том үсэг агуулсан байх шаардлагатай')
  .matches(/[a-z]/).withMessage('Дор хаяж нэг жижиг үсэг агуулсан байх шаардлагатай')
  .matches(/[0-9]/).withMessage('Дор хаяж нэг тоо агуулсан байх шаардлагатай')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Дор хаяж нэг тусгай тэмдэгт (!@#$%^&*) агуулсан байх шаардлагатай');

// hashPassword - Санамсаргүй 32-byte давс (salt) үүсгэж, нууц үгийг bcrypt алгоритмаар 12 дахин хэшлэх туслах функц.
const hashPassword = async (password) => {
  const salt = crypto.randomBytes(32).toString('hex'); // Криптографын хувьд найдвартай 32 санамсаргүй байтыг үүсгэж hex тэмдэгт рүү хөрвүүлнэ
  const hash = await bcrypt.hash(password + salt, 12); // Нууц үгийг salt-тай нэгтгэн, 12 үе шаттайгаар хэшлэнэ
  return { hash, salt }; // Үүссэн хэш болон давсыг тусад нь хадгалахаар буцаана
};

// verifyPassword - Оруулсан нууц үгийг хадгалагдсан salt-тай нэгтгэж, хадгалагдсан bcrypt hash-тай харьцуулан зөв эсэхийг шалгах функц.
const verifyPassword = (password, storedHash, storedSalt) =>
  bcrypt.compare(password + storedSalt, storedHash); // Нэгтгэсэн нууц үгийг hash-тай тулгах бөгөөд boolean амлалт (promise) буцаана

// POST /api/auth/register - Шинэ хэрэглэгч бүртгэх зам
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('Нэр шаардлагатай'), // Нэр хоосон биш байх ба зайг арилгана
  body('lastName').trim().notEmpty().withMessage('Овог шаардлагатай'),
  body('phone').trim().notEmpty().withMessage('Утасны дугаар шаардлагатай'),
  body('email').isEmail().normalizeEmail().withMessage('Зөв имэйл хаяг оруулна уу'), // Имэйл хаяг зөв форматтай эсэхийг шалгана
  passwordRule, // Дээр тодорхойлсон нууц үгийн дүрмийг хэрэглэнэ
], async (req, res, next) => {
  try {
    const errs = validationResult(req); // Шалгалтын явцад гарсан алдаануудыг цуглуулна
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() }); // Алдаа байвал 400 Bad Request алдааг JSON-оор буцаана

    const { firstName, lastName, phone, email, password } = req.body; // Хэрэглэгчийн мэдээллүүдийг задалж авна
    
    // Имэйл эсвэл утасны дугаар өмнө нь бүртгэгдсэн эсэхийг DB-с шалгана
    const exists = await db('/* Имэйл болон утсаар давхцал шалгах SQL */ SELECT id FROM users WHERE email = $1 OR phone = $2', [email, phone]);
    if (exists.rows.length) return res.status(409).json({ error: 'Имэйл эсвэл утасны дугаар аль хэдийн бүртгэгдсэн байна' }); // Бүртгэлтэй бол 409 Conflict алдаа өгнө

    const { hash, salt } = await hashPassword(password); // Нууц үгийг hash-лах, харгалзах salt-ыг үүсгэнэ
    const { rows } = await db( // Шинэ хэрэглэгчийг DB-д нэмж оруулна
      `/* Шинэ хэрэглэгч бүртгэх SQL */
       INSERT INTO users (first_name, last_name, phone, email, password_hash, salt, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'customer')
       RETURNING id, first_name, last_name, email, role, avatar_url, phone, created_at`,
      [firstName, lastName, phone, email, hash, salt] // SQL тарилга (injection)-аас сэргийлж утгуудыг найдвартай дамжуулна
    );
    const user = rows[0]; // Бүртгэгдсэн хэрэглэгчийн өгөгдлийг авна
    user.name = `${user.first_name} ${user.last_name}`; // Бүтэн нэрийг тооцоолж үүсгэнэ
    
    // session хулгайлах халдлагаас сэргийлж, session ID-ийг шинээр дахин үүсгэнэ
    req.session.regenerate((err) => {
      if (err) return next(err); // session шинэчлэхэд алдаа гарвал дараагийн алдааны middleware руу дамжуулна
      req.session.userId = user.id; // Шинэ session дотор хэрэглэгчийн ID-г хадгална
      req.session.role   = user.role;
      return res.status(201).json({ user }); // 201 Created статус болон бүртгэгдсэн хэрэглэгчийн мэдээллийг буцаана
    });
  } catch (err) { 
    next(err); // Алдаа гарвал алдааны middleware руу дамжуулна
  }
});

// POST /api/auth/login - Системд нэвтрэх зам
router.post('/login', loginLimiter, [
  body('identifier').trim().notEmpty().withMessage('Имэйл эсвэл утасны дугаар оруулна уу'), // Имэйл эсвэл утас заавал шаардлагатай
  body('password').notEmpty().withMessage('Нууц үг оруулна уу'), // Нууц үг заавал шаардлагатай
], async (req, res, next) => {
  try {
    const errs = validationResult(req); // Өгөгдлийн шалгалтын алдааг авна
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() }); // Алдаа байвал 400 статус код буцаана

    const { identifier, password } = req.body; // Нэвтрэх хэрэглэгчийн нэр, нууц үгийг авна
    
    // Имэйл эсвэл утасны дугаараар нь хэрэглэгчийг DB-с хайна
    const { rows } = await db(
      '/* Имэйл эсвэл утсаар хэрэглэгч хайх SQL */ SELECT id, first_name, last_name, email, password_hash, salt, role, avatar_url, phone FROM users WHERE email = $1 OR phone = $1',
      [identifier]
    );
    const user  = rows[0]; // Хайлтын үр дүнд олдсон хэрэглэгчийг авна
    const valid = user && await verifyPassword(password, user.password_hash, user.salt); // Хэрэглэгч олдсон бол нууц үгийг нь тулгаж шалгана
    
    // Нэвтрэх оролдлогуудыг аюулгүй байдлын аудитад зориулан лог (login_attempts) хүснэгтэд тэмдэглэнэ
    await db('/* Нэвтрэх оролдлогыг бүртгэх SQL */ INSERT INTO login_attempts (identifier, success) VALUES ($1, $2)', [identifier, !!valid]);

    if (!valid) return res.status(401).json({ error: 'Имэйл, утас эсвэл нууц үг буруу байна' }); // Нууц үг буруу бол 401 Unauthorized алдаа өгнө
    
    user.name = `${user.first_name} ${user.last_name}`; // Бүтэн нэрийг тооцоолно

    // Амжилттай нэвтэрсний дараа sessionийг дахин шинээр үүсгэж хадгална
    req.session.regenerate((err) => {
      if (err) return next(err); // Алдаа гарвал дамжуулна
      req.session.userId = user.id; // sessionэд хэрэглэгчийн ID-ийг олгоно
      req.session.role   = user.role; // sessionэд хэрэглэгчийн үүргийг олгоно
      const { password_hash, salt, first_name, last_name, ...safeUser } = user; // Нууц үгийн хэш, давс зэрэг эмзэг өгөгдлийг хасаж, аюулгүй хэрэглэгчийн объект үүсгэнэ
      return res.json({ user: safeUser }); // Аюулгүй хэрэглэгчийн мэдээллийг JSON хариу болгож илгээнэ
    });
  } catch (err) { 
    next(err); // Алдааг дамжуулна
  }
});

// POST /api/auth/logout - Системээс гарах болон session устгах зам
router.post('/logout', requireAuth, (req, res, next) => {
  req.session.destroy((err) => { // Сервер тал дахь идэвхтэй session-г устгана
    if (err) return next(err); // Алдаа гарвал дамжуулна
    res.clearCookie('auraskin.sid'); // Хэрэглэгчийн хөтөч дээрх session тодорхойлогч cookie-г цэвэрлэнэ
    return res.json({ message: 'Амжилттай гарлаа' }); // Амжилттай гарсан тухай хариу буцаана
  });
});

// GET /api/auth/me - Хэрэглэгчийн идэвхтэй session-н cookie-ээс профайлын мэдээллийг сэргээн авах зам
router.get('/me', async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ user: null }); // Хэрэв session дотор userId байхгүй бол 401 статус болон null утгыг буцаана
  try {
    const { rows } = await db( // session дэх userId-аар хэрэглэгчийн мэдээллийг өгөгдлийн сангаас шүүж авна
      '/* sessionээр хэрэглэгчийн мэдээлэл авах SQL */ SELECT id, first_name, last_name, email, role, avatar_url, phone, created_at FROM users WHERE id = $1',
      [req.session.userId]
    );
    if (!rows.length) { // Хэрэв хэрэглэгч db-д олдохгүй бол (жишээ нь: устгагдсан хэрэглэгч)
      req.session.destroy(() => {}); // Хүчингүй session-г устгана
      return res.status(401).json({ user: null }); // 401 статус болон null утгыг буцаана
    }
    const user = rows[0]; // Хэрэглэгчийн мэдээллийг авна
    user.name = `${user.first_name} ${user.last_name}`; // Овог нэрийг нэгтгэнэ
    return res.json({ user }); // Профайлын мэдээллийг буцаана
  } catch { 
    return res.status(500).json({ error: 'Серверийн алдаа' }); // DB-тай холбогдоход алдаа гарвал 500 алдааг өгнө
  }
});

// Туршилт болон бусад модульд ашиглахад зориулж чиглүүлэгч болон туслах функцуудыг экспортолно
module.exports = { router, hashPassword, verifyPassword };
