'use strict';
// index.js — Express серверийн үндсэн файл (API Entry Point).
// Энэхүү файл нь Express серверийг үүсгэж, шаардлагатай хамгаалалтын давхаргууд (middleware),
// сесс удирдлага (session state), болон өгөгдлийн сангийн холболтуудыг нэгтгэн серверийг эхлүүлнэ.
require('dotenv').config();

const express   = require('express');
const session   = require('express-session');
const PgSession = require('connect-pg-simple')(session); // Сессийг санах ой (RAM) дээр биш PostgreSQL DB рүү хадгалах сан
const helmet    = require('helmet'); // HTTP толгой мэдээллүүдийг хамгаалж аюулгүй болгох сан
const cors      = require('cors'); // Өөр домэйноос (Жишээ нь Next.js) хандах эрхийг удирдах сан
const morgan    = require('morgan'); // Ирж буй хүсэлтийн хаяг болон статусыг консол дээр хэвлэх логгер
const path      = require('node:path');
const { pool }  = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter'); // Хүсэлтийн хурд хязгаарлагч middleware

const app  = express();
const PORT = process.env.PORT || 4000;
const PROD = process.env.NODE_ENV === 'production';
const TEST = process.env.NODE_ENV === 'test';

// 1. Аюулгүй байдлын HTTP header-үүдийг тохируулж, гадны халдлагаас хамгаална
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// 2. Next.js аппликэйшнээс хүсэлт авах CORS тохиргоо (credentials: true нь cookie дамжуулах боломжийг олгоно)
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// 3. Хөгжүүлэлтийн явцад хүсэлтүүдийн логийг консол дээр харуулна (тестийн үед ачаалахгүй)
if (!TEST) app.use(morgan('dev'));

// 4. Оролтын өгөгдлийг (JSON болон URL-encoded) задлан унших middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 5. Сервер дээр хуулагдсан бүтээгдэхүүн болон хэрэглэгчийн зургуудыг статик файл хэлбэрээр илгээх
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 6. Сесс хадгалах сан (Session Store) тохируулах. Тестийн горимоос бусад үед PostgreSQL дээрх `session` хүснэгтэд хадгална
const sessionStore = TEST ? undefined : new PgSession({
  pool,
  tableName:            'session',
  createTableIfMissing: true, // Хэрэв session хүснэгт байхгүй бол автоматаар үүсгэнэ
});

// 7. Сессийн тохиргоо болон Күүки (Cookie) хамгаалалт
app.use(session({
  ...(sessionStore ? { store: sessionStore } : {}),
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  name:              'auraskin.sid', // Күүкиний нэр
  cookie: {
    httpOnly: true,                    // Клиент талын Javascript-ээр күүки рүү хандахыг хаана (XSS-ээс сэргийлнэ)
    secure:   PROD,                    // Production горимд зөвхөн HTTPS-ээр күүки илгээнэ
    sameSite: 'lax',                   // CSRF халдлагаас сэргийлэх тохиргоо
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 хоногийн турш хүчинтэй байна
  },
}));

// 8. Бүх /api/* хаягууд дээр хүсэлтийн тооны хязгаарлалт (DDoS, brute-force-оос сэргийлэх) тавина
app.use('/api', apiLimiter);

// 9. API Чиглүүлэгч замууд (Routes)
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/cart', require('./routes/cart'));

// 10. Серверийн эрүүл байдлыг шалгах хаяг
app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// 11. Олдоогүй чиглэлүүдийг 404-өөр буцаана
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// 12. Глобал алдааны зохицуулагч (Global Error Handler)
// Систем доторх аль нэг route дээр алдаа гарч `next(err)` гэж дуудвал энд орж ирнэ.
app.use((err, _req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Серверийг заасан порт дээр ажиллуулж эхлэх хэсэг
if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀  API  →  http://localhost:${PORT}`));
}

module.exports = app;
