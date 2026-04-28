"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, CreditCard, Truck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

// Checkout-ийн гурван үндсэн алхам.
const STEPS = ["Хаяг", "Хүргэлт", "Төлбөр"];

// Хэрэглэгчид санал болгох хүргэлтийн сонголтууд.
const DELIVERY_OPTIONS = [
  {
    id: "standard",
    label: "Стандарт хүргэлт",
    sub: "2–3 ажлын өдөр",
    price: 5000,
  },
  {
    id: "express",
    label: "Хурдан хүргэлт",
    sub: "Өнөөдөр – Маргааш",
    price: 9000,
  },
  {
    id: "free",
    label: "Үнэгүй хүргэлт",
    sub: "3–5 ажлын өдөр (50,000₮+)",
    price: 0,
  },
];

// Захиалга баталгаажуулахын өмнөх бүх мэдээллийг нэгтгэдэг checkout хуудас.
export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState("standard");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    district: "",
    khoroo: "",
    detail: "",
  });

  const shippingFee =
    DELIVERY_OPTIONS.find((d) => d.id === delivery)?.price ?? 5000;
  const total = subtotal + shippingFee;

  function handleAddressNext(e) {
    e.preventDefault();
    setStep(1);
  }

  function handleDeliveryNext(e) {
    e.preventDefault();
    setStep(2);
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setPlacing(true);
    // API дуудлагыг дуурайлгах
    await new Promise((r) => setTimeout(r, 1400));
    clearCart();
    setOrderId(`#AUR-${Math.floor(10000 + Math.random() * 90000)}`);
    setDone(true);
    setPlacing(false);
  }

  if (done) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center py-20">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check size={28} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Захиалга амжилттай!
            </h1>
            <p className="text-sm text-muted-foreground mb-2">
              Таны захиалгыг хүлээн авлаа. Утсан дээрх мэдэгдэл болон имэйлээ
              шалгана уу.
            </p>
            <p className="text-xs text-muted-foreground mb-8">
              Захиалгын дугаар:{" "}
              <strong className="text-foreground">
                {orderId}
              </strong>
            </p>
            <Button asChild className="rounded-full px-8">
              <Link href="/products">Бүтээгдэхүүн</Link>
            </Button>
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
        {/* Зам заагч (Breadcrumb) */}
        <div className="border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/cart"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Сагс
            </Link>
            <span>/</span>
            <span className="text-foreground">Захиалах</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-semibold text-foreground mb-8">
            Захиалах
          </h1>

          {/* Алхмын үзүүлэлт */}
          <div className="flex items-center gap-0 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    i === step
                      ? "text-foreground"
                      : i < step
                        ? "text-foreground/60 hover:text-foreground cursor-pointer"
                        : "text-muted-foreground cursor-default"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${
                      i < step
                        ? "bg-foreground text-background border-foreground"
                        : i === step
                          ? "border-foreground text-foreground"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    {i < step ? <Check size={12} /> : i + 1}
                  </span>
                  {s}
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-12 h-px mx-3 ${i < step ? "bg-foreground" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* ── Формын алхмууд ── */}
            <div className="lg:col-span-2">
              {/* Алхам 0 — Хүргэлтийн хаяг */}
              {step === 0 && (
                <form
                  onSubmit={handleAddressNext}
                  className="space-y-6"
                  aria-label="Хүргэлтийн хаяг"
                >
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Truck size={18} /> Хүргэлтийн хаяг
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Овог</Label>
                      <Input
                        id="firstName"
                        required
                        value={address.firstName}
                        onChange={(e) =>
                          setAddress({ ...address, firstName: e.target.value })
                        }
                        placeholder="Батаа"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Нэр</Label>
                      <Input
                        id="lastName"
                        required
                        value={address.lastName}
                        onChange={(e) =>
                          setAddress({ ...address, lastName: e.target.value })
                        }
                        placeholder="Болд"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Утасны дугаар</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={address.phone}
                        onChange={(e) =>
                          setAddress({ ...address, phone: e.target.value })
                        }
                        placeholder="9900 0000"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Имэйл</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={address.email}
                        onChange={(e) =>
                          setAddress({ ...address, email: e.target.value })
                        }
                        placeholder="example@mail.com"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">Дүүрэг</Label>
                      <Input
                        id="district"
                        required
                        value={address.district}
                        onChange={(e) =>
                          setAddress({ ...address, district: e.target.value })
                        }
                        placeholder="Хан-Уул"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="khoroo">Хороо</Label>
                      <Input
                        id="khoroo"
                        required
                        value={address.khoroo}
                        onChange={(e) =>
                          setAddress({ ...address, khoroo: e.target.value })
                        }
                        placeholder="1-р хороо"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="detail">Дэлгэрэнгүй хаяг</Label>
                      <Input
                        id="detail"
                        required
                        value={address.detail}
                        onChange={(e) =>
                          setAddress({ ...address, detail: e.target.value })
                        }
                        placeholder="Байр, орц, тоот"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-full px-10"
                  >
                    Үргэлжлүүлэх →
                  </Button>
                </form>
              )}

              {/* Алхам 1 — Хүргэлтийн арга */}
              {step === 1 && (
                <form
                  onSubmit={handleDeliveryNext}
                  className="space-y-6"
                  aria-label="Хүргэлтийн арга"
                >
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Truck size={18} /> Хүргэлтийн арга
                  </h2>
                  <RadioGroup
                    value={delivery}
                    onValueChange={setDelivery}
                    className="space-y-3"
                  >
                    {DELIVERY_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        htmlFor={`delivery-${opt.id}`}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                          delivery === opt.id
                            ? "border-foreground bg-muted/30"
                            : "border-border hover:border-foreground/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value={opt.id}
                            id={`delivery-${opt.id}`}
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {opt.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {opt.sub}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {opt.price === 0
                            ? "Үнэгүй"
                            : `${opt.price.toLocaleString("mn-MN")}₮`}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(0)}
                      className="rounded-full px-6"
                    >
                      ← Буцах
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="rounded-full px-10"
                    >
                      Үргэлжлүүлэх →
                    </Button>
                  </div>
                </form>
              )}

              {/* Алхам 2 — Төлбөр */}
              {step === 2 && (
                <form
                  onSubmit={handlePlaceOrder}
                  className="space-y-6"
                  aria-label="Төлбөрийн мэдээлэл"
                >
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <CreditCard size={18} /> Төлбөр
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Картын дугаар</Label>
                      <Input
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="rounded-xl font-mono tracking-wider"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Хугацаа</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          maxLength={5}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          maxLength={4}
                          className="rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardHolder">Карт эзэмшигчийн нэр</Label>
                      <Input
                        id="cardHolder"
                        placeholder="BOLD BATAA"
                        className="rounded-xl uppercase"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">
                    <Lock size={13} className="shrink-0" />
                    Таны төлбөрийн мэдээлэл SSL шифрлэлтээр хамгаалагдсан
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="rounded-full px-6"
                    >
                      ← Буцах
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={placing}
                      className="rounded-full px-10 flex-1"
                    >
                      {placing
                        ? "Боловсруулж байна..."
                        : `${total.toLocaleString("mn-MN")}₮ Төлөх`}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* ── Захиалгын хураангуй ── */}
            <div className="lg:col-span-1">
              <div className="bg-muted/30 rounded-2xl p-6 sticky top-24">
                <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-widest">
                  Захиалгын дүн
                </h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[9px] rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {item.name}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-foreground shrink-0">
                        {(item.price * item.quantity).toLocaleString("mn-MN")}₮
                      </p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Барааны үнэ</span>
                    <span>{subtotal.toLocaleString("mn-MN")}₮</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Хүргэлт</span>
                    <span>
                      {shippingFee === 0
                        ? "Үнэгүй"
                        : `${shippingFee.toLocaleString("mn-MN")}₮`}
                    </span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-base font-semibold text-foreground">
                  <span>Нийт</span>
                  <span>{total.toLocaleString("mn-MN")}₮</span>
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
