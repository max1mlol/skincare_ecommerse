'use strict';
// index.js — Express серверийн үндсэн файл
// Middleware, session, route-уудыг нэгтгэж серверийг эхлүүлнэ.
require('dotenv').config();

const express   = require('express');
const session   = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const helmet    = require('helmet');
const cors      = require('cors');
const morgan    = require('morgan');
const path      = require('node:path');
const { pool }  = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');

const app  = express();
const PORT = process.env.PORT || 4000;
const PROD = process.env.NODE_ENV === 'production';
const TEST = process.env.NODE_ENV === 'test';

// Аюулгүй байдлын HTTP header-ууд нэмнэ
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Next.js-ийн хүсэлтийг зөвшөөрнө (credentials:include cookie дамжуулахад шаардлагатай)
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Хүсэлтийн лог — test горимд хэрэгтэй биш
if (!TEST) app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Байршуулсан зурагнуудыг статик файлаар нийлүүлнэ
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Session: test горимд MemoryStore, бусад горимд PostgreSQL-д хадгална
const sessionStore = TEST ? undefined : new PgSession({
  pool,
  tableName:            'session',
  createTableIfMissing: true,
});

app.use(session({
  ...(sessionStore ? { store: sessionStore } : {}),
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  name:              'auraskin.sid',
  cookie: {
    httpOnly: true,                    // XSS халдлагаас хамгаалах
    secure:   PROD,                    // HTTPS зөвхөн production-д
    sameSite: 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 хоног
  },
}));

// Бүх /api/* route-д хурд хязгаарлалт (DDoS, brute-force-оос хамгаалах)
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/cart', require('./routes/cart'));

// Серверийн эрүүл байдлыг шалгах endpoint
app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// 404 — route олдоогүй
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Глобал алдааны handler — дараагийн middleware-д дамжиж ирсэн алдааг барьна
app.use((err, _req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀  API  →  http://localhost:${PORT}`));
}

module.exports = app;
