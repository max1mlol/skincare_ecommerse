# ☁️ AURA SKIN — Cloud Database Setup (Neon PostgreSQL)

## Яагаад Neon?
- **Үнэгүй** (0.5 GB storage, 190 compute hours/сар)  
- **Serverless PostgreSQL** — стандарт `pg` npm package-тэй бүрэн нийцтэй
- **Автомат backup** — production-д бэлэн
- **SSL шифрлэлт** — өгөгдлийн аюулгүй байдал хамгаалагдсан

---

## 1. Neon бүртгэл үүсгэх

1. **https://neon.tech** → **Sign Up** (GitHub-ээр нэвтрэх боломжтой)
2. **New Project** → Project name: `auraskin`
3. Region: **Asia Pacific (Singapore)** — Монголд ойр
4. **Create Project** товчийг дарна

---

## 2. Connection String авах

Dashboard-д:
```
Settings → Connection Details → Connection string
```

Жишээ:
```
postgresql://auraskin_owner:abc123@ep-cool-fog-123456.ap-southeast-1.aws.neon.tech/auraskin?sslmode=require
```

---

## 3. .env файл шинэчлэх

`server/.env` файлд **DATABASE_URL**-ийг орлуулна:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://auraskin_owner:YOURPASSWORD@ep-XXXX.ap-southeast-1.aws.neon.tech/auraskin?sslmode=require
SESSION_SECRET=your-secret-here
CORS_ORIGIN=http://localhost:3000
```

---

## 4. Schema болон Seed хийх

```bash
# Neon DB-д schema үүсгэх
/opt/homebrew/bin/psql "YOUR_CONNECTION_STRING" -f server/migrations/001_schema.sql

# Бараа оруулах
cd server && npm run seed
```

Эсвэл **Neon SQL Editor** (Dashboard → SQL Editor)-т шууд SQL-ийг paste хийж ажиллуулж болно.

---

## 5. Deployment (Vercel + Neon)

### Frontend (Next.js) → Vercel
```bash
# Vercel CLI суулгах
npm i -g vercel

# Deploy
cd /Users/iluminimal/Documents/skincare_ecommerse
vercel
```

Environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` = Express-ийн URL

### Backend (Express) → Railway эсвэл Render
1. **https://railway.app** → New Project → Deploy from GitHub
2. Root directory: `server/`
3. Environment variables-ийг Neon connection string-тэй нэмнэ

---

## 📌 Локал + Cloud хосолсон ажиллагаа

Одоогоор **локал Homebrew PostgreSQL** ашиглаж байна:
```
postgresql://iluminimal@localhost:5432/auraskin_db
```

Neon руу шилжихэд зөвхөн `server/.env`-ийн `DATABASE_URL`-ийг орлуулахад хангалттай.
Код өөрчлөх шаардлагагүй — `pg` npm package Neon-тэй бүрэн нийцтэй.
