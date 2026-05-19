// register/page.js — Шинэ хэрэглэгч бүртгүүлэх хуудас.
// Энэ хуудас нь Next.js-ийн Client Component бөгөөд хэрэглэгчийн овог нэр, утас, имэйл болон нууц үгийн оролтуудыг шалгаж баталгаажуулна.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus, Check } from "lucide-react";
import { useSession }  from "@/context/SessionContext"; // Сессийн контекст ашиглана
import { Button }      from "@/components/ui/button";
import { Input }       from "@/components/ui/input";
import { Label }       from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// PASSWORD_RULES: Нууц үгийн хүчийг шалгаж, хэрэглэгчид шууд харуулах дүрэмт жагсаалт
const PASSWORD_RULES = [
  { label: "8+ тэмдэгт",  test: (v) => v.length >= 8 },
  { label: "Том үсэг",    test: (v) => /[A-Z]/.test(v) },
  { label: "Тоо",         test: (v) => /\d/.test(v) },
  { label: "Тусгай тэмдэгт", test: (v) => /[!@#$%^&*]/.test(v) },
];

export default function RegisterPage() {
  const router        = useRouter(); // Бүртгэл дууссаны дараа шилжихэд ашиглана
  const { register }  = useSession(); // Бүртгүүлэх функцийг сессийн контекстоос авна

  // form: Хэрэглэгчийн бүртгэлийн мэдээллийг хадгалах объект
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "" });
  // showPass: Нууц үгийг нуух/харуулах төлөв
  const [showPass, setShowPass] = useState(false);
  // loading: Хүсэлт илгээж байх үед идэвхтэй болох төлөв
  const [loading,  setLoading]  = useState(false);
  // apiError: Серверээс ирсэн алдааны мэдээллийг хадгалах төлөв
  const [apiError, setApiError] = useState("");
  // errors: Оролтын талбаруудын валидацын алдаануудыг хадгалах төлөв
  const [errors,   setErrors]   = useState({});

  // update: Оролтын талбарын утга өөрчлөгдөх бүрд стэйтийг шинэчлэх функц
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // validate: Frontend талын оролтын утгуудыг шалгах логик
  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Заавал бөглөнө";
    if (!form.lastName.trim())  e.lastName  = "Заавал бөглөнө";
    if (!form.phone.trim())     e.phone     = "Заавал бөглөнө";
    // Имэйл хаягийн зөв форматыг шалгах regex
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Имэйл буруу байна";
    // Нууц үгийн бүх дүрэм биелсэн эсэхийг шалгах
    if (!PASSWORD_RULES.every((r) => r.test(form.password))) e.password = "Нууц үгийн дүрэм хангаагүй";
    return e;
  }

  // handleSubmit: Бүртгүүлэх товч дарагдах үед дуудагдах функц
  async function handleSubmit(e) {
    e.preventDefault(); // Хуудас дахин ачаалагдахаас сэргийлнэ
    const errs = validate();
    // Хэрэв ямар нэгэн алдаа байвал үргэлжлүүлэхгүй, алдааны стэйтэд хадгална
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      // Сервер рүү хэрэглэгчийн мэдээллийг илгээнэ
      await register(form.firstName.trim(), form.lastName.trim(), form.phone.trim(), form.email, form.password);
      // Бүртгэл амжилттай бол нүүр хуудас руу шилжүүлнэ
      router.push("/");
    } catch (err) {
      setApiError(err.message || "Бүртгэхэд алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/20">
      <div className="w-full max-w-sm bg-background p-8 rounded-2xl shadow-sm border border-border">
        
        {/* Толгой хэсэг: Бүртгүүлэх гарчиг болон нэвтрэх рүү очих холбоос */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mt-2 mb-1">Бүртгүүлэх</h1>
          <p className="text-sm text-muted-foreground">
            Бүртгэлтэй юу?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4 hover:no-underline">
              Нэвтрэх
            </Link>
          </p>
        </div>

        {/* Серверээс ирсэн алдааг харуулах */}
        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
          
          {/* Нэр, Овог оруулах талбар */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Нэр</Label>
              <Input id="firstName" value={form.firstName} onChange={update("firstName")} placeholder="e.g. Bat" autoComplete="off" />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Овог</Label>
              <Input id="lastName" value={form.lastName} onChange={update("lastName")} placeholder="e.g. Dorj" autoComplete="off" />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          {/* Утасны дугаар оруулах талбар */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Утасны дугаар</Label>
            <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} placeholder="99000000" autoComplete="off" />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Имэйл хаяг оруулах талбар */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Имэйл</Label>
            <Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="name@example.com" autoComplete="off" />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Нууц үг оруулах болон хүч шалгах хэсэг */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Нууц үг</Label>
            <div className="relative">
              <Input id="password" type={showPass ? "text" : "password"} value={form.password}
                onChange={update("password")} placeholder="••••••••" className="pr-10" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPass ? "Нуух" : "Харах"}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {/* Нууц үгийн хүчний дүрэм биелж буйг харуулах шошгонууд */}
            <div className="flex flex-wrap gap-2 pt-1">
              {PASSWORD_RULES.map((r) => (
                <span key={r.label} className={`flex items-center gap-1 text-[11px] ${r.test(form.password) ? "text-green-600" : "text-muted-foreground"}`}>
                  {r.test(form.password) && <Check size={10} />}{r.label}
                </span>
              ))}
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          {/* Илгээх товчлуур */}
          <Button type="submit" className="w-full rounded-full h-10" disabled={loading}>
            {loading ? "Бүртгэж байна..." : <><UserPlus size={16} className="mr-2" />Бүртгүүлэх</>}
          </Button>
          
          {/* Үйлчилгээний нөхцөл */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Бүртгэл үүсгэснээр та манай <Link href="/terms" className="underline hover:no-underline text-foreground">Үйлчилгээний Нөхцөл</Link> болон <Link href="/privacy" className="underline hover:no-underline text-foreground">Нууцлалын Бодлого</Link>-ыг зөвшөөрч буй хэрэг юм.
          </p>
        </form>
      </div>
    </main>
  );
}
