// login/page.js — хэрэглэгч нэвтрэх хуудас
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router    = useRouter();
  const { login } = useSession();
  const [form,     setForm]     = useState({ identifier: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(form.identifier, form.password);
      if (user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err.message || "Нэвтрэх мэдээлэл буруу байна.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/20">
      <div className="w-full max-w-sm bg-background p-8 rounded-2xl shadow-sm border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mt-2 mb-1">Нэвтрэх</h1>
            <p className="text-sm text-muted-foreground">
              Бүртгэлгүй юу?{" "}
              <Link href="/register" className="text-foreground underline underline-offset-4 hover:no-underline">
                Бүртгүүлэх
              </Link>
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Имэйл эсвэл утасны дугаар</Label>
              <Input id="identifier" type="text" placeholder="name@example.com"
                value={form.identifier} onChange={update("identifier")} autoComplete="off" required />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Нууц үг</Label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                  Мартсан уу?
                </Link>
              </div>
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
            <Button type="submit" className="w-full rounded-full h-10" disabled={loading}>
              {loading ? "Нэвтэрч байна..." : <><LogIn size={16} className="mr-2" />Нэвтрэх</>}
            </Button>
          </form>
      </div>
    </main>
  );
}
