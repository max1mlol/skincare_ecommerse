'use strict';
// middleware/auth.js — Нэвтрэлт болон эрх шалгах хамгаалалтын давхаргууд (Middleware).
// Энэхүү модул нь Express сервер дээр ирж буй хүсэлтүүдэд сессийн шалгалт хийж, хандах эрхийг хязгаарлана.

/**
 * requireAuth — Хэрэглэгч нэвтэрсэн эсэхийг сесс доторх userId-аар нь шалгана.
 * Нэвтрээгүй хэрэглэгчдэд 401 Unauthorized алдааг буцаана.
 */
const requireAuth = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай (Session олдоогүй)' });
  }
  return next(); // Эрх бүхий хэрэглэгч бол дараагийн ажилд шилжүүлнэ
};

/**
 * requireAdmin — Зөвхөн админ эрхтэй хэрэглэгчдийг нэвтрүүлнэ.
 * Session-ийн role 'admin' байхыг шаардах бөгөөд хандах эрхгүй бол 403 Forbidden алдаа өгнө.
 */
const requireAdmin = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай' });
  }
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Зөвхөн админ хандах эрхтэй)' });
  }
  return next();
};

/**
 * requireOwnerOrAdmin — Өөрийнх нь мэдээлэл эсвэл админ байхыг шаардах эрх шалгагч.
 * Жишээ нь: Хэрэглэгч өөрийн мэдээллээ засах эсвэл админ засах эрхтэй үед хэрэглэгдэнэ.
 * @param {string} paramName  req.params-аас унших хэрэглэгчийн ID-ийн нэр (анхдагч утга нь 'id')
 */
const requireOwnerOrAdmin = (paramName = 'id') => (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай' });
  }
  // Хэрэв админ байх эсвэл хүсэлт илгээж буй хэрэглэгчийн ID нь сесс дэх ID-тай таарч байвал нэвтрүүлнэ
  if (req.session.role === 'admin' || req.session.userId === req.params[paramName]) {
    return next();
  }
  return res.status(403).json({ error: 'Зөвхөн өөрийн мэдээлэлд хандах эсвэл засах эрхтэй' });
};

module.exports = { requireAuth, requireAdmin, requireOwnerOrAdmin };
