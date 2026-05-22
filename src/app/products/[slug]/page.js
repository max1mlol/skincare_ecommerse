// ── products/[slug]/page.js ──────────────────────────────────────────────────
// Энэ файлын үүрэг:
//   Бүтээгдэхүүний дэлгэрэнгүй мэдээллийн хуудас.
//
//   Тусгай боломжууд:
//     - Зургийн галерей (Main image + Thumbnails)
//     - Тоо ширхэг сонгож сагсанд нэмэх
//     - Төстэй бүтээгдэхүүн санал болгох
//     - Tabs (Тайлбар, Найрлага, Сэтгэгдэл)
// ─────────────────────────────────────────────────────────────────────────────

"use client";

// useState, useEffect: төлөв удирдах, өгөгдөл татах
import { useState, useEffect, use } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useSession } from "@/context/SessionContext";

// lucide-react icon-ууд
import {
  Minus, Plus, ShoppingBag, Check, ArrowLeft, Star, Truck, RefreshCw, ShieldCheck,
} from "lucide-react";

// UI & Layout
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Сагсны Context
import { useCart } from "@/context/CartContext";


// ── ProductDetailPage үндсэн компонент ───────────────────────────────────────
export default function ProductDetailPage({ params }) {
  const { slug } = use(params);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { user } = useSession();
  
  const [activeImage, setActiveImage] = useState(null);

  const [reviewsList, setReviewsList] = useState([]);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(d => {
        const p = d.product;
        // DB-с ирсэн key-үүдийг frontend-ийн формат руу хөрвүүлэх
        const mapped = {
          ...p,
          nameMn: p.name_mn || p.name,
          originalPrice: p.original_price,
          inStock: p.in_stock,
          categoryMn: p.category_mn,
          reviews: p.reviews_count,
          howToUse: p.how_to_use,
          ingredients: p.ingredients,
          images: p.images || [],
          skinTypes: p.skin_types || [],
          skinConcerns: p.skin_concerns || [],
          tags: p.tags || []
        };
        setProduct(mapped);
        setActiveImage(mapped.image);

        // Тухайн барааны сэтгэгдлүүдийг татах
        fetch(`/api/reviews?productId=${p.id}`)
          .then(r => r.json())
          .then(data => setReviewsList(data.reviews || []))
          .catch(console.error);

        // Төстэй бүтээгдэхүүнүүдийг татах
        return fetch(`/api/products?cat=${p.category}&limit=4`);
      })
      .then(res => res.json())
      .then(d => {
         const rel = (d.products || []).map(p => ({
           ...p, nameMn: p.name_mn || p.name, originalPrice: p.original_price, categoryMn: p.category_mn
         }));
         setRelated(rel.filter(r => r.slug !== slug).slice(0, 3));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (error) notFound();
  if (loading || !product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-8 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
              {/* Image Skeleton */}
              <div className="space-y-4">
                <Skeleton className="w-full aspect-square rounded-2xl" />
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-xl" />
                  <Skeleton className="w-20 h-20 rounded-xl" />
                </div>
              </div>
              {/* Content Skeleton */}
              <div className="space-y-6 pt-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-8 w-1/4" />
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="pt-8 flex gap-4">
                  <Skeleton className="h-12 w-32 rounded-full" />
                  <Skeleton className="h-12 flex-1 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── САГСАНД НЭМЭХ ФУНКЦ ──
  function handleAddToCart() {
    addItem({ id: product.id, slug: product.slug, name: product.nameMn, price: product.price, image: product.image }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!user) return alert("Нэвтэрч байж сэтгэгдэл үлдээнэ үү");
    if (!reviewBody.trim()) return alert("Сэтгэгдлээ бичнэ үү");
    
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, rating: reviewRating, body: reviewBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || "Сэтгэгдэл нэмэхэд алдаа гарлаа");
      
      // Шинэ сэтгэгдлийг жагсаалтын эхэнд нэмэх (хуучин байвал устгаж шинэчлэх)
      setReviewsList([data.review, ...reviewsList.filter(r => r.id !== data.review.id)]);
      setReviewBody("");
      setReviewRating(5);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {/* замын мөр (Breadcrumb) */}
        <div className="border-b border-border/40 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Нүүр</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/products">Бүтээгдэхүүн</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.nameMn}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* ── БАРААНЫ МЭДЭЭЛЭЛ ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

            {/* ЗҮҮН ТАЛ: ЗУРГИЙН ГАЛЕРЕЙ */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted/30 rounded-2xl overflow-hidden border border-border/40">
                <Image
                  src={getImageUrl(activeImage || product.image)}
                  alt={product.nameMn}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority // Зургийг хурдан ачаалах (LCP)
                />
                {product.badge && (
                  <Badge className="absolute top-4 left-4 rounded-full text-xs">{product.badge}</Badge>
                )}
              </div>
              {/* Жижиг зургууд (Thumbnails) */}
              {(() => {
                const allImages = Array.from(new Set([product.image, ...(product.images || [])])).filter(Boolean);
                if (allImages.length > 0) {
                  return (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImage(img)}
                          className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors shrink-0 ${
                            activeImage === img ? "border-foreground" : "border-foreground/10 hover:border-foreground/40"
                          }`}
                        >
                          <Image src={getImageUrl(img)} alt={`thumbnail ${idx + 1}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* БАРУУН ТАЛ: ТЕКСТ МЭДЭЭЛЭЛ & ҮЙЛДЛҮҮД */}
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{product.categoryMn}</p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-foreground leading-tight mb-1">{product.nameMn}</h1>
              <p className="text-sm text-muted-foreground mb-5 italic">{product.name}</p>

              {/* Үнэлгээ & Сэтгэгдлийн тоо */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(product.rating) ? "fill-foreground text-foreground" : "fill-muted text-muted"}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{Number(product.rating || 0).toFixed(1)} ({product.reviews} сэтгэгдэл)</span>
              </div>

              {/* Үнэ & Хямдрал */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-foreground">{product.price.toLocaleString("mn-MN")}₮</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">{product.originalPrice.toLocaleString("mn-MN")}₮</span>
                    <Badge variant="destructive" className="text-xs rounded-full">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>

              <Separator className="mb-6" />

              {/* Тайлар & Тагууд */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">{product.description}</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full text-[10px] uppercase tracking-wider">{tag}</Badge>
                ))}
              </div>

              {/* ҮЙЛДЛИЙН ХЭСЭГ: ТОО ШИРХЭГ & САГСАНД НЭМЭХ */}
              {product.inStock ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                  {/* Тоо ширхэг */}
                  <div className="flex items-center border border-border rounded-full overflow-hidden shrink-0">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted"><Minus size={14} /></button>
                    <span className="w-10 text-center text-sm font-medium">{qty}</span>
                    <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-muted"><Plus size={14} /></button>
                  </div>
                  {/* Сагсанд нэмэх товч */}
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    className="flex-1 rounded-full h-11 gap-2 font-medium"
                    disabled={added}
                  >
                    {added ? <><Check size={16} /> Нэмэгдлээ!</> : <><ShoppingBag size={16} /> Сагсанд нэмэх</>}
                  </Button>
                </div>
              ) : (
                <Button disabled size="lg" className="rounded-full h-11 mb-6 w-full">Дууссан</Button>
              )}

              {/* Шууд захиалах холбоос */}
              {product.inStock && (
                <Button asChild variant="outline" size="lg" className="rounded-full h-11 mb-8">
                  <Link href="/checkout">Шууд захиалах</Link>
                </Button>
              )}

              {/* ── ТАБ ХЭСЭГ: ТАЙЛБАР / НАЙРЛАГА / СЭТГЭГДЭЛ ── */}
              <div className="mt-4">
                <Tabs defaultValue="description">
                  <TabsList className="mb-6 rounded-full bg-muted p-1 w-full justify-start overflow-x-auto flex-nowrap">
                    <TabsTrigger value="description" className="rounded-full px-4 text-xs sm:text-sm">Тайлбар</TabsTrigger>
                    <TabsTrigger value="ingredients" className="rounded-full px-4 text-xs sm:text-sm">Найрлага</TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-full px-4 text-xs sm:text-sm">Сэтгэгдэл ({product.reviews})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="text-sm text-muted-foreground leading-relaxed space-y-4">
                    <p>{product.description}</p>
                    {product.howToUse && (
                      <p><strong className="text-foreground">Хэрэглэх заавар:</strong> {product.howToUse}</p>
                    )}
                  </TabsContent>

                  <TabsContent value="ingredients" className="text-sm text-muted-foreground leading-relaxed">
                    {product.ingredients ? (
                      <p><strong className="text-foreground">Гол найрлага:</strong> {product.ingredients}</p>
                    ) : (
                      <p className="italic">Одоогоор найрлагын мэдээлэл ороогүй байна.</p>
                    )}
                    <p className="mt-4 text-xs italic">* Орц найрлагын дэлгэрэнгүй жагсаалтыг савлагаан дээрээс харна уу.</p>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-6">
                    {/* Сэтгэгдэл бичих хэсэг */}
                    <div className="bg-muted/30 p-5 rounded-2xl mb-8 border border-border/40">
                      <h3 className="text-sm font-semibold mb-3">Сэтгэгдэл үлдээх</h3>
                      {!user ? (
                        <p className="text-sm text-muted-foreground">Та <Link href="/login" className="text-foreground underline">нэвтэрч</Link> байж сэтгэгдэл үлдээх боломжтой.</p>
                      ) : (
                        <form onSubmit={submitReview} className="space-y-4">
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Үнэлгээ</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setReviewRating(star)}
                                  className="focus:outline-none"
                                >
                                  <Star size={18} className={star <= reviewRating ? "fill-foreground text-foreground" : "fill-muted text-muted"} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Сэтгэгдэл</label>
                            <textarea
                              required
                              value={reviewBody}
                              onChange={(e) => setReviewBody(e.target.value)}
                              className="w-full bg-background border border-border rounded-xl p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-foreground/20"
                              placeholder="Бүтээгдэхүүний талаарх сэтгэгдлээ хуваалцаарай..."
                            />
                          </div>
                          <Button type="submit" disabled={submittingReview} className="rounded-full">
                            {submittingReview ? "Илгээж байна..." : "Илгээх"}
                          </Button>
                        </form>
                      )}
                    </div>

                    {/* Бодит сэтгэгдлүүдийн жагсаалт */}
                    {reviewsList.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Одоогоор сэтгэгдэл байхгүй байна.</p>
                    ) : (
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-6">
                          {reviewsList.map((r) => (
                            <div key={r.id} className="border-b border-border/40 pb-6 last:border-0 last:pb-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{r.user_name || "Хэрэглэгч"}</p>
                                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("mn-MN")}</p>
                                </div>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={12} className={i < r.rating ? "fill-foreground text-foreground" : "fill-muted text-muted"} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{r.body}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        {/* ── ТӨСТЭЙ БҮТЭЭГДЭХҮҮНҮҮД ── */}
        {related.length > 0 && (
          <section className="border-t border-border/40 bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h2 className="text-2xl font-semibold text-foreground mb-8">Төстэй бүтээгдэхүүн</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {related.map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`} className="group">
                    <div className="relative aspect-square bg-muted/30 rounded-xl overflow-hidden mb-3 border border-border/40">
                      <Image src={getImageUrl(p.image)} alt={p.nameMn} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1">{p.categoryMn}</p>
                    <p className="text-sm font-medium text-foreground group-hover:underline underline-offset-2">{p.nameMn}</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{p.price.toLocaleString("mn-MN")}₮</p>
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
