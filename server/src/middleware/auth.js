'use strict';

/**
 * requireAuth — session дотор userId байгаа эсэхийг шалгана.
 * Байхгүй бол 401 буцаана.
 */
const requireAuth = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай' });
  }
  return next();
};

/**
 * requireAdmin — admin role шаардана.
 */
const requireAdmin = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай' });
  }
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Хандах эрх хүрэлцэхгүй (admin only)' });
  }
  return next();
};

/**
 * requireOwnerOrAdmin — URL param-д байгаа id нь session userId-тай
 * тохирох эсвэл admin байвал зөвшөөрнө.
 * @param {string} paramName  req.params дахь id-ийн нэр
 */
const requireOwnerOrAdmin = (paramName = 'id') => (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай' });
  }
  if (req.session.role === 'admin' || req.session.userId === req.params[paramName]) {
    return next();
  }
  return res.status(403).json({ error: 'Зөвхөн өөрийн мэдээлэлд хандах эрхтэй' });
};

module.exports = { requireAuth, requireAdmin, requireOwnerOrAdmin };
