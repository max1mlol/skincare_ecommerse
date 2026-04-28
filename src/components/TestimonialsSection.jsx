"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

// Demo review-үүдийг carousel маягаар эргүүлж үзүүлнэ.
const TESTIMONIALS = [
  {
    id: 1,
    name: "Болормаа Д.",
    role: "Хэрэглэгч · 2 жил",
    text: "The Ordinary-ийн С Витаминтай сэрумийг хэрэглэж эхэлснээс хойш нүүрний тод толбо бүдгэрч, арьс мэдэгдэхүйц гэрэлтсэн. AURA SKIN-ээс байнга захиалдаг. Хамгийн хурдан хүргэлттэй дэлгүүр!",
    rating: 5,
    product: "The Ordinary С Витамины Сэрум",
    date: "2025-03-12",
  },
  {
    id: 2,
    name: "Наранцэцэг Б.",
    role: "Гоо сайхны блогч",
    text: "Some By Mi 30 хоногийн тоникийг сар хэрэглэсний дараа нүх сүв маш сайн цэвэрлэгдсэн. AURA SKIN-ийн бүтээгдэхүүнүүд 100% оригинал байдаг тул итгэлтэйгээр санал болгож байна.",
    rating: 5,
    product: "Some By Mi 30 Хоногийн Тоник",
    date: "2025-02-20",
  },
  {
    id: 3,
    name: "Оюунчимэг Г.",
    role: "Арьс эмч, МА Клиник",
    text: "La Roche-Posay зэрэг клиникийн нотолгоотой, эмч нарын зөвлөдөг брэндүүдийг Монголд албан ёсоор оруулж ирдэгт маш их баяртай байна. Өвчтөнүүддээ санал болгодог цөөн хэдэн дэлгүүрийн нэг.",
    rating: 5,
    product: "La Roche-Posay Toleriane Крем",
    date: "2025-01-15",
  },
  {
    id: 4,
    name: "Мөнхзул Э.",
    role: "Make-up Artist",
    text: "Anessa SPF50+ нь грим доорхи primer шиг маш сайн ажилладаг. AURA SKIN үргэлж баталгаатай оригинал бүтээгдэхүүн худалдаалдаг учир хуурамч бараанаас айх зүйлгүй болсон. Косметикчдэд заавал зөвлөнө.",
    rating: 5,
    product: "ANESSA Perfect UV SPF50+",
    date: "2025-01-05",
  },
  {
    id: 5,
    name: "Нарантуул С.",
    role: "Хэрэглэгч",
    text: "COSRX Snail Mucin эссенсийг AURA SKIN-ээс захиалж үзээд үнэхээр гайхсан. Хуурай өвлийн улиралд ч арьс хатдаггүй. Бараа нь дандаа шинээрээ, хадгалалтын горим сайн байдаг нь мэдрэгддэг.",
    rating: 5,
    product: "COSRX Snail 96 Mucin Эссенс",
    date: "2024-12-18",
  },
  {
    id: 6,
    name: "Цэцэгмаа О.",
    role: "Хэрэглэгч · 3 жил",
    text: "AURA SKIN-д найдах болсноос 3 жил болж байна. Бүх бүтээгдэхүүн нь чанарын баталгаатай, харагдацтай үр дүнтэй. Монголд ингэж найдвартай үйлчилгээ үзүүлж байгаад баяртай байна.",
    rating: 5,
    product: "Олон брэндийн бүтээгдэхүүн",
    date: "2024-11-30",
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={
            i < count
              ? "fill-foreground text-foreground"
              : "fill-muted text-muted"
          }
        />
      ))}
    </div>
  );
}

// Брэндийн итгэлцлийг нэмэх хэрэглэгчийн сэтгэгдлийн хэсэг.
export default function TestimonialsSection() {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const pages = Math.ceil(TESTIMONIALS.length / perPage);
  const visible = TESTIMONIALS.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-2">
              Сэтгэгдэл
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
              Бидний үйлчлүүлэгчид
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
              aria-label="Өмнөх"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {page + 1}/{pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={page === pages - 1}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
              aria-label="Дараах"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visible.map((t) => (
            <div
              key={t.id}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:shadow-sm transition-shadow"
            >
              <Stars count={t.rating} />
              <p className="text-sm text-foreground leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <div className="text-xs text-muted-foreground italic mb-3">
                  {t.product}
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                  <div className="w-8 h-8 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shrink-0">
                    {t.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
