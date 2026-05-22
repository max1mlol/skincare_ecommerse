'use strict';

// Нэвтрэлт болон role-д суурилсан access control шалгах middleware-үүд.

/**
 * session дотор userId байгаа эсэхээр хэрэглэгч нэвтэрсэн эсэхийг шалгана.
 */
const requireAuth = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай (session олдоогүй)' });
  }

  return next();
};

/**
 * Зөвхөн admin role-той хэрэглэгчид route ашиглах эрх өгнө.
 */
const requireAdmin = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай' });
  }

  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Хандах эрх татгалзсан: Админ эрх шаардлагатай' });
  }

  return next();
};

/**
 * Өөрийн resource-д хандаж байгаа эсэхийг req.params дахь id-тай тулгана.
 * Admin хэрэглэгч бүх resource-д хандах боломжтой.
 */
const requireOwnerOrAdmin = (paramName = 'id') => (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай' });
  }

  if (req.session.role === 'admin' || req.session.userId === req.params[paramName]) {
    return next();
  }

  return res.status(403).json({ error: 'Хандах эрх татгалзсан: Зөвхөн өөрийн мэдээлэлд хандах эсвэл засах эрхтэй' });
};

module.exports = { requireAuth, requireAdmin, requireOwnerOrAdmin };
