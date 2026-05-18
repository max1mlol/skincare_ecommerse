// ── cart/page.js ─────────────────────────────────────────────────────────────
// Энэ файлын үүрэг:
//   Хэрэглэгчийн сагсанд нэмсэн бараануудыг харуулах, тоог нь өөрчлөх,
//   нийт төлбөр болон хүргэлтийн зардлыг тооцоолох хуудас.
//
//   Тусгай боломжууд:
//     - Барааны тоо ширхэгийг өөрчлөх (Context update)
//     - Хүргэлтийн босго (50,000₮) шалгах
//     - Сагс хоосон үеийн "Empty state" харуулах
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/utils";

// lucide-react icon-ууд
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

// UI & Layout
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// CartContext: сагсны өгөгдөл удирдах global state
import { useCart } from "@/context/CartContext";
import { useSession } from "@/context/SessionContext";

// SHIPPING_THRESHOLD: Үүнээс дээш дүнтэй бол хүргэлт 0₮ болно.
const SHIPPING_THRESHOLD = 50000;

export default function CartPage() {
  // useCart-аас сагсны бүх мэдээллийг задалж (destructure) авна:
  // items: барааны жагсаалт | removeItem: устгах функц | updateQty: тоо солих | clearCart: сагс хоослох
  // subtotal: барааны нийлбэр үнэ | totalItems: нийт барааны тоо
  const { items, removeItem, setQty, clearCart, subtotal, totalItems } = useCart();
  const { user } = useSession();

  // Хүргэлтийн төлбөрийн логик
  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : 5000;
  // Эцсийн төлөх дүн
  const total = subtotal + shippingFee;

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {/* ХУУДАСНЫ ДЭЭД ХЭСЭГ (Breadcrumb) */}
        <div className="border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Нүүр</Link>
            <span>/</span>
            <span className="text-foreground">Сагс</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-semibold text-foreground mb-8">
            Миний сагс
            {totalItems > 0 && <span className="ml-3 text-base font-normal text-muted-foreground">({totalItems} бараа)</span>}
          </h1>

          {/* 1. САГС ХООСОН БАЙХ ҮЕД (Empty State) */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <ShoppingBag size={32} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Сагс хоосон байна</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs">Та бүтээгдэхүүн сонгон сагсандаа нэмнэ үү.</p>
              <Button asChild className="rounded-full px-8">
                <Link href="/products"><ArrowLeft size={14} className="mr-2" /> Бүтээгдэхүүн үзэх</Link>
              </Button>
            </div>
          ) : (
            // 2. САГС БАРААТАЙ БАЙХ ҮЕД
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* ЗҮҮН ТАЛ: БАРААНУУДЫН ЖАГСААЛТ */}
              <div className="lg:col-span-2 space-y-0">
                {/* Хүснэгтийн толгой (Том дэлгэцэнд л харагдана) */}
                <div className="hidden sm:grid grid-cols-12 text-xs uppercase tracking-widest text-muted-foreground pb-3 border-b border-border/40">
                  <span className="col-span-6">Бараа</span>
                  <span className="col-span-2 text-center">Үнэ</span>
                  <span className="col-span-2 text-center">Тоо</span>
                  <span className="col-span-2 text-right">Нийт</span>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 py-6 border-b border-border/40 items-center">
                    {/* Барааны зураг болон нэр */}
                    <div className="sm:col-span-6 flex gap-4 items-center">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted/30 shrink-0 border border-border/30">
                        <Image src={getImageUrl(item.image)} alt={item.name} fill sizes="80px" className="object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-snug">{item.name}</p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={11} /> Устгах
                        </button>
                      </div>
                    </div>

                    {/* Нэгжийн үнэ */}
                    <div className="sm:col-span-2 text-sm text-foreground text-center">{item.price.toLocaleString("mn-MN")}₮</div>

                    {/* Тоо ширхэг сонгогч */}
                    <div className="sm:col-span-2 flex items-center justify-center">
                      <div className="flex items-center border border-border rounded-full bg-background">
                        <button
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium select-none">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Нийт дүн (Unit price * Qty) */}
                    <div className="sm:col-span-2 text-sm font-semibold text-foreground text-right">
                      {(item.price * item.qty).toLocaleString("mn-MN")}₮
                    </div>
                  </div>
                ))}

                {/* САГСНЫ ҮЙЛДЛҮҮД (Доод хэсэг) */}
                <div className="flex items-center justify-between pt-6">
                  <Button asChild variant="ghost" size="sm" className="text-xs rounded-full">
                    <Link href="/products"><ArrowLeft size={14} className="mr-1.5" /> Дэлгүүр үргэлжлүүлэх</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-xs text-muted-foreground hover:text-destructive rounded-full"
                  >
                    <Trash2 size={13} className="mr-1.5" /> Сагс цэвэрлэх
                  </Button>
                </div>
              </div>

              {/* БАРУУН ТАЛ: ЗАХИАЛГЫН ХУРААНГУЙ (Checkout summary) */}
              <div className="lg:col-span-1">
                <div className="bg-muted/30 rounded-2xl p-6 sticky top-24 border border-border/40 shadow-sm">
                  <h2 className="text-base font-semibold text-foreground mb-6">Захиалгын дүн</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Барааны үнэ</span>
                      <span className="text-foreground">{subtotal.toLocaleString("mn-MN")}₮</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Хүргэлт</span>
                      <span className={shippingFee === 0 ? "text-green-600 font-medium" : "text-foreground"}>
                        {shippingFee === 0 ? "Үнэгүй" : `${shippingFee.toLocaleString("mn-MN")}₮`}
                      </span>
                    </div>

                    {/* Үнэгүй хүргэлт хүртэлх зөрүүг харуулах */}
                    {shippingFee > 0 && (
                      <div className="bg-muted/50 rounded-lg px-3 py-2 mt-2">
                        <p className="text-[11px] text-muted-foreground">
                          Үнэгүй хүргэлтэд <strong className="text-foreground">{(SHIPPING_THRESHOLD - subtotal).toLocaleString("mn-MN")}₮</strong> дутуу байна
                        </p>
                        {/* Progress bar (Процентээр) */}
                        <div className="w-full h-1 bg-background rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-foreground" style={{ width: `${(subtotal / SHIPPING_THRESHOLD) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-5" />

                  <div className="flex justify-between text-base font-bold text-foreground mb-8">
                    <span>Нийт төлөх</span>
                    <span className="text-lg">{total.toLocaleString("mn-MN")}₮</span>
                  </div>

                  {/* Захиалах товчлуур */}
                  {user?.role === "admin" ? (
                    <Button disabled size="lg" className="w-full rounded-full font-semibold shadow-lg h-12 opacity-50">
                      Админ захиалах боломжгүй
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="w-full rounded-full font-semibold shadow-lg transition-transform hover:scale-[1.02] active:scale-100 h-12">
                      <Link href="/checkout" id="checkout-link">
                        Захиалах <ArrowRight size={16} className="ml-2" />
                      </Link>
                    </Button>
                  )}

                  <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-muted-foreground uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Аюулгүй төлбөрийн систем
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
