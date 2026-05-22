'use strict';

const path   = require('node:path');
const router = require('express').Router();
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { query: db } = require('../config/db');
const { requireAuth, requireAdmin, requireOwnerOrAdmin } = require('../middleware/auth');

// Avatar upload: userId болон timestamp ашиглаж filename давхцахаас сэргийлнэ.
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/avatars'),
  filename:    (req, file, cb) => cb(null, `${req.session.userId}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/image\/(jpeg|png|webp)/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Зөвхөн JPEG, PNG, WebP форматтай зураг оруулах боломжтой'));
  },
});

router.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await db(
      'SELECT id, first_name, last_name, email, role, avatar_url, phone, created_at FROM users ORDER BY created_at DESC'
    );

    rows.forEach(r => r.name = `${r.first_name} ${r.last_name}`);
    return res.json({ users: rows });
  } catch (err) {
    next(err);
  }
});

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
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireAuth, requireOwnerOrAdmin('id'), [
  body('firstName').optional().trim().notEmpty().withMessage('Нэр хоосон байж болохгүй'),
  body('lastName').optional().trim().notEmpty().withMessage('Овог хоосон байж болохгүй'),
  body('phone').optional().trim(),
], async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    if (req.body.firstName) req.body.first_name = req.body.firstName;
    if (req.body.lastName) req.body.last_name = req.body.lastName;

    // customer зөвхөн хувийн мэдээллээ, admin нэмэлтээр role-г өөрчилж чадна.
    const isAdmin = req.session?.role === 'admin';
    const allowed = isAdmin ? ['first_name', 'last_name', 'phone', 'role'] : ['first_name', 'last_name', 'phone'];
    const sets = [];
    const vals = [];
    let n = 1;

    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        sets.push(`${k}=$${n++}`);
        vals.push(req.body[k]);
      }
    }

    if (!sets.length) return res.status(400).json({ error: 'Шинэчлэх мэдээлэл илгээгүй байна' });

    vals.push(req.params.id);
    const { rows } = await db(
      `UPDATE users SET ${sets.join(',')} , updated_at=NOW() WHERE id=$${n} RETURNING id,first_name,last_name,email,role,avatar_url,phone`,
      vals
    );

    if (!rows.length) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });

    const user = rows[0];
    user.name = `${user.first_name} ${user.last_name}`;
    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/password', requireAuth, requireOwnerOrAdmin('id'), [
  body('currentPassword').notEmpty().withMessage('Одоогийн нууц үг шаардлагатай'),
  body('newPassword').isLength({ min: 8 }).withMessage('Шинэ нууц үг хамгийн багадаа 8 тэмдэгт байна'),
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
  } catch (err) {
    next(err);
  }
});

router.post('/:id/avatar', requireAuth, requireOwnerOrAdmin('id'), upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Хуулах файл олдсонгүй' });

    const url = `/uploads/avatars/${req.file.filename}`;
    const { rows } = await db(
      'UPDATE users SET avatar_url=$1, updated_at=NOW() WHERE id=$2 RETURNING id,first_name,last_name,email,role,avatar_url',
      [url, req.params.id]
    );

    const user = rows[0];
    user.name = `${user.first_name} ${user.last_name}`;
    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { rowCount } = await db('DELETE FROM users WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
