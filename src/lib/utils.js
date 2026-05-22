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
export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800";

/**
 * getImageUrl — зургийн замыг зөв URL болгоно.
 * /uploads/... → /uploads/... (харьцангуй зам — Next.js rewrite→Express)
 * Гадны URL (https://...) → өөрчлөлтгүй шууд буцаана.
 *
 * Тайлбар: http://localhost:4000/... гэсэн бүрэн хаягийг next/image-д өгвөл
 * "private IP" гэсэн алдаа гардаг. Харьцангуй /uploads/... замыг өгвөл
 * Next.js rewrite (next.config.mjs) localhost:4000 руу автоматаар дамжуулна.
 */
export function getImageUrl(src) {
  if (!src || typeof src !== "string") return FALLBACK_IMAGE;
  const value = src.trim();
  if (!value) return FALLBACK_IMAGE;

  if (value.startsWith("data:") || value.startsWith("blob:")) return value;

  // Харьцангуй зам буцааж, Next.js rewrite ашиглана → private IP алдаа гарахгүй
  if (value.startsWith("/uploads")) return value;
  if (value.startsWith("uploads/")) return `/${value}`;
  if (value.startsWith("/")) return value;

  // http://localhost:4000/uploads/... хэлбэрийн хаягийг харьцангуй болгоно
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(value)) {
    try {
      const url = new URL(value);
      return url.pathname;
    } catch {
      return FALLBACK_IMAGE;
    }
  }

  if (/^https?:\/\//i.test(value)) return value;
  return FALLBACK_IMAGE;
}
