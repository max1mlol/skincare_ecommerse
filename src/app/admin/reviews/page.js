"use client";

import { useState } from "react";
import {
  Star,
  Check,
  Trash2,
  MoreHorizontal,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Review moderation-д харагдах demo өгөгдөл.
const INITIAL_REVIEWS = [
  {
    id: 1,
    name: "Болормаа Д.",
    product: "Essence Noire Serum",
    rating: 5,
    date: "2025-03-15",
    text: "Маш сайн бүтээгдэхүүн! 2 долоо хоногийн дараа арьсны байдал мэдэгдэхүйц сайжирсан.",
    status: "approved",
  },
  {
    id: 2,
    name: "Наранцэцэг Б.",
    product: "Daily Hydration Cream",
    rating: 5,
    date: "2025-02-28",
    text: "Бүтээгдэхүүний чанар гайхалтай. Найзуудтайгаа хуваалцлаа.",
    status: "approved",
  },
  {
    id: 3,
    name: "Оюунчимэг Г.",
    product: "Matte Shield SPF50",
    rating: 4,
    date: "2025-01-10",
    text: "Арьс эмчийн хувьд санал болгохуйц бүтээгдэхүүн. Найрлага нь цэвэр, аюулгүй.",
    status: "pending",
  },
  {
    id: 4,
    name: "Мөнхзул Э.",
    product: "Lumina The Toner",
    rating: 5,
    date: "2025-01-05",
    text: "Тоник нь маш зөөлөн мэт мэдрэмжтэй, толбо орхихгүй. Сайхан үнэр дуусаагүй байна.",
    status: "pending",
  },
  {
    id: 5,
    name: "Ундарма Б.",
    product: "Kaolin Detox Mask",
    rating: 3,
    date: "2024-12-20",
    text: "Дутагдалтай зүйл байхгүй боловч хүсэн хүлээсэн хурдтай үр дүн гарсангүй.",
    status: "rejected",
  },
  {
    id: 6,
    name: "Нарантуул С.",
    product: "Aqua Boost Essence",
    rating: 5,
    date: "2024-12-10",
    text: "Арьс маш их гэрэлтсэн! Бүтэн улиралд хамгийн сайн худалдан авалт.",
    status: "approved",
  },
];

const STATUS_MAP = {
  approved: { label: "Зөвшөөрсөн", cls: "bg-green-100 text-green-700" },
  pending: { label: "Хүлээгдэж байна", cls: "bg-yellow-100 text-yellow-700" },
  rejected: { label: "Татгалзсан", cls: "bg-red-100 text-red-600" },
};

function StarRow({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
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

// Сэтгэгдлийг approve, hide, устгах зэрэг moderation үйлдэлтэй admin хуудас.
export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [filter, setFilter] = useState("all");

  const visible =
    filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  function approve(id) {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
    );
  }
  function reject(id) {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)),
    );
  }
  function remove(id) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Сэтгэгдэл</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {reviews.length} нийт
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-700">
                {pendingCount} хүлээгдэж байна
              </span>
            )}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {[
            ["all", "Бүгд"],
            ["pending", "Хүлээгдэж байна"],
            ["approved", "Зөвшөөрсөн"],
            ["rejected", "Татгалзсан"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filter === val
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <MessageSquare
            size={28}
            className="text-muted-foreground mb-3 opacity-40"
          />
          <p className="text-sm text-muted-foreground">
            Сэтгэгдэл байхгүй байна
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((review) => {
            const st = STATUS_MAP[review.status];
            return (
              <div
                key={review.id}
                className="bg-card border border-border rounded-xl p-5 flex gap-4"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-foreground text-background text-xs font-semibold flex items-center justify-center shrink-0">
                  {review.name.slice(0, 1)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {review.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.product} · {review.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StarRow count={review.rating} />
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.text}
                  </p>

                  {/* Actions */}
                  {review.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => approve(review.id)}
                        className="h-7 px-3 text-xs rounded-full gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check size={12} /> Зөвшөөрөх
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reject(review.id)}
                        className="h-7 px-3 text-xs rounded-full gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Татгалзах
                      </Button>
                    </div>
                  )}
                </div>

                {/* Menu */}
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg shrink-0"
                      >
                        <MoreHorizontal size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 rounded-xl"
                    >
                      {review.status !== "approved" && (
                        <DropdownMenuItem
                          onClick={() => approve(review.id)}
                          className="gap-2 cursor-pointer"
                        >
                          <Check size={13} className="text-green-600" />{" "}
                          Зөвшөөрөх
                        </DropdownMenuItem>
                      )}
                      {review.status !== "rejected" && (
                        <DropdownMenuItem
                          onClick={() => reject(review.id)}
                          className="gap-2 text-red-600 cursor-pointer"
                        >
                          Татгалзах
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive gap-2 cursor-pointer">
                          <Trash2 size={13} /> Устгах
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Сэтгэгдэл устгах уу?</AlertDialogTitle>
                      <AlertDialogDescription>
                        <strong>{review.name}</strong>-ийн сэтгэгдлийг устгах
                        гэж байна. Буцаах боломжгүй.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">
                        Болих
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => remove(review.id)}
                        className="rounded-full bg-destructive text-white hover:bg-destructive/90"
                      >
                        Устгах
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
