'use strict';
// auth.js — нэвтрэх, бүртгүүлэх, гарах route-ууд
// Нууц үгийг random salt + bcrypt-ээр хэшлэж DB-д тусдаа хадгална (salted hashing).
const router   = require('express').Router();
const crypto   = require('node:crypto');
const bcrypt   = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query: db } = require('../config/db');
const { requireAuth }   = require('../middleware/auth');
const { loginLimiter }  = require('../middleware/rateLimiter');

// Нууц үгийн шаардлагууд — 8+ тэмдэгт, том/жижиг үсэг, тоо, тусгай тэмдэгт
const passwordRule = body('password')
  .isLength({ min: 8 }).withMessage('8+ тэмдэгт байх ёстой')
  .matches(/[A-Z]/).withMessage('Том үсэг шаардлагатай')
  .matches(/[a-z]/).withMessage('Жижиг үсэг шаардлагатай')
  .matches(/[0-9]/).withMessage('Тоо шаардлагатай')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Тусгай тэмдэгт шаардлагатай');

// Санамсаргүй 32-byte salt үүсгэж, нууц үгтэй нэгтгэн bcrypt хэш хийнэ.
// Hash болон salt-ыг DB-д ТУСДАА хадгална (salted hashing шаардлага).
const hashPassword = async (password) => {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = await bcrypt.hash(password + salt, 12);
  return { hash, salt };
};

// Нэвтрэх үед: оруулсан нууц үгийг хадгалсан salt-тай нэгтгэж дахин хэшлэнэ.
const verifyPassword = (password, storedHash, storedSalt) =>
  bcrypt.compare(password + storedSalt, storedHash);

// POST /api/auth/register — шинэ хэрэглэгч бүртгүүлэх
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('Нэр шаардлагатай'),
  body('lastName').trim().notEmpty().withMessage('Овог шаардлагатай'),
  body('phone').trim().notEmpty().withMessage('Утасны дугаар шаардлагатай'),
  body('email').isEmail().normalizeEmail().withMessage('Имэйл буруу байна'),
  passwordRule,
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { firstName, lastName, phone, email, password } = req.body;
    const exists = await db('SELECT id FROM users WHERE email = $1 OR phone = $2', [email, phone]);
    if (exists.rows.length) return res.status(409).json({ error: 'Имэйл эсвэл утасны дугаар бүртгэлтэй байна' });

    const { hash, salt } = await hashPassword(password);
    const { rows } = await db(
      `INSERT INTO users (first_name, last_name, phone, email, password_hash, salt, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'customer')
       RETURNING id, first_name, last_name, email, role, avatar_url, phone, created_at`,
      [firstName, lastName, phone, email, hash, salt]
    );
    const user = rows[0];
    // Return full name as 'name' for frontend compatibility if needed
    user.name = `${user.first_name} ${user.last_name}`;
    
    // Session тогтмолдуулах халдлагаас хамгаалах зорилгоор session-г шинэчилнэ
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.role   = user.role;
      return res.status(201).json({ user });
    });
  } catch (err) { next(err); }
});

// POST /api/auth/login — нэвтрэх (15 минутад 5 оролдлоготой хязгаарлалт)
router.post('/login', loginLimiter, [
  body('identifier').trim().notEmpty().withMessage('Имэйл эсвэл утасны дугаар шаардлагатай'),
  body('password').notEmpty().withMessage('Нууц үг шаардлагатай'),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { identifier, password } = req.body;
    const { rows } = await db(
      'SELECT id, first_name, last_name, email, password_hash, salt, role, avatar_url, phone FROM users WHERE email = $1 OR phone = $1',
      [identifier]
    );
    const user  = rows[0];
    const valid = user && await verifyPassword(password, user.password_hash, user.salt);
    // Амжилтгүй болон амжилттай оролдлогыг бүртгэнэ (аудит лог)
    await db('INSERT INTO login_attempts (identifier, success) VALUES ($1, $2)', [identifier, !!valid]);

    if (!valid) return res.status(401).json({ error: 'Нэвтрэх мэдээлэл буруу байна' });
    
    // Add 'name' for frontend compatibility
    user.name = `${user.first_name} ${user.last_name}`;

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.role   = user.role;
      const { password_hash, salt, first_name, last_name, ...safeUser } = user;
      return res.json({ user: safeUser });
    });
  } catch (err) { next(err); }
});

// POST /api/auth/logout — гарах, session устгах
router.post('/logout', requireAuth, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('auraskin.sid');
    return res.json({ message: 'Амжилттай гарлаа' });
  });
});

// GET /api/auth/me — одоогийн нэвтэрсэн хэрэглэгчийн мэдээлэл авах
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
  } catch { return res.status(500).json({ error: 'Серверийн алдаа' }); }
});

module.exports = { router, hashPassword, verifyPassword };
