"use client";
// account/orders/page.js: Хэрэглэгчийн өөрийн захиалгын түүхийг харах хуудас.
// Эндээс хэрэглэгч өөрийн хийсэн захиалгуудын статус, үнийн дүн, огноо зэргийг хянах боломжтой.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ChevronRight, User, ShoppingBag, Shield, LogOut, Camera } from "lucide-react";
import { useSession } from "@/context/SessionContext";
import Navbar  from "@/components/Navbar";
import Footer  from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/utils";

// Захиалгын статусаас хамаарч өөр өөр өнгөөр харуулах
const STATUS_COLOR = {
  pending:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
const STATUS_MN = {
  pending:   "Хүлээгдэж буй",
  confirmed: "Баталгаажсан",
  shipped:   "Илгээгдсэн",
  delivered: "Хүргэгдсэн",
  cancelled: "Цуцлагдсан",
};

export default function MyOrdersPage() {
  const { user, loading: authLoading, logout, refetch } = useSession();
  const router   = useRouter();
  const [orders,  setOrders]  = useState([]); // Захиалгуудын жагсаалт
  const [loading, setLoading] = useState(true); // Ачаалалтын төлөв

  useEffect(() => {
    // Хэрэглэгч нэвтрээгүй бол нэвтрэх хуудас руу шилжүүлнэ
    if (!authLoading && !user) { router.replace("/login"); return; }
    // Админ хэрэглэгч байвал админ самбар руу шилжүүлнэ
    if (!authLoading && user && user.role === "admin") { router.replace("/admin"); return; }
    if (!user) return;

    // Тухайн хэрэглэгчийн захиалгуудыг серверээс татах
    fetch("/api/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  // handleAvatarChange: Avatar зургийг сонгоход FormData үүсгэж сервер лүү илгээх функц
  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData(); fd.append("avatar", file);
    const res = await fetch(`/api/users/${user?.id}/avatar`, {
      method: "POST", credentials: "include", body: fd,
    });
    if (res.ok) { await refetch(); } // Зураг амжилттай солигдвол session-ийг шинэчилнэ
  }

  if (authLoading || !user) return null;

  // Хэрэглэгчийн нэрний эхний үсгүүдийг avatar-т харуулах зорилгоор бэлдэх
  const initials = user.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "U";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted/10 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row gap-10">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 shrink-0 space-y-6">
              {/* Хэрэглэгчийн товч мэдээлэл */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
                <div className="relative">
                  <Avatar className="w-12 h-12 border border-border">
                    <AvatarImage src={getImageUrl(user.avatar_url)} alt={user.name} className="object-cover" />
                    <AvatarFallback className="bg-foreground text-background font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                    <Camera size={10} />
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              {/* Цэсүүд */}
              <nav className="space-y-1">
                <Link href="/account/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <User size={16} /> Хувийн мэдээлэл
                </Link>
                <Link href="/account/orders" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-foreground text-background transition-colors">
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

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm min-h-[400px]">
                <h1 className="text-xl font-bold mb-1">Миний захиалга</h1>
                <p className="text-sm text-muted-foreground mb-6">Таны хийсэн бүх захиалгын түүх.</p>
                
                {loading ? (
                  // Ачаалж буй үеийн skeleton-г харуулах
                  <div className="space-y-3 mt-8">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-xl" />)}
                  </div>
                ) : orders.length === 0 ? (
                  // Захиалга байхгүй үеийн зураглал
                  <div className="text-center py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <Package size={32} className="text-muted-foreground opacity-50" />
                    </div>
                    <p className="text-muted-foreground mb-4 text-sm">Захиалга байхгүй байна</p>
                    <Link href="/products" className="text-sm font-medium bg-foreground text-background px-6 py-2 rounded-full hover:opacity-90 transition-opacity">
                      Дэлгүүр үзэх
                    </Link>
                  </div>
                ) : (
                  // Захиалгын жагсаалт
                  <div className="space-y-3">
                    {orders.map((o) => {
                      const itemCount = Array.isArray(o.items) ? o.items.length : 0;
                      return (
                        <div key={o.id} className="bg-background border border-border rounded-xl p-4 flex items-center gap-4 hover:border-foreground/30 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-mono text-sm font-semibold">{o.order_number}</span>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[o.status] ?? ""}`}>
                                {STATUS_MN[o.status] ?? o.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{itemCount} бараа</span>
                              <span>·</span>
                              <span className="font-medium text-foreground">{o.total.toLocaleString("mn-MN")}₮</span>
                              <span>·</span>
                              <span>{new Date(o.created_at).toLocaleDateString("mn-MN")}</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          </div>
          
        </div>
      </main>
      <Footer />
    </>
  );
}
