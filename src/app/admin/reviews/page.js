"use client";
// admin/reviews/page.js — бүх сэтгэгдлийг харах, устгах
import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews/all", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function deleteReview(id) {
    if (!confirm("Энэ сэтгэгдлийг устгах уу?")) return;
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl space-y-4">
      <div>
        <h1 className="text-xl font-bold">Сэтгэгдлүүд</h1>
        <p className="text-sm text-muted-foreground">{reviews.length} нийт сэтгэгдэл</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}
          </div>
        ) : reviews.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Сэтгэгдэл байхгүй байна</p>
        ) : (
          <div className="divide-y divide-border/40">
            {reviews.map((r) => (
              <div key={r.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                {/* Хэрэглэгч болон бараа */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{r.user_name}</span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="text-xs text-muted-foreground">{r.product_name_mn ?? r.product_name}</span>
                    {/* Одны үнэлгээ */}
                    <div className="flex gap-0.5 ml-1">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} size={10} className={n <= r.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"} />
                      ))}
                    </div>
                  </div>
                  {r.body && <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{r.body}</p>}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {new Date(r.created_at).toLocaleDateString("mn-MN")}
                  </p>
                </div>
                <button onClick={() => deleteReview(r.id)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  aria-label="Устгах">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
