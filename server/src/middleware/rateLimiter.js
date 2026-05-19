'use strict';
// middleware/rateLimiter.js — Хүсэлтийн хурдыг хязгаарлах хамгаалалт (Rate Limiter).
// Серверийг DDOS болон Brute-Force (нууц үг таах) халдлагаас хамгаалахад ашиглагдана.
const rateLimit = require('express-rate-limit');

/**
 * loginLimiter — Нэвтрэх хэсэгт зориулсан хязгаарлалт.
 * 15 минутын дотор тухайн IP эсвэл Имэйл хаягаар 5-аас олон удаа буруу оролдвол түр хориг тавина.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // Дээд тал нь 5 удаа
  message: { error: 'Олон удаа нэвтрэх оролдлого хийлээ. 15 минут хүлээнэ үү.' },
  standardHeaders: true, // `RateLimit-*` толгой мэдээллийг хариунд илгээнэ
  legacyHeaders: false, // Хуучин X-RateLimit-* толгойг идэвхгүй болгоно
  keyGenerator: (req) => (req.body?.email || req.ip), // Хэрэглэгчийн имэйл эсвэл IP хаягаар нь ялгаж тоолно (per-email limit)
  skipSuccessfulRequests: true, // Амжилттай нэвтэрвэл буруу оролдлогын тоолуурыг тоолохгүй
});

/**
 * apiLimiter — Ерөнхий API endpoint-уудад тавих хязгаарлалт.
 * 1 минутад (60 секунд) нэг хэрэглэгчээс ирэх хүсэлтийг хамгийн ихдээ 100 байхаар хязгаарлана.
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минут
  max: 100, // Дээд тал нь 100 хүсэлт
  message: { error: 'Хэт олон хүсэлт илгээлээ. Хэсэг хугацааны дараа дахин оролдоно уу.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, apiLimiter };
