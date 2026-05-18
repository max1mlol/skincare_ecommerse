"use client";

// useState: "зогсоосон" эсвэл "гүйж буй" гэсэн төлөвийг хадгалах hook.
import { useState } from "react";

// Pause: зогсоох дүрс | Play: тоглуулах дүрс (lucide-react сан)
import { Pause, Play } from "lucide-react";

// БРЭНДИЙН ЛОГО ЖАГСААЛТ
// SVG (Scalable Vector Graphics) — ямар ч хэмжээнд буурч, тассарч харагдахгүй вектор зураг.
// fill="currentColor" → CSS-ийн одоогийн текстийн өнгийг ашиглана (цайвар/харанхуй горим дэмжинэ).
const BRAND_LOGOS = [
  {
    name: "COSRX",
    svg: (
      <svg viewBox="0 0 115 34" xmlns="http://www.w3.org/2000/svg" className="h-7 md:h-9 w-auto">
        <text x="2" y="28" fontSize="26" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" letterSpacing="-0.02em" fill="currentColor">COSRX</text>
      </svg>
    ),
  },
  {
    name: "THE ORDINARY",
    svg: (
      <svg viewBox="0 0 178 34" xmlns="http://www.w3.org/2000/svg" className="h-7 md:h-9 w-auto">
        <text x="0" y="26" fontSize="24" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="400" fill="currentColor">The Ordinary.</text>
      </svg>
    ),
  },
  {
    name: "CERAVE",
    svg: (
      <svg viewBox="0 0 132 36" xmlns="http://www.w3.org/2000/svg" className="h-7 md:h-9 w-auto">
        <text x="0" y="30" fontSize="30" fontFamily="Arial, sans-serif" letterSpacing="-0.03em">
          <tspan fontWeight="300" fill="#4A9CC9">Cera</tspan>
          <tspan fontWeight="900" fill="#4A9CC9">Ve</tspan>
        </text>
      </svg>
    ),
  },
  {
    name: "LA ROCHE-POSAY",
    svg: (
      <svg viewBox="0 0 192 40" xmlns="http://www.w3.org/2000/svg" className="h-8 md:h-10 w-auto">
        <rect width="192" height="26" fill="#0082C9" />
        <text x="96" y="17" dominantBaseline="middle" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontFamily="Arial, sans-serif" letterSpacing="0.12em" fontWeight="700">LA ROCHE-POSAY</text>
        <text x="96" y="34" dominantBaseline="middle" textAnchor="middle" fill="currentColor" fontSize="7.5" fontFamily="Arial, sans-serif" letterSpacing="0.08em" fontWeight="400" opacity="0.6">LABORATOIRE DERMATOLOGIQUE</text>
      </svg>
    ),
  },
  {
    name: "LANEIGE",
    svg: (
      <svg viewBox="0 0 130 34" xmlns="http://www.w3.org/2000/svg" className="h-7 md:h-9 w-auto">
        <text x="0" y="26" fontSize="22" fontFamily="Arial, sans-serif" fontWeight="300" fill="#1E7CBB" letterSpacing="0.12em">LANEIGE</text>
      </svg>
    ),
  },
  {
    name: "DRUNK ELEPHANT",
    svg: (
      <svg viewBox="0 0 262 36" xmlns="http://www.w3.org/2000/svg" className="h-7 md:h-9 w-auto">
        <ellipse cx="11" cy="22" rx="8" ry="7" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="21" cy="14" r="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M17 10 C13 6 9 9 11 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 16 C30 21 30 28 25 30 C23 31 22 29 23 28 L25 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="22" cy="13" r="1" fill="currentColor" />
        <path d="M5 28 v6 M8 28 v6 M13 28 v6 M16 28 v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M4 18 C1 17 1 20 3 21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <text x="40" y="27" fontSize="20" fontFamily="Arial, sans-serif" fontWeight="800" fill="currentColor" letterSpacing="0.08em">DRUNK ELEPHANT</text>
      </svg>
    ),
  },
];

// ── MarqueeTicker компонент ───────────────────────────────────────────────────
// Параметр байхгүй — ямар нэгэн гаднаас утга шаардахгүй.
export default function MarqueeTicker() {
  // isPaused: гүйдэл зогссон эсвэл үргэлжилж байна гэсэн boolean төлөв.
  // false = гүйж байна | true = зогссон
  const [isPaused, setIsPaused] = useState(false);

  // Тасралтгүй гүйж байгаа мэт харагдуулахын тулд логонуудыг 4 дахин давтана.
  // Spread operator [...arr]: массивыг тараан нэгтгэнэ.
  // [...A, ...A, ...A, ...A] → A массивын агуулгыг 4 удаа давтсан шинэ массив.
  const repeated = [...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    // overflow-hidden: логонуудын гаднах хэсэг дэлгэцнээс гарахгүй байна.
    // group: hover дээр дотор байгаа элементүүдийн CSS өөрчлөгдөнө.
    <div className="relative bg-muted/30 dark:bg-muted/10 text-foreground py-10 overflow-hidden border-t border-b border-border group" aria-label="Брэндүүд">

      {/* ── ГҮЙДЭГ ХЭСЭГ ── */}
      {/* animate-marquee: globals.css-д тодорхойлсон CSS animation */}
      {/* animationPlayState: isPaused бол "paused" (зогсоно), эсвэл "running" (гүйнэ) */}
      <div
        className="flex animate-marquee whitespace-nowrap items-center"
        style={{
          animationDuration: "20s",  // 20 секундэд нэг бүрэн гүйлт хийнэ
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {/* repeated массивын элемент бүрийн лого харуулна */}
        {repeated.map((brand, i) => (
          <span
            key={i}
            // grayscale: бүдэг саарал өнгөтэй | hover:grayscale-0: hover дээр жинхэнэ өнгө гарна
            // opacity-50: хагас ил тод | hover:opacity-100: hover дээр бүрэн ил тод болно
            className="flex items-center mx-12 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition duration-500 cursor-default"
            title={brand.name}  // Хулгана дээр гарахад брэндийн нэрийг tooltip байдлаар харуулна
          >
            {brand.svg}
          </span>
        ))}
      </div>

      {/* ── ЗОГСООХ / ТОГЛУУЛАХ ТОВЧ ── */}
      {/* md:opacity-0 md:group-hover:opacity-100: том дэлгэцэнд hover дээр л харагдана */}
      <button
        onClick={() => setIsPaused(!isPaused)}  // !isPaused → одоогийн утгыг эсрэгээр нь болгоно
        className="absolute top-1/2 right-4 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 dark:bg-muted/80 shadow-md border border-border text-foreground hover:bg-background hover:scale-110 transition-all md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 outline-none"
        aria-label={isPaused ? "Үргэлжлүүлэх" : "Зогсоох"}
        title={isPaused ? "Тоглуулах" : "Зогсоох"}
      >
        {/* Зогссон бол Play icon, гүйж байвал Pause icon харуулна */}
        {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
      </button>
    </div>
  );
}
