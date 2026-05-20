// ── checkout/page.js ─────────────────────────────────────────────────────────
// Энэ файлын үүрэг:
//   Захиалга баталгаажуулах хуудас. Хэрэглэгчээс хаяг, хүргэлтийн арга,
//   төлбөрийн мэдээллийг 3 үе шаттайгаар авна.
//
//   Технологи:
//     - Multi-step form (step 0, 1, 2)
//     - Сагсны өгөгдлийг нэгтгэж харуулах
//     - Амжилттай болбол "Захиалга баталгаажсан" хуудас руу шилжинэ
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";

// lucide-react icon-ууд: Check: зөв | ChevronLeft: буцах | Truck: хүргэлт | Lock: SSL
import { Check, ChevronLeft, CreditCard, Truck, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

// STEPS: Checkout-ийн үндсэн алхмууд
const STEPS = ["Хаяг", "Хүргэлт", "Төлбөр"];

// DELIVERY_OPTIONS: Хүргэлтийн сонголтууд
const DELIVERY_OPTIONS = [
  { id: "standard", label: "Стандарт хүргэлт", sub: "2–3 ажлын өдөр", price: 5000 },
  { id: "express", label: "Хурдан хүргэлт", sub: "Өнөөдөр – Маргааш", price: 9000 },
  { id: "free", label: "Үнэгүй хүргэлт", sub: "3–5 ажлын өдөр (50,000₮+)", price: 0 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // step: одоо байгаа алхамын индекс (0, 1, 2)
  const [step, setStep] = useState(0);

  // delivery: сонгосон хүргэлтийн төрөл
  const [delivery, setDelivery] = useState("standard");

  const [placing, setPlacing] = useState(false);
  const [done,    setDone]    = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error,   setError]   = useState(null);

  // address: хүргэлтийн хаягийн өгөгдөл
  const [address, setAddress] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    district: "", khoroo: "", detail: ""
  });

  // shippingFee: сонгосон хүргэлтийн үнэ
  const shippingFee = DELIVERY_OPTIONS.find((d) => d.id === delivery)?.price ?? 5000;
  const total = subtotal + shippingFee;

  // ── АЛХАМ УРАГШЛУУЛАХ ФУНКЦҮҮД ──
  function handleAddressNext(e) { e.preventDefault(); setStep(1); }
  function handleDeliveryNext(e) { e.preventDefault(); setStep(2); }

  // ── ЗАХИАЛГА ХИЙХ — Express /api/orders руу POST илгээнэ ──
  async function handlePlaceOrder(e) {
    e.preventDefault();
    setPlacing(true);
    try {
      const res  = await fetch("/api/orders", {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, qty: i.qty, price: i.price })),
          total,
          address,
          deliveryMethod: delivery,
          shippingFee,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Захиалга илгээхэд алдаа гарлаа");
      clearCart();
      setOrderId(data.order?.order_number ?? `#AUR-${Date.now()}`);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  // ── ЗАХИАЛГА АМЖИЛТТАЙ БОЛСОН ХАРУУЛАЛТ ──
  if (done) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center py-20 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check size={28} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Захиалга амжилттай!</h1>
            <p className="text-sm text-muted-foreground mb-2">Таны захиалгыг хүлээн авлаа. Имэйлээ шалгана уу.</p>
            <p className="text-xs text-muted-foreground mb-8">Захиалгын дугаар: <strong className="text-foreground">{orderId}</strong></p>
            <Button asChild className="rounded-full px-8 shadow-lg"><Link href="/products">Дэлгүүр үргэлжлүүлэх</Link></Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* ХУУДАСНЫ ДЭЭД ХЭСЭГ (Breadcrumb) */}
        <div className="border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/cart" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ChevronLeft size={14} /> Сагс
            </Link>
            <span>/</span>
            <span className="text-foreground">Захиалах</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-semibold text-foreground mb-8">Захиалах</h1>

          {/* АЛХМЫН ҮЗҮҮЛЭЛТ (Stepper) */}
          <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-4 no-scrollbar">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center shrink-0">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${i === step ? "text-foreground" : i < step ? "text-foreground/60 hover:text-foreground cursor-pointer" : "text-muted-foreground cursor-default"}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${i < step ? "bg-foreground text-background border-foreground" : i === step ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
                    {i < step ? <Check size={12} /> : i + 1}
                  </span>
                  {s}
                </button>
                {i < STEPS.length - 1 && <div className={`w-8 sm:w-12 h-px mx-3 ${i < step ? "bg-foreground" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ЗҮҮН ТАЛ: ФОРМЫН АЛХМУУД */}
            <div className="lg:col-span-2">
              {/* АЛХАМ 0: ХҮРГЭЛТИЙН ХАЯГ */}
              {step === 0 && (
                <form onSubmit={handleAddressNext} className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Truck size={18} /> Хүргэлтийн хаяг</h2>
                  {error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Овог</Label>
                      <Input id="firstName" required value={address.firstName} onChange={(e) => setAddress({ ...address, firstName: e.target.value })} placeholder="Батаа" className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Нэр</Label>
                      <Input id="lastName" required value={address.lastName} onChange={(e) => setAddress({ ...address, lastName: e.target.value })} placeholder="Болд" className="rounded-xl" />
                    </div>
                    {/* (Код товчлов: Phone, Email, District, Khoroo талбарууд) */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Утасны дугаар</Label>
                      <Input id="phone" type="tel" required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="9900 0000" className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Имэйл</Label>
                      <Input id="email" type="email" required value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} placeholder="example@mail.com" className="rounded-xl" />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="detail">Дэлгэрэнгүй хаяг</Label>
                      <Input id="detail" required value={address.detail} onChange={(e) => setAddress({ ...address, detail: e.target.value })} placeholder="Байр, орц, тоот" className="rounded-xl" />
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="rounded-full px-10 shadow-md">Үргэлжлүүлэх →</Button>
                </form>
              )}

              {/* АЛХАМ 1: ХҮРГЭЛТИЙН АРГА */}
              {step === 1 && (
                <form onSubmit={handleDeliveryNext} className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Truck size={18} /> Хүргэлтийн арга</h2>
                  <RadioGroup value={delivery} onValueChange={setDelivery} className="space-y-3">
                    {DELIVERY_OPTIONS.map((opt) => (
                      <label key={opt.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${delivery === opt.id ? "border-foreground bg-muted/40 shadow-sm" : "border-border hover:border-foreground/30"}`}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={opt.id} id={`delivery-${opt.id}`} />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                            <p className="text-[11px] text-muted-foreground">{opt.sub}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-foreground">{opt.price === 0 ? "Үнэгүй" : `${opt.price.toLocaleString("mn-MN")}₮`}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(0)} className="rounded-full px-8">Буцах</Button>
                    <Button type="submit" size="lg" className="rounded-full px-10 shadow-md">Үргэлжлүүлэх →</Button>
                  </div>
                </form>
              )}

              {/* АЛХАМ 2: ТӨЛБӨР (Card payment placeholder) */}
              {step === 2 && (
                <form onSubmit={handlePlaceOrder} className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><CreditCard size={18} /> Төлбөрийн мэдээлэл</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Картын дугаар</Label>
                      <Input id="cardNumber" placeholder="0000 0000 0000 0000" className="rounded-xl font-mono" required />
                    </div>
                    {/* (Код товчлов: Expiry, CVV талбарууд) */}
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 rounded-xl p-4">
                      <Lock size={14} /> Таны мэдээлэл SSL шифрлэлтээр хамгаалагдсан.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-full px-8">Буцах</Button>
                    <Button type="submit" size="lg" disabled={placing} className="rounded-full px-10 flex-1 shadow-lg">
                      {placing ? "Уншиж байна..." : `${total.toLocaleString("mn-MN")}₮ Төлөх`}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* БАРУУН ТАЛ: ЗАХИАЛГЫН ХУРААНГУЙ (Summary) */}
            <div className="lg:col-span-1">
              <div className="bg-muted/30 rounded-2xl p-6 sticky top-24 border border-border/40">
                <h3 className="text-xs font-bold text-foreground mb-4 uppercase tracking-[0.2em]">Захиалгын хураангуй</h3>
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/20">
                        <Image src={getImageUrl(item.image)} alt={item.name} fill sizes="48px" className="object-cover" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[9px] rounded-full flex items-center justify-center font-bold">{item.qty}</span>
                      </div>
                      <p className="text-[11px] font-medium text-foreground flex-1 truncate">{item.name}</p>
                      <p className="text-[11px] font-bold text-foreground">{(item.price * item.qty).toLocaleString("mn-MN")}₮</p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Нийлбэр</span><span>{subtotal.toLocaleString("mn-MN")}₮</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Хүргэлт</span><span>{shippingFee === 0 ? "Үнэгүй" : `${shippingFee.toLocaleString("mn-MN")}₮`}</span></div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-base font-bold text-foreground">
                  <span>Нийт төлөх</span><span>{total.toLocaleString("mn-MN")}₮</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
