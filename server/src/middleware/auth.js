'use strict';

// Энэхүү middleware модуль нь хэрэглэгчийн нэвтрэлт болон эрх шалгах, тодорхой замуудын хандалтыг хязгаарлах ажлыг гүйцэтгэнэ.

/**
 * requireAuth - Хэрэглэгч системд нэвтэрсэн эсэхийг session доторх userId-аар нь шалгана.
 * Хэрэв нэвтрээгүй бол 401 Unauthorized алдаа болон мэдэгдлийг буцаана.
 */
const requireAuth = (req, res, next) => {
  // Хүсэлтийн session болон session дотор userId байгаа эсэхийг шалгана
  if (!req.session?.userId) {
    // Нэвтрээгүй бол 401 статус код болон алдааны мэдээллийг JSON хэлбэрээр буцаана
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай (session олдоогүй)' });
  }
  // Нэвтэрсэн хэрэглэгч бол дараагийн ажил эсвэл middleware руу шилжүүлнэ
  return next();
};

/**
 * requireAdmin - Зөвхөн админ эрхтэй хэрэглэгчдийг нэвтрүүлнэ.
 * session дэх үүрэг (role) нь 'admin' байхыг шаардах бөгөөд эрхгүй бол 403 Forbidden алдаа өгнө.
 */
const requireAdmin = (req, res, next) => {
  // Хэрэглэгч нэвтэрсэн эсэхийг эхлээд шалгана
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай' });
  }
  // session доторх хэрэглэгчийн үүрэг нь 'admin' биш эсэхийг шалгана
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Хандах эрх татгалзсан: Админ эрх шаардлагатай' });  // Админ биш бол хандах эрхгүй гэсэн 403 статус кодыг буцаана
  }
  // Админ мөн бол дараагийн ажил руу шилжүүлнэ
  return next();
};

/**
 * requireOwnerOrAdmin - Өөрийнх нь мэдээлэл эсвэл админ байхыг шаардах эрх шалгагч.
 * @param {string} paramName - req.params доторх хэрэглэгчийн ID-ийн нэр (анхдагч утга нь 'id')
 */
const requireOwnerOrAdmin = (paramName = 'id') => (req, res, next) => {
  // Хэрэглэгч нэвтэрсэн эсэхийг шалгана
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Нэвтрэх шаардлагатай' });
  }
  // Хэрэв админ байх эсвэл хүсэлт илгээж буй хэрэглэгчийн ID нь session дэх ID-тай таарч байвал нэвтрүүлнэ
  if (req.session.role === 'admin' || req.session.userId === req.params[paramName]) {
    return next();
  }
  // Аль нь ч биш бол 403 статус код өгч хандалтыг хязгаарлана
  return res.status(403).json({ error: 'Хандах эрх татгалзсан: Зөвхөн өөрийн мэдээлэлд хандах эсвэл засах эрхтэй' });
};

// Бусад файлуудад ашиглахын тулд middleware функцуудыг экспортолно
module.exports = { requireAuth, requireAdmin, requireOwnerOrAdmin };
