// Энэ файлын үүрэг:
//   Tailwind CSS-ийн классуудыг аюулгүй, алдаагүй нэгтгэх cn() функц.
//   getImageUrl() — зургийн харьцангуй замыг бүрэн URL болгон хөрвүүлэх utility.

import { clsx }    from "clsx";
import { twMerge } from "tailwind-merge";

// cn: clsx + twMerge-ийн хослол — Tailwind зөрчилдөж буй классуудыг ухаалгаар нэгтгэнэ.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// API_BASE: Express серверийн үндсэн хаяг.
// NEXT_PUBLIC_API_URL env хувьсагчаар тохируулна (production дээр өөрчлөгдөнө).
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Fallback зураг — бараа эсвэл хэрэглэгчийн зураг байхгүй үед ашиглагдах default зураг.
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800";

/**
 * getImageUrl — зургийн замыг бүрэн URL болгоно.
 * /uploads/... → http://api.example.com/uploads/...
 * Гадны URL (https://...) → өөрчлөлтгүй шууд буцаана.
 */
export function getImageUrl(src) {
  if (!src) return FALLBACK_IMAGE;
  if (src.startsWith("/uploads")) return `${API_BASE}${src}`;
  return src;
}
