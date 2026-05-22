"use client";
// account/profile/page.js — Хэрэглэгчийн хувийн тохиргооны хуудас.
// Эндээс хэрэглэгч өөрийн овог, нэр, утасны дугаар, аватар зургаа солих болон нууц үгээ өөрчлөх боломжтой.
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, User, ShoppingBag, Shield, LogOut } from "lucide-react";
import { useSession } from "@/context/SessionContext"; // Глобал Session мэдээлэл болон өгөгдөл шинэчлэх функцийг уншина
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Navbar        from "@/components/Navbar";
import Footer        from "@/components/Footer";
import { getImageUrl } from "@/lib/utils";
import { announce } from "@/lib/announcer";

export default function ProfilePage() {
  const { user, loading: authLoading, refetch, logout } = useSession();
  const router = useRouter();
  const avatarInputRef = useRef(null);

  // form: Хэрэглэгчийн овог нэр, утасны дугаар зэргийг өөрчлөх state
  const [form,    setForm]    = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [saving,  setSaving]  = useState(false); // Хадгалалтын явцыг илэрхийлэх төлөв
  const [isEditing, setIsEditing] = useState(false); // Мэдээлэл засаж буй эсэхийг заах төлөв
  const [msg,     setMsg]     = useState({ type: "", text: "" }); // Амжилттай эсвэл алдаатай хариуны зурвас
  const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" });  // passForm: Нууц үг солих оролтуудыг хадгалах state

  useEffect(() => {
    // 1. Хэрэв ачаалж дуусаад хэрэглэгч байхгүй бол нэвтрэх хуудас руу шилжүүлнэ
    if (!authLoading && !user) { router.replace("/login"); return; }
    // 2. Хэрэв админ нэвтэрсэн байвал профайл хуудас биш админ хэсэг рүү шилжүүлнэ
    if (!authLoading && user && user.role === "admin") { router.replace("/admin"); return; }
    
    if (user) {
      const initForm = async () => {
        setForm({ firstName: user.first_name ?? "", lastName: user.last_name ?? "", email: user.email ?? "", phone: user.phone ?? "" });
      };
      initForm();
    }
  }, [user, authLoading, router]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // saveProfile: Хувийн мэдээллээ хадгалах функц
  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true); setMsg({ type: "", text: "" });
    try {
      const res  = await fetch(`/api/users/${user.id}`, {
        method:      "PATCH",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ firstName: form.firstName, lastName: form.lastName, phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Хадгалахад алдаа гарлаа");
      
      await refetch();
      setIsEditing(false);
      setMsg({ type: "ok", text: "Профайл амжилттай шинэчлэгдлээ" });
      announce("Профайл амжилттай шинэчлэгдлээ");
    } catch (err) {
      setMsg({ type: "err", text: err.message });
      announce(err.message, "assertive");
    }
    finally { setSaving(false); }
  }

  // changePassword: Нууц үгээ солих функц
  async function changePassword(e) {
    e.preventDefault();
    if (passForm.next !== passForm.confirm) {
      setMsg({ type: "err", text: "Шинэ нууц үг таарахгүй байна" }); return;
    }
    setSaving(true); setMsg({ type: "", text: "" });
    try {
      const res  = await fetch(`/api/users/${user.id}/password`, {
        method:      "PATCH",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Одоогийн нууц үг буруу байна");
      
      setPassForm({ current: "", next: "", confirm: "" });
      setMsg({ type: "ok", text: "Нууц үг амжилттай солигдлоо" });
    } catch (err) { setMsg({ type: "err", text: err.message }); }
    finally { setSaving(false); }
  }

  // Avatar зургийг сонгонгуут FormData үүсгэж сервер лүү илгээх функц
  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData(); fd.append("avatar", file);
    const res = await fetch(`/api/users/${user.id}/avatar`, {
      method: "POST", credentials: "include", body: fd,
    });
    if (res.ok) {
      await refetch();
      announce("Профайл зураг амжилттай шинэчлэгдлээ");
    } else {
      const data = await res.json().catch(() => ({}));
      announce(data.error || "Зураг байршуулахад алдаа гарлаа", "assertive");
    }
  }

  if (authLoading || !user) return null;

  const initials = user.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "U";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted/10 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row gap-10">
            {/* ── ЗҮҮН САЙДБАР (Sidebar Navigation) ── */}
            <aside className="w-full md:w-64 shrink-0 space-y-6">
              
              {/* Хэрэглэгчийн товч мэдээлэл болон Аватар солих хэсэг */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
                <div className="relative">
                  <Avatar className="w-12 h-12 border border-border">
                    <AvatarImage src={getImageUrl(user.avatar_url)} alt={user.name} className="object-cover" />
                    <AvatarFallback className="bg-foreground text-background font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => avatarInputRef.current?.click()}
                    aria-label="Профайл зураг солих"
                    title="Зураг солих"
                  >
                    <Camera size={10} />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    aria-label="Профайл зураг сонгох"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              {/* Navigation menu */}
              <nav className="space-y-1">
                <Link href="/account/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-foreground text-background transition-colors">
                  <User size={16} /> Хувийн мэдээлэл
                </Link>
                <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <ShoppingBag size={16} /> Захиалгын түүх
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Shield size={16} /> Админ самбар
                  </Link>
                )}
                <button 
                  onClick={() => { logout(); router.push("/login"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <LogOut size={16} /> Гарах
                </button>
              </nav>
            </aside>

            {/* ── БАРУУН АГУУЛГА (Main Content) ── */}
            <div className="flex-1 space-y-6">
              
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <h1 className="text-xl font-bold mb-1">Профайл тохиргоо</h1>
                <p className="text-sm text-muted-foreground mb-6">Өөрийн хувийн мэдээлэл болон нууц үгээ эндээс удирдах боломжтой.</p>
                
                {/* Амжилттай эсвэл алдаатай бол зурвас харуулна */}
                {msg.text && (
                  <Alert
                    variant={msg.type === "ok" ? "default" : "destructive"}
                    aria-live={msg.type === "err" ? "assertive" : "polite"}
                    className={`mb-6 ${msg.type === "ok" ? "border-green-200 bg-green-50/50 text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400" : ""}`}
                  >
                    {msg.type === "ok" ? <CheckCircle2 className={`h-4 w-4 ${msg.type === "ok" ? "stroke-green-600 dark:stroke-green-400" : ""}`} /> : <AlertCircle className="h-4 w-4" />}
                    <AlertDescription>{msg.text}</AlertDescription>
                  </Alert>
                )}

                {/* Ерөнхий мэдээлэл засах форм */}
                <form onSubmit={saveProfile} className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 className="font-semibold text-sm">Ерөнхий мэдээлэл</h2>
                    {!isEditing && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        Өөрчлөх
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Нэр</Label>
                      <Input id="firstName" value={form.firstName} onChange={update("firstName")} disabled={!isEditing} className={`rounded-xl ${!isEditing ? 'opacity-70 bg-muted/50 cursor-not-allowed' : ''}`} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Овог</Label>
                      <Input id="lastName" value={form.lastName} onChange={update("lastName")} disabled={!isEditing} className={`rounded-xl ${!isEditing ? 'opacity-70 bg-muted/50 cursor-not-allowed' : ''}`} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Утасны дугаар</Label>
                      <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} disabled={!isEditing} className={`rounded-xl ${!isEditing ? 'opacity-70 bg-muted/50 cursor-not-allowed' : ''}`} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Имэйл хаяг</Label>
                      <Input id="email" value={form.email} disabled className="rounded-xl opacity-60 cursor-not-allowed bg-muted" />
                      <p className="text-xs text-muted-foreground mt-1">Таны имэйл хаяг баталгаажсан тул солих боломжгүй байна.</p>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex justify-end pt-2 gap-3">
                      <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setForm({ firstName: user.first_name ?? "", lastName: user.last_name ?? "", email: user.email ?? "", phone: user.phone ?? "" }); }} className="rounded-full px-6">
                        Цуцлах
                      </Button>
                      <Button type="submit" disabled={saving} className="rounded-full px-8">
                        {saving ? "Хадгалж байна..." : "Өөрчлөлтийг хадгалах"}
                      </Button>
                    </div>
                  )}
                </form>

                <Separator className="my-10" />

                {/* Нууц үг солих форм */}
                <form onSubmit={changePassword} className="space-y-5">
                  <h2 className="font-semibold text-sm border-b border-border pb-2">Нууц үг шинэчлэх</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 md:col-span-2 max-w-md">
                      <Label htmlFor="current">Одоогийн нууц үг</Label>
                      <Input id="current" type="password" value={passForm.current} onChange={(e) => setPassForm((f) => ({ ...f, current: e.target.value }))} autoComplete="current-password" className="rounded-xl bg-muted/50" />
                    </div>
                    <div className="space-y-2 max-w-md">
                      <Label htmlFor="next">Шинэ нууц үг</Label>
                      <Input id="next" type="password" value={passForm.next} onChange={(e) => setPassForm((f) => ({ ...f, next: e.target.value }))} autoComplete="new-password" className="rounded-xl bg-muted/50" />
                    </div>
                    <div className="space-y-2 max-w-md">
                      <Label htmlFor="confirm">Шинэ нууц үг давтах</Label>
                      <Input id="confirm" type="password" value={passForm.confirm} onChange={(e) => setPassForm((f) => ({ ...f, confirm: e.target.value }))} autoComplete="new-password" className="rounded-xl bg-muted/50" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="outline" disabled={saving} className="rounded-full px-8">
                      {saving ? "Хадгалж байна..." : "Нууц үг солих"}
                    </Button>
                  </div>
                </form>

              </div>
            </div>
          </div>
          
        </div>
      </main>
      <Footer />
    </>
  );
}
