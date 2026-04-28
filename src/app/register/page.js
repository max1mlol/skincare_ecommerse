"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";

// Нууц үг бичих явцад шууд шалгах энгийн дүрмүүд.
const PASSWORD_RULES = [
  { label: "8+ тэмдэгт", test: (v) => v.length >= 8 },
  { label: "Том үсэг", test: (v) => /[A-Z]/.test(v) },
  { label: "Тоо", test: (v) => /\d/.test(v) },
];

// Шинэ хэрэглэгч бүртгүүлэх demo form.
export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Заавал бөглөнө";
    if (!form.lastName.trim()) e.lastName = "Заавал бөглөнө";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Имэйл буруу байна";
    if (form.password.length < 8) e.password = "8+ тэмдэгт оруулна уу";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Нууц үг таарахгүй байна";
    if (!agree) e.agree = "Нөхцөлийг зөвшөөрнө үү";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    alert("Бүртгэл: Backend холболт удахгүй нэмэгдэнэ.");
  }

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-57px)] flex items-center justify-center px-4 py-12 bg-muted/20">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-foreground mt-4 mb-1">
              Бүртгүүлэх
            </h1>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-first">Овог</Label>
                  <Input
                    id="reg-first"
                    required
                    value={form.firstName}
                    onChange={update("firstName")}
                    placeholder="Батаа"
                    className="rounded-xl h-10"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-last">Нэр</Label>
                  <Input
                    id="reg-last"
                    required
                    value={form.lastName}
                    onChange={update("lastName")}
                    placeholder="Болд"
                    className="rounded-xl h-10"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Имэйл</Label>
                <Input
                  id="reg-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  placeholder="example@mail.com"
                  className="rounded-xl h-10"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-pass">Нууц үг</Label>
                <div className="relative">
                  <Input
                    id="reg-pass"
                    type={showPass ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={update("password")}
                    placeholder="••••••••"
                    className="rounded-xl h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPass ? "Нуух" : "Харуулах"}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Password strength */}
                {form.password && (
                  <div className="flex gap-2 pt-1">
                    {PASSWORD_RULES.map((r) => {
                      const ok = r.test(form.password);
                      return (
                        <span
                          key={r.label}
                          className={`flex items-center gap-1 text-[11px] ${ok ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          <Check
                            size={10}
                            className={ok ? "opacity-100" : "opacity-30"}
                          />
                          {r.label}
                        </span>
                      );
                    })}
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm">Нууц үг давтах</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  placeholder="••••••••"
                  className="rounded-xl h-10"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <Checkbox
                    id="terms-agree"
                    checked={agree}
                    onCheckedChange={setAgree}
                    className="mt-0.5 rounded"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    <Link
                      href="/privacy"
                      className="text-foreground underline underline-offset-2"
                    >
                      Нууцлалын бодлого
                    </Link>{" "}
                    болон{" "}
                    <Link
                      href="/terms"
                      className="text-foreground underline underline-offset-2"
                    >
                      Үйлчилгээний нөхцөл
                    </Link>
                    -ийг зөвшөөрч байна
                  </span>
                </label>
                {errors.agree && (
                  <p className="text-xs text-destructive ml-6">
                    {errors.agree}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                id="register-submit-btn"
                className="w-full rounded-full h-10 text-sm font-medium mt-2"
                disabled={loading}
              >
                {loading ? (
                  "Бүртгэж байна..."
                ) : (
                  <>
                    <UserPlus size={15} className="mr-2" />
                    Бүртгүүлэх
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-5">
              <Separator />
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                эсвэл
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full rounded-xl h-10 text-sm"
              type="button"
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google-ээр бүртгүүлэх
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Бүртгэлтэй юу?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline underline-offset-2"
            >
              Нэвтрэх
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
