'use strict';
const rateLimit = require('express-rate-limit');

/**
 * loginLimiter — нэвтрэх endpoint-д.
 * Нэг имэйл/IP-ээс 15 минутад 5-аас илүү оролдлого хийхийг хориглоно.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5,
  message: { error: '15 минутад 5 удаа буруу оруулсан. Хүлээнэ үү.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.body?.email || req.ip), // per-email rate limit
  skipSuccessfulRequests: true,                        // амжилттай нэвтрэлт тоолдоггүй
});

/**
 * apiLimiter — бусад API endpoint-д.
 * 1 минутад 100 хүсэлтээс хэтрэхгүй байна.
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Хэт олон хүсэлт. Хүлээнэ үү.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, apiLimiter };
