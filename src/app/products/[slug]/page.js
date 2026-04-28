"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import {
  Minus,
  Plus,
  ShoppingBag,
  Check,
  ArrowLeft,
  Star,
  Truck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/context/CartContext";

// Product detail дээр үргэлж харуулах үйлчилгээний баталгаанууд.
const GUARANTEES = [
  { icon: Truck, label: "Үнэгүй хүргэлт", sub: "50,000₮-аас дээш захиалгад" },
  {
    icon: RefreshCw,
    label: "30 хоногийн буцаалт",
    sub: "Үр дүнгүй бол бүрэн буцаана",
  },
  {
    icon: ShieldCheck,
    label: "Аюулгүй бүтээгдэхүүн",
    sub: "Арьсны эмчээр тестлэгдсэн",
  },
];

// Нэг барааны дэлгэрэнгүй мэдээлэл, тоо ширхэг, add-to-cart үйлдлийг удирдана.
export default function ProductDetailPage({ params }) {
  // params is a Promise in Next.js App Router (next 15+)
  const { slug } = use(params);
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) notFound();

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.nameMn,
        price: product.price,
        image: product.image,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  // Related products (same category, excluding self)
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 3);

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
            <Link
              href="/products"
              className="hover:text-foreground transition-colors"
            >
              Бүтээгдэхүүн
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">
              {product.nameMn}
            </span>
          </div>
        </div>

        {/* Product section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
            {/* ── Image ── */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted/30 rounded-2xl overflow-hidden">
                <Image
                  src={product.image}
                  alt={`${product.nameMn} — ${product.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                {product.badge && (
                  <Badge className="absolute top-4 left-4 rounded-full text-xs">
                    {product.badge}
                  </Badge>
                )}
              </div>
              {/* Thumbnail row — same image repeated as placeholder */}
              <div className="flex gap-3">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-foreground/10 hover:border-foreground/40 transition-colors"
                  >
                    <Image
                      src={product.image}
                      alt={`Зураг ${n}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ── Info ── */}
            <div className="flex flex-col">
              {/* Category + Name */}
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                {product.categoryMn}
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-foreground leading-tight mb-1">
                {product.nameMn}
              </h1>
              <p className="text-sm text-muted-foreground mb-5">
                {product.name}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex gap-0.5"
                  aria-label={`${product.rating} одтой`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.round(product.rating)
                          ? "fill-foreground text-foreground"
                          : "fill-muted text-muted"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} сэтгэгдэл)
                </span>
                <Link
                  href="#reviews"
                  className="text-sm text-foreground underline underline-offset-2"
                >
                  Сэтгэгдэл унших
                </Link>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-foreground">
                  {product.price.toLocaleString("mn-MN")}₮
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString("mn-MN")}₮
                  </span>
                )}
                {product.originalPrice && (
                  <Badge variant="destructive" className="text-xs rounded-full">
                    {Math.round(
                      (1 - product.price / product.originalPrice) * 100,
                    )}
                    % хямдрал
                  </Badge>
                )}
              </div>

              <Separator className="mb-6" />

              {/* Short description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Qty + Add to cart */}
              {product.inStock ? (
                <div className="flex items-center gap-4 mb-6">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-border rounded-full overflow-hidden">
                    <button
                      id="qty-decrease"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Тоо бууруулах"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-medium select-none">
                      {qty}
                    </span>
                    <button
                      id="qty-increase"
                      onClick={() => setQty((q) => q + 1)}
                      className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Тоо нэмэх"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to cart */}
                  <Button
                    id="add-to-cart-btn"
                    size="lg"
                    onClick={handleAddToCart}
                    className="flex-1 rounded-full h-11 gap-2 font-medium text-sm transition-all"
                    disabled={added}
                  >
                    {added ? (
                      <>
                        <Check size={16} />
                        Нэмэгдлээ!
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        Сагсанд нэмэх
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  disabled
                  size="lg"
                  className="rounded-full h-11 mb-6 w-full"
                >
                  Дууссан
                </Button>
              )}

              {/* Direct checkout */}
              {product.inStock && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full h-11 mb-8"
                >
                  <Link href="/checkout">Шууд захиалах</Link>
                </Button>
              )}

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {GUARANTEES.map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center gap-1.5 p-4 bg-muted/30 rounded-xl"
                  >
                    <Icon size={18} className="text-muted-foreground mb-1" />
                    <p className="text-xs font-medium text-foreground">
                      {label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabs: Description / Ingredients / Reviews ── */}
        <section id="reviews" className="border-t border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Tabs defaultValue="description">
              <TabsList className="mb-8 rounded-full">
                <TabsTrigger
                  value="description"
                  className="rounded-full text-sm"
                >
                  Тайлбар
                </TabsTrigger>
                <TabsTrigger
                  value="ingredients"
                  className="rounded-full text-sm"
                >
                  Найрлага
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-full text-sm">
                  Сэтгэгдэл ({product.reviews})
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="description"
                className="text-sm text-muted-foreground leading-relaxed space-y-4 max-w-2xl"
              >
                <p>{product.description}</p>
                <p>
                  Бүтээгдэхүүнийг ашиглах арга: Арьсаа цэвэрлэсний дараа тохирох
                  хэмжээгээр авч нүүрний дунд хэсгээс гадагш тийш дугуй
                  хөдөлгөөнөөр тарааж нэвтрүүлнэ. Хамгийн сайн үр дүнд хүрэхийн
                  тулд өдөр бүр ашиглахыг зөвлөж байна.
                </p>
              </TabsContent>

              <TabsContent value="ingredients" className="max-w-2xl">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Гол найрлага:</strong>{" "}
                  Hyaluronic Acid, Niacinamide, Centella Asiatica Extract, Aloe
                  Vera Leaf Juice, Glycerin, Vitamin E, Panthenol, Green Tea
                  Extract.
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  * Бүтэн найрлагыг савны шошгоноос үзнэ үү.
                </p>
              </TabsContent>

              <TabsContent value="reviews" className="max-w-3xl">
                {/* Static sample reviews */}
                <div className="space-y-6">
                  {[
                    {
                      name: "Болормаа Д.",
                      rating: 5,
                      date: "2025-03-15",
                      text: "Маш сайн бүтээгдэхүүн! 2 долоо хоногийн дараа арьсны байдал мэдэгдэхүйц сайжирсан.",
                    },
                    {
                      name: "Наранцэцэг Б.",
                      rating: 5,
                      date: "2025-02-28",
                      text: "Бүтээгдэхүүний чанар гайхалтай. Найзуудтайгаа хуваалцлаа.",
                    },
                    {
                      name: "Оюунчимэг Г.",
                      rating: 4,
                      date: "2025-01-10",
                      text: "Арьс эмчийн хувьд санал болгохуйц бүтээгдэхүүн. Найрлага нь цэвэр, аюулгүй.",
                    },
                  ].map((r) => (
                    <div
                      key={r.name}
                      className="border-b border-border/40 pb-6 last:border-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {r.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.date}
                          </p>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i < r.rating
                                  ? "fill-foreground text-foreground"
                                  : "fill-muted text-muted"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.text}</p>
                    </div>
                  ))}
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full text-sm"
                  >
                    <Link href="/reviews">Бүх сэтгэгдэл харах</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <section className="border-t border-border/40 bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h2 className="text-2xl font-semibold text-foreground mb-8">
                Төстэй бүтээгдэхүүн
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-square bg-muted/30 rounded-xl overflow-hidden mb-3">
                      <Image
                        src={p.image}
                        alt={p.nameMn}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                      {p.categoryMn}
                    </p>
                    <p className="text-sm font-medium text-foreground group-hover:underline underline-offset-2">
                      {p.nameMn}
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {p.price.toLocaleString("mn-MN")}₮
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
