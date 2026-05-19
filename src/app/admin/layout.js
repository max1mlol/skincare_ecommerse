// admin/layout.js — Удирдлагын хэсгийн ерөнхий бүтэц (Layout).
// Админ эрхтэй хэрэглэгчдийг шалгаж, хажуугийн цэс (Sidebar)-ийг харуулж, хуудас хооронд шилжих боломжийг олгоно.
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext"; // Session контекстоос хэрэглэгчийн мэдээлэл болон гарах функцийг авна
import { useState, useEffect } from "react";
import { LayoutDashboard, Package, ShoppingCart, Star, Users, Settings, LogOut, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Sidebar-д харуулах үндсэн цэсүүд
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const NAV = [
  { href: "/admin",          label: "Самбар",        icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Бүтээгдэхүүн", icon: Package },
  { href: "/admin/orders",   label: "Захиалгууд",    icon: ShoppingCart },
  { href: "/admin/reviews",  label: "Сэтгэгдэл",     icon: Star },
  { href: "/admin/users",    label: "Хэрэглэгчид",   icon: Users },
  { href: "/admin/settings", label: "Тохиргоо",      icon: Settings },
];

export default function AdminLayout({ children }) {
  // badgeCounts: Захиалга болон Сэтгэгдлийн тоог динамикоор уншиж цэсний хажууд харуулах стэйт
  const [badgeCounts, setBadgeCounts] = useState({ orders: null, reviews: null });
  const { user, loading, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Хэрэглэгчийн эрх шалгах: Хэрэв нэвтрээгүй эсвэл админ биш бол шууд нэвтрэх хуудас руу шилжүүлнэ
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // 2. Хүлээгдэж буй захиалга болон уншаагүй сэтгэгдлийн тоог авах
  useEffect(() => {
    if (user && user.role === "admin") {
      Promise.all([
        fetch("/api/orders/count", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/reviews/count", { credentials: "include" }).then((r) => r.json()),
      ])
        .then(([ordersData, reviewsData]) => {
          const pendingOrders = ordersData.count || 0;
          const totalReviews = reviewsData.count || 0;
          
          setBadgeCounts({
            orders: pendingOrders > 0 ? String(pendingOrders) : null,
            reviews: totalReviews > 0 ? String(totalReviews) : null,
          });
        })
        .catch(console.error);
    }
  }, [user]);

  // Хэрэв ачаалж байгаа эсвэл админ биш бол юу ч харуулахгүй
  if (loading || !user || user.role !== "admin") return null;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        
        {/* Толгой хэсэг: Дэлгүүрийн нэр болон Admin Badge */}
        <SidebarHeader className="h-14 flex flex-row items-center justify-between px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:justify-center">
            <SidebarTrigger className="shrink-0" />
            <Link href="/" className="font-bold text-sm tracking-tight text-foreground truncate group-data-[collapsible=icon]:hidden">
              AURA SKIN
            </Link>
          </div>
          <Badge variant="secondary" className="text-[10px] rounded-full group-data-[collapsible=icon]:hidden">Admin</Badge>
        </SidebarHeader>

        {/* Үндсэн цэсүүдийн жагсаалт */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  let dynamicBadge = item.badge;
                  if (item.href === "/admin/orders" && badgeCounts.orders) dynamicBadge = badgeCounts.orders;
                  if (item.href === "/admin/reviews" && badgeCounts.reviews) dynamicBadge = badgeCounts.reviews;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link href={item.href} className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <item.icon size={16} />
                            <span>{item.label}</span>
                          </div>
                          {dynamicBadge && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 rounded-full">
                              {dynamicBadge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Доод хэсэг: Гарах болон Дэлгүүр харах товч */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/">
                  <ChevronRight size={16} />
                  <span>Дэлгүүр харах</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => { logout(); router.push("/login"); }} className="text-destructive hover:text-destructive">
                <LogOut size={16} />
                <span>Гарах</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Гол контент харуулах хэсэг */}
      <main className="flex-1 min-w-0 bg-muted/20 relative flex flex-col h-screen overflow-hidden">
        <header className="h-14 flex items-center px-4 bg-background/80 backdrop-blur border-b border-border z-40 sticky top-0 md:hidden">
          <SidebarTrigger />
        </header>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
