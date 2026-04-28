"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

// Үүнээс дээш дүнтэй бол хүргэлтийг үнэгүй болгох босго.
const SHIPPING_THRESHOLD = 50000;

// Сагсны бараа, тоо ширхэг, дүн тооцоог харуулдаг хуудас.
export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, subtotal, totalItems } =
    useCart();

  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : 5000;
  const total = subtotal + shippingFee;

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {/* Header */}
        <div className="border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Нүүр
            </Link>
            <span>/</span>
            <span className="text-foreground">Сагс</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-semibold text-foreground mb-8">
            Миний сагс
            {totalItems > 0 && (
              <span className="ml-3 text-base font-normal text-muted-foreground">
                ({totalItems} бараа)
              </span>
            )}
          </h1>

          {items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <ShoppingBag size={32} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Сагс хоосон байна
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                Та бүтээгдэхүүн сонгон сагсандаа нэмнэ үү.
              </p>
              <Button asChild className="rounded-full px-8">
                <Link href="/products">
                  <ArrowLeft size={14} className="mr-2" />
                  Бүтээгдэхүүн үзэх
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* ── Cart items ── */}
              <div className="lg:col-span-2 space-y-0">
                <div className="hidden sm:grid grid-cols-12 text-xs uppercase tracking-widest text-muted-foreground pb-3 border-b border-border/40">
                  <span className="col-span-6">Бараа</span>
                  <span className="col-span-2 text-center">Үнэ</span>
                  <span className="col-span-2 text-center">Тоо</span>
                  <span className="col-span-2 text-right">Нийт</span>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 py-6 border-b border-border/40 items-center"
                  >
                    {/* Image + name */}
                    <div className="sm:col-span-6 flex gap-4 items-center">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted/30 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {item.name}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={`${item.name} устгах`}
                        >
                          <Trash2 size={11} />
                          Устгах
                        </button>
                      </div>
                    </div>

                    {/* Unit price */}
                    <div className="sm:col-span-2 text-sm text-foreground text-center">
                      {item.price.toLocaleString("mn-MN")}₮
                    </div>

                    {/* Qty */}
                    <div className="sm:col-span-2 flex items-center justify-center">
                      <div className="flex items-center border border-border rounded-full">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Бууруулах"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Нэмэх"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="sm:col-span-2 text-sm font-semibold text-foreground text-right">
                      {(item.price * item.quantity).toLocaleString("mn-MN")}₮
                    </div>
                  </div>
                ))}

                {/* Cart actions */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-sm rounded-full"
                  >
                    <Link href="/products">
                      <ArrowLeft size={14} className="mr-1.5" />
                      Дэлгүүр үргэлжлүүлэх
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-sm text-muted-foreground hover:text-destructive rounded-full"
                  >
                    <Trash2 size={13} className="mr-1.5" />
                    Сагс цэвэрлэх
                  </Button>
                </div>
              </div>

              {/* ── Order summary ── */}
              <div className="lg:col-span-1">
                <div className="bg-muted/30 rounded-2xl p-6 sticky top-24">
                  <h2 className="text-base font-semibold text-foreground mb-6">
                    Захиалгын дүн
                  </h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Барааны үнэ</span>
                      <span className="text-foreground">
                        {subtotal.toLocaleString("mn-MN")}₮
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Хүргэлт</span>
                      <span
                        className={
                          shippingFee === 0
                            ? "text-green-600 font-medium"
                            : "text-foreground"
                        }
                      >
                        {shippingFee === 0
                          ? "Үнэгүй"
                          : `${shippingFee.toLocaleString("mn-MN")}₮`}
                      </span>
                    </div>
                    {shippingFee > 0 && (
                      <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                        Үнэгүй хүргэлтэд{" "}
                        <strong className="text-foreground">
                          {(SHIPPING_THRESHOLD - subtotal).toLocaleString(
                            "mn-MN",
                          )}
                          ₮
                        </strong>{" "}
                        дутуу байна
                      </p>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-base font-semibold text-foreground mb-6">
                    <span>Нийт</span>
                    <span>{total.toLocaleString("mn-MN")}₮</span>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className="w-full rounded-full font-medium"
                  >
                    <Link href="/checkout" id="checkout-btn">
                      Захиалах
                      <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </Button>

                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Аюулгүй, шифрлэгдсэн төлбөр
                  </p>
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
