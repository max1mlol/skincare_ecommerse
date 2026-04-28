"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Send, CheckCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PRODUCTS } from "@/lib/products";

// Анхны байдлаар харуулах demo сэтгэгдлүүд.
const INITIAL_REVIEWS = [
  {
    id: 1,
    name: "Болормаа Д.",
    product: "Essence Noire Serum",
    rating: 5,
    date: "2025-03-15",
    text: "Маш сайн бүтээгдэхүүн! 2 долоо хоногийн дараа арьсны байдал мэдэгдэхүйц сайжирсан.",
  },
  {
    id: 2,
    name: "Наранцэцэг Б.",
    product: "Daily Hydration Cream",
    rating: 5,
    date: "2025-02-28",
    text: "Бүтээгдэхүүний чанар гайхалтай. Найзуудтайгаа хуваалцлаа. Хурдан хүргэлт, сайхан баглаа боодол.",
  },
  {
    id: 3,
    name: "Оюунчимэг Г.",
    product: "Matte Shield SPF50",
    rating: 4,
    date: "2025-01-10",
    text: "Арьс эмчийн хувьд санал болгохуйц бүтээгдэхүүн. Найрлага нь цэвэр, аюулгүй. Арьс өтгөн болдоггүй.",
  },
  {
    id: 4,
    name: "Мөнхзул Э.",
    product: "Lumina The Toner",
    rating: 5,
    date: "2025-01-05",
    text: "Тоник нь маш зөөлөн мэт мэдрэмжтэй. Нүүрний толбо арай бага болсон шиг санагдаж байна.",
  },
  {
    id: 5,
    name: "Нарантуул С.",
    product: "Aqua Boost Essence",
    rating: 5,
    date: "2024-12-10",
    text: "Арьс маш их гэрэлтсэн! Бүтэн улиралд хамгийн сайн худалдан авалт байлаа.",
  },
  {
    id: 6,
    name: "Ундарма Б.",
    product: "Kaolin Detox Mask",
    rating: 3,
    date: "2024-12-20",
    text: "Дутагдалтай зүйл байхгүй боловч хүсэн хүлээсэн хурдтай үр дүн гарсангүй. 3 долоо хоногоор хэрэглэлээ.",
  },
];

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Үнэлгээ сонгох">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} од`}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={`transition-colors ${
              n <= (hover || value)
                ? "fill-foreground text-foreground"
                : "fill-muted text-muted"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// Хэрэглэгчийн үнэлгээ, сэтгэгдлийг жагсааж бас шинээр нэмэх хуудас.
export default function ReviewsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [filterProd, setFilter] = useState("all");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    product: "",
    rating: 0,
    text: "",
  });

  const avg = (
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  ).toFixed(1);

  const visible =
    filterProd === "all"
      ? reviews
      : reviews.filter((r) => r.product === filterProd);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.rating) return;
    setReviews((prev) => [
      {
        id: Date.now(),
        name: form.name,
        product: form.product,
        rating: form.rating,
        date: new Date().toISOString().slice(0, 10),
        text: form.text,
      },
      ...prev,
    ]);
    setForm({ name: "", product: "", rating: 0, text: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Нүүр
            </Link>
            <span>/</span>
            <span className="text-foreground">Сэтгэгдэл</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* ── Left: Reviews list ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary bar */}
              <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-2xl">
                <div className="text-center">
                  <p className="text-5xl font-bold text-foreground">{avg}</p>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.round(Number(avg))
                            ? "fill-foreground text-foreground"
                            : "fill-muted text-muted"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reviews.length} сэтгэгдэл
                  </p>
                </div>
                <Separator orientation="vertical" className="h-16" />
                {/* Rating distribution */}
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const cnt = reviews.filter((r) => r.rating === star).length;
                    const pct = reviews.length
                      ? Math.round((cnt / reviews.length) * 100)
                      : 0;
                    return (
                      <div
                        key={star}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span className="w-2">{star}</span>
                        <Star
                          size={10}
                          className="fill-muted-foreground text-muted-foreground"
                        />
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-foreground rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-right">{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filter by product */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={13} className="text-muted-foreground" />
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${filterProd === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  Бүгд
                </button>
                {PRODUCTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setFilter(p.name)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${filterProd === p.name ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                  >
                    {p.nameMn}
                  </button>
                ))}
              </div>

              {/* Reviews */}
              {submitted && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                  <CheckCircle size={16} />
                  Таны сэтгэгдлийг хүлээн авлаа. Шалгасны дараа нийтлэгдэнэ.
                </div>
              )}
              <div className="space-y-4">
                {visible.map((r) => (
                  <div
                    key={r.id}
                    className="bg-card border border-border rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shrink-0">
                          {r.name.slice(0, 1)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {r.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.product} · {r.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={
                              i < r.rating
                                ? "fill-foreground text-foreground"
                                : "fill-muted text-muted"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {r.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Write a review form ── */}
            <div className="lg:col-span-1">
              <div className="bg-muted/30 rounded-2xl p-6 sticky top-20">
                <h2 className="text-base font-semibold text-foreground mb-1">
                  Сэтгэгдэл бичих
                </h2>
                <p className="text-xs text-muted-foreground mb-5">
                  Таны туршлага бусдад тусална
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="review-name">Нэр *</Label>
                    <Input
                      id="review-name"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Болормаа Д."
                      className="rounded-xl h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review-product">Бүтээгдэхүүн *</Label>
                    <select
                      id="review-product"
                      required
                      value={form.product}
                      onChange={(e) =>
                        setForm({ ...form, product: e.target.value })
                      }
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-9"
                    >
                      <option value="">Сонгох...</option>
                      {PRODUCTS.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.nameMn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Үнэлгээ *</Label>
                    <StarPicker
                      value={form.rating}
                      onChange={(v) => setForm({ ...form, rating: v })}
                    />
                    {form.rating === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Одоор үнэлнэ үү
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review-text">Сэтгэгдэл *</Label>
                    <textarea
                      id="review-text"
                      required
                      rows={4}
                      value={form.text}
                      onChange={(e) =>
                        setForm({ ...form, text: e.target.value })
                      }
                      placeholder="Бүтээгдэхүүний тухай туршлагаа хуваалцна уу..."
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full text-sm gap-2 h-9"
                    disabled={!form.rating}
                  >
                    <Send size={13} />
                    Илгээх
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
