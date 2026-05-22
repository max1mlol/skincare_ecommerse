'use strict';

const rateLimit = require('express-rate-limit');

// Login brute-force оролдлогоос хамгаална: 15 минутанд 5 failed request.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Хэт олон удаа нэвтрэх оролдлого хийлээ. 15 минут хүлээнэ үү.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.body?.email || req.ip),
  skipSuccessfulRequests: true,
});

// Ерөнхий API ачааллыг нэг IP дээр минутанд 100 request-ээр хязгаарлана.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, apiLimiter };
