'use strict';
// auth.js: Хэрэглэгчийг бүртгэх, нэвтрүүлэх, системээс гаргах болон одоогийн сессийг шалгах API замууд.
// Нууц үгийн аюулгүй байдлыг хангахын тулд 32-byte санамсаргүй давс (salt) үүсгэн bcrypt-тэй нэгтгэж хэшлэх (salted hashing) аргыг ашигласан.
const router   = require('express').Router();
const crypto   = require('node:crypto');
const bcrypt   = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query: db } = require('../config/db');
const { requireAuth }   = require('../middleware/auth');
const { loginLimiter }  = require('../middleware/rateLimiter');

// Нууц үгэнд тавигдах шаардлага: Хамгийн багадаа 8 тэмдэгт, дор хаяж нэг том үсэг, нэг жижиг үсэг, нэг тоо, нэг тусгай тэмдэгт агуулсан байх ёстой
const passwordRule = body('password')
  .isLength({ min: 8 }).withMessage('Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой')
  .matches(/[A-Z]/).withMessage('Дор хаяж нэг том үсэг агуулсан байх шаардлагатай')
  .matches(/[a-z]/).withMessage('Дор хаяж нэг жижиг үсэг агуулсан байх шаардлагатай')
  .matches(/[0-9]/).withMessage('Дор хаяж нэг тоо агуулсан байх шаардлагатай')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Дор хаяж нэг тусгай тэмдэгт (!@#$%^&*) агуулсан байх шаардлагатай');

// hashPassword: Санамсаргүй 32-byte salt үүсгэн нууц үгийг bcrypt алгоритмаар hash-лах функц
// Өгөгдлийн санд нууц үгийн hash болон salt-ийг тусдаа баганад хадгална. 
const hashPassword = async (password) => {
  const salt = crypto.randomBytes(32).toString('hex'); // 32-byte хэмжээтэй санамсаргүй salt
  const hash = await bcrypt.hash(password + salt, 12); // Salt болон нууц үгийг нэгтгэн 12 дахин давтан hash-лах
  return { hash, salt };
};

// verifyPassword: Хэрэглэгчийн оруулсан нууц үгийг өгөгдлийн санд хадгалагдсан salt-тай нь нэгтгэн, hash-тай нь тулгаж шалгах функц
const verifyPassword = (password, storedHash, storedSalt) =>
  bcrypt.compare(password + storedSalt, storedHash);

// POST /api/auth/register: Шинэ хэрэглэгч бүртгэх хаяг
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('Нэр шаардлагатай'),
  body('lastName').trim().notEmpty().withMessage('Овог шаардлагатай'),
  body('phone').trim().notEmpty().withMessage('Утасны дугаар шаардлагатай'),
  body('email').isEmail().normalizeEmail().withMessage('Зөв имэйл хаяг оруулна уу'),
  passwordRule,
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { firstName, lastName, phone, email, password } = req.body;
    // Имэйл эсвэл утасны дугаар аль хэдийн бүртгэгдсэн эсэхийг давхар шалгана
    const exists = await db('SELECT id FROM users WHERE email = $1 OR phone = $2', [email, phone]);
    if (exists.rows.length) return res.status(409).json({ error: 'Имэйл эсвэл утасны дугаар аль хэдийн бүртгэгдсэн байна' });

    const { hash, salt } = await hashPassword(password);
    const { rows } = await db(
      `INSERT INTO users (first_name, last_name, phone, email, password_hash, salt, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'customer')
       RETURNING id, first_name, last_name, email, role, avatar_url, phone, created_at`,
      [firstName, lastName, phone, email, hash, salt]
    );
    const user = rows[0];
    user.name = `${user.first_name} ${user.last_name}`;
    
    // Session тогтмолжуулах халдлагаас сэргийлж шинэ session ID үүсгэнэ
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.role   = user.role;
      return res.status(201).json({ user });
    });
  } catch (err) { next(err); }
});

// POST /api/auth/login: Хэрэглэгч нэвтрэх хаяг (Rate limiter хамгаалалттай)
router.post('/login', loginLimiter, [
  body('identifier').trim().notEmpty().withMessage('Имэйл эсвэл утасны дугаар оруулна уу'),
  body('password').notEmpty().withMessage('Нууц үг оруулна уу'),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { identifier, password } = req.body;
    // Имэйл эсвэл утсаар нь хайж хэрэглэгчийг олно
    const { rows } = await db(
      'SELECT id, first_name, last_name, email, password_hash, salt, role, avatar_url, phone FROM users WHERE email = $1 OR phone = $1',
      [identifier]
    );
    const user  = rows[0];
    const valid = user && await verifyPassword(password, user.password_hash, user.salt);
    
    // Халдлагын түүх болон аюулгүй байдлын аудитын зорилгоор нэвтрэх оролдлогуудыг лог хүснэгтэд тэмдэглэнэ
    await db('INSERT INTO login_attempts (identifier, success) VALUES ($1, $2)', [identifier, !!valid]);

    if (!valid) return res.status(401).json({ error: 'Имэйл, утас эсвэл нууц үг буруу байна' });
    
    user.name = `${user.first_name} ${user.last_name}`;

    // Session ID-ийг дахин үүсгэж хадгална
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.role   = user.role;
      const { password_hash, salt, first_name, last_name, ...safeUser } = user;
      return res.json({ user: safeUser });
    });
  } catch (err) { next(err); }
});

// POST /api/auth/logout: Системээс гарах болон session cookie устгах хаяг
router.post('/logout', requireAuth, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('auraskin.sid'); // Client-ийн cookie-г цэвэрлэнэ
    return res.json({ message: 'Амжилттай гарлаа' });
  });
});

// GET /api/auth/me: Одоо нэвтэрсэн байгаа хэрэглэгчийн мэдээллийг cookie session-оос авч буцаах хаяг
router.get('/me', async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ user: null });
  try {
    const { rows } = await db(
      'SELECT id, first_name, last_name, email, role, avatar_url, phone, created_at FROM users WHERE id = $1',
      [req.session.userId]
    );
    if (!rows.length) { req.session.destroy(() => {}); return res.status(401).json({ user: null }); }
    const user = rows[0];
    user.name = `${user.first_name} ${user.last_name}`;
    return res.json({ user });
  } catch { return res.status(500).json({ error: 'Server-н алдаа' }); }
});

module.exports = { router, hashPassword, verifyPassword };
