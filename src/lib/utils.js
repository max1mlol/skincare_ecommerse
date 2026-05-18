// Энэ файлын үүрэг:
//   Tailwind CSS-ийн классуудыг аюулгүй, алдаагүй нэгтгэх cn() функц.
//
//   Яагаад хэрэгтэй вэ?
//   Tailwind-д зарим класс хоорондоо зөрчилддөг.
//   Жишээ: "px-2 px-4" → хоёул байвал аль нь хэрэгжих нь тодорхойгүй болно.
//   cn() нь сүүлийн давтагдсан классыг л үлдээж зөрчилдөөнийг шийднэ.

// clsx: JavaScript нөхцлийн логикоор (true/false) классуудыг нэгтгэнэ.
// Жишээ: clsx("px-2", isActive && "bg-blue-500") → "px-2 bg-blue-500"
import { clsx } from "clsx";

// twMerge: Tailwind-ийн зөрчилдөж буй классуудыг ухаалгаар нэгтгэнэ.
// Жишээ: twMerge("px-2 px-4") → "px-4" (сүүлийнх нь давамгайлна)
import { twMerge } from "tailwind-merge";

// cn: clsx болон twMerge-ийг хослуулсан utility функц.
// ...inputs: хэд ч хамаагүй олон аргумент хүлээн авна (rest параметр).
// Дуудах жишээ: cn("rounded", isActive && "bg-foreground", className)
export function cn(...inputs) {
  // 1. clsx(inputs) → нөхцлийн логикийг боловсруулж нэг мөр класс болгоно
  // 2. twMerge(...)  → зөрчилдөж буй Tailwind классуудыг нэгтгэнэ
  return twMerge(clsx(inputs));
}

// Зургийн замыг бүрэн URL болгох функц
// Next.js-ийн next/image нь /uploads/ гэх мэт relative path-ийг public фолдероос хайдаг тул
// Express сервер рүүгээ хандсан full URL болгож өөрчилнө.
export function getImageUrl(src) {
  if (!src) return "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800"; // fallback
  if (src.startsWith('/uploads')) {
    return `http://localhost:4000${src}`;
  }
  return src;
}
