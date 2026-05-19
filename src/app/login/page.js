// login/page.js — Хэрэглэгч системд нэвтрэх хуудас.
// Энэхүү хуудас нь Next.js-ийн Client Component бөгөөд хэрэглэгчийн имэйл/утасны дугаар болон нууц үгийг авч, SessionContext-оор дамжуулан нэвтрүүлнэ.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useSession } from "@/context/SessionContext"; // Глобал сессийн төлөвийг удирдах hook
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router    = useRouter(); // Хуудас хооронд шилжилт хийхэд ашиглана
  const { login } = useSession(); // SessionContext-оос login функцийг авна

  // form: Хэрэглэгчийн бичсэн утгуудыг хадгалах объект
  const [form,     setForm]     = useState({ identifier: "", password: "" });
  // showPass: Нууц үгийг ил харуулах эсвэл нуух төлөв (true = ил харуулна)
  const [showPass, setShowPass] = useState(false);
  // loading: API хүсэлт явагдаж байх үед товчийг идэвхгүй болгох төлөв
  const [loading,  setLoading]  = useState(false);
  // error: Нэвтрэх үед гарсан алдааны мэдээллийг хадгалах төлөв
  const [error,    setError]    = useState("");

  // update: Оролтын талбарын утга өөрчлөгдөх бүрд form стэйтийг шинэчлэх функц
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // handleSubmit: Нэвтрэх товч дарагдах үед дуудагдах функц
  async function handleSubmit(e) {
    e.preventDefault(); // Форм илгээх үед хуудас дахин ачаалагдахаас сэргийлнэ
    setLoading(true);
    setError("");
    try {
      // SessionContext-ийн login функц рүү хэрэглэгчийн өгөгдлийг дамжуулна
      const user = await login(form.identifier, form.password);
      
      // Хэрэглэгчийн үүрэг (role)-ээс хамаарч шилжих хуудсыг шийднэ
      if (user?.role === "admin") {
        router.push("/admin"); // Админ бол удирдлагын хэсэг рүү шилжинэ
      } else {
        router.push("/"); // Жирийн хэрэглэгч бол нүүр хуудас руу шилжинэ
      }
    } catch (err) {
      // Алдаа гарвал дэлгэцэнд харуулах алдааны стэйтэд хадгална
      setError(err.message || "Нэвтрэх мэдээлэл буруу байна.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/20">
      <div className="w-full max-w-sm bg-background p-8 rounded-2xl shadow-sm border border-border">
        
        {/* Толгой хэсэг: Гарчиг болон бүртгүүлэх холбоос */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mt-2 mb-1">Нэвтрэх</h1>
          <p className="text-sm text-muted-foreground">
            Бүртгэлгүй юу?{" "}
            <Link href="/register" className="text-foreground underline underline-offset-4 hover:no-underline">
              Бүртгүүлэх
            </Link>
          </p>
        </div>

        {/* Алдааны мэдээлэл гарсан бол Alert компонент ашиглан харуулна */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Нэвтрэх форм */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
          
          {/* Имэйл эсвэл утасны дугаар оруулах хэсэг */}
          <div className="space-y-1.5">
            <Label htmlFor="identifier">Имэйл эсвэл утасны дугаар</Label>
            <Input id="identifier" type="text" placeholder="name@example.com"
              value={form.identifier} onChange={update("identifier")} autoComplete="off" required />
          </div>

          {/* Нууц үг оруулах хэсэг */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Нууц үг</Label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                Мартсан уу?
              </Link>
            </div>
            
            {/* Нууц үг харах/нуух товчлуур бүхий input */}
            <div className="relative">
              <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••"
                className="pr-10" autoComplete="new-password"
                value={form.password} onChange={update("password")} required />
              
              <button type="button" onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPass ? "Нуух" : "Харах"}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Илгээх товчлуур */}
          <Button type="submit" className="w-full rounded-full h-10" disabled={loading}>
            {loading ? "Нэвтэрч байна..." : <><LogIn size={16} className="mr-2" />Нэвтрэх</>}
          </Button>
        </form>
      </div>
    </main>
  );
}
