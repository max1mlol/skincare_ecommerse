'use strict';
// users.js — хэрэглэгчийн профайл, avatar, нууц үг солих route-ууд
const path   = require('node:path');
const router = require('express').Router();
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { body, validationResult }   = require('express-validator');
const { query: db }                = require('../config/db');
const { requireAuth, requireAdmin, requireOwnerOrAdmin } = require('../middleware/auth');

// Multer: avatar upload — 2MB хязгаар, зөвхөн зураг
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/avatars'),
  filename:    (req, file, cb) => cb(null, `${req.session.userId}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
});
const upload = multer({
  storage,
  limits:     { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/image\/(jpeg|png|webp)/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Зөвхөн JPEG, PNG, WebP зураг оруулна уу'));
  },
});

// GET /api/users — Admin: бүх хэрэглэгчийн жагсаалт
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await db(
      'SELECT id, first_name, last_name, email, role, avatar_url, phone, created_at FROM users ORDER BY created_at DESC'
    );
    rows.forEach(r => r.name = `${r.first_name} ${r.last_name}`);
    return res.json({ users: rows });
  } catch (err) { next(err); }
});

// GET /api/users/:id — өөрийн эсвэл admin л харна
router.get('/:id', requireAuth, requireOwnerOrAdmin('id'), async (req, res, next) => {
  try {
    const { rows } = await db(
      'SELECT id, first_name, last_name, email, role, avatar_url, phone, created_at FROM users WHERE id=$1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
    const user = rows[0];
    user.name = `${user.first_name} ${user.last_name}`;
    return res.json({ user });
  } catch (err) { next(err); }
});

router.patch('/:id', requireAuth, requireOwnerOrAdmin('id'), [
  body('firstName').optional().trim().notEmpty().withMessage('Нэр хоосон байж болохгүй'),
  body('lastName').optional().trim().notEmpty().withMessage('Овог хоосон байж болохгүй'),
  body('phone').optional().trim(),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    
    // Convert camelCase keys to snake_case for DB
    if (req.body.firstName) req.body.first_name = req.body.firstName;
    if (req.body.lastName) req.body.last_name = req.body.lastName;

    const isAdmin = req.session?.role === 'admin';
    const allowed = isAdmin ? ['first_name', 'last_name', 'phone', 'role'] : ['first_name', 'last_name', 'phone'];
    const sets = []; const vals = []; let n = 1;
    for (const k of allowed) {
      if (req.body[k] !== undefined) { sets.push(`${k}=$${n++}`); vals.push(req.body[k]); }
    }
    if (!sets.length) return res.status(400).json({ error: 'Засах талбар байхгүй' });
    vals.push(req.params.id);
    const { rows } = await db(
      `UPDATE users SET ${sets.join(',')} , updated_at=NOW() WHERE id=$${n} RETURNING id,first_name,last_name,email,role,avatar_url,phone`,
      vals
    );
    if (!rows.length) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
    const user = rows[0];
    user.name = `${user.first_name} ${user.last_name}`;
    return res.json({ user });
  } catch (err) { next(err); }
});

// PATCH /api/users/:id/password — нууц үг солих
router.patch('/:id/password', requireAuth, requireOwnerOrAdmin('id'), [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    const { currentPassword, newPassword } = req.body;
    const { rows } = await db('SELECT password_hash, salt FROM users WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
    const { password_hash, salt } = rows[0];
    const valid = await bcrypt.compare(currentPassword + salt, password_hash);
    if (!valid) return res.status(400).json({ error: 'Одоогийн нууц үг буруу байна' });
    const newSalt = crypto.randomBytes(32).toString('hex');
    const newHash = await bcrypt.hash(newPassword + newSalt, 12);
    await db('UPDATE users SET password_hash=$1, salt=$2, updated_at=NOW() WHERE id=$3', [newHash, newSalt, req.params.id]);
    return res.json({ message: 'Нууц үг амжилттай солигдлоо' });
  } catch (err) { next(err); }
});

// POST /api/users/:id/avatar — профайл зураг upload
router.post('/:id/avatar', requireAuth, requireOwnerOrAdmin('id'), upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Зураг шаардлагатай' });
    const url = `/uploads/avatars/${req.file.filename}`;
    const { rows } = await db(
      'UPDATE users SET avatar_url=$1, updated_at=NOW() WHERE id=$2 RETURNING id,first_name,last_name,email,role,avatar_url',
      [url, req.params.id]
    );
    const user = rows[0];
    user.name = `${user.first_name} ${user.last_name}`;
    return res.json({ user });
  } catch (err) { next(err); }
});

// DELETE /api/users/:id — Admin only
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { rowCount } = await db('DELETE FROM users WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
    return res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
