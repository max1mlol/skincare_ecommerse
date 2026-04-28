"use client";
import { useState } from "react";
import { Pause, Play } from "lucide-react";

// Брэндийн логонуудыг кодон дотор SVG байдлаар хадгалж, тасралтгүй гүйлгэнэ.
const BRAND_LOGOS = [
  {
    name: "COSRX",
    svg: (
      <svg viewBox="0 0 115 34" xmlns="http://www.w3.org/2000/svg" className="h-7 md:h-9 w-auto">
        <text x="2" y="28" fontSize="26" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" letterSpacing="-0.02em" fill="#000000">COSRX</text>
      </svg>
    ),
  },
  {
    name: "THE ORDINARY",
    svg: (
      <svg viewBox="0 0 178 34" xmlns="http://www.w3.org/2000/svg" className="h-7 md:h-9 w-auto">
        <text x="0" y="26" fontSize="24" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="400" fill="#000000">The Ordinary.</text>
      </svg>
    ),
  },
  {
    name: "CERAVE",
    svg: (
      <svg viewBox="0 0 132 36" xmlns="http://www.w3.org/2000/svg" className="h-7 md:h-9 w-auto">
        <text x="0" y="30" fontSize="30" fontFamily="Arial, sans-serif" letterSpacing="-0.03em">
          <tspan fontWeight="300" fill="#005B99">Cera</tspan>
          <tspan fontWeight="900" fill="#005B99">Ve</tspan>
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
        <text x="96" y="34" dominantBaseline="middle" textAnchor="middle" fill="#333333" fontSize="7.5" fontFamily="Arial, sans-serif" letterSpacing="0.08em" fontWeight="400">LABORATOIRE DERMATOLOGIQUE</text>
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
        <ellipse cx="11" cy="22" rx="8" ry="7" fill="none" stroke="#000000" strokeWidth="2.2" />
        <circle cx="21" cy="14" r="6" fill="none" stroke="#000000" strokeWidth="2.2" />
        <path d="M17 10 C13 6 9 9 11 14" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 16 C30 21 30 28 25 30 C23 31 22 29 23 28 L25 24" fill="none" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="22" cy="13" r="1" fill="#000000" />
        <path d="M5 28 v6 M8 28 v6 M13 28 v6 M16 28 v6" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M4 18 C1 17 1 20 3 21" fill="none" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
        <text x="40" y="27" fontSize="20" fontFamily="Arial, sans-serif" fontWeight="800" fill="#000000" letterSpacing="0.08em">DRUNK ELEPHANT</text>
      </svg>
    ),
  },
];

// Нүүр хуудсан дээр брэндүүдийг урсаж буй мөр байдлаар харуулах хэсэг.
export default function MarqueeTicker() {
  // Хэрэглэгч хүсвэл автоматаар гүйх хөдөлгөөнийг pause хийж чадна.
  const [isPaused, setIsPaused] = useState(false);
  
  // Хоосон зай гарахгүй байлгахын тулд логонуудыг олон дахин давтаж render хийнэ.
  const repeated = [...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <div className="relative bg-white text-black py-10 overflow-hidden border-t border-b border-black/5 group" aria-label="Брэндүүд">
      {/* Гүйлгэх хөдөлгөөнтэй агуулах */}
      <div
        className="flex animate-marquee whitespace-nowrap items-center"
        style={{
          animationDuration: "20s",
          animationPlayState: isPaused ? "paused" : "running", // isPaused үнэн байвал гүйлгэх зогсоно
        }}
      >
        {/* Лого бүрийг дэлгэцэнд зурах */}
        {repeated.map((brand, i) => (
          <span
            key={i}
            className="flex items-center mx-12 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition duration-500 cursor-default"
            title={brand.name}
          >
            {brand.svg}
          </span>
        ))}
      </div>

      {/* Play/Pause (Тоглуулах/Зогсоох) товчлуур */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute top-1/2 right-4 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 shadow-md border border-black/5 text-black hover:bg-white hover:scale-110 transition-all md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 outline-none"
        aria-label={isPaused ? "Үргэлжлүүлэх" : "Зогсоох"}
        title={isPaused ? "Тоглуулах" : "Зогсоох"}
      >
        {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
      </button>
    </div>
  );
}
