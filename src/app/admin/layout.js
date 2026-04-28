"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Admin sidebar дээр харагдах үндсэн navigation.
const NAV = [
  { href: "/admin", label: "Самбар", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Бүтээгдэхүүн", icon: Package },
  {
    href: "/admin/orders",
    label: "Захиалгууд",
    icon: ShoppingCart,
    badge: "12",
  },
  { href: "/admin/reviews", label: "Сэтгэгдэл", icon: Star, badge: "3" },
  { href: "/admin/users", label: "Хэрэглэгчид", icon: Users },
  { href: "/admin/settings", label: "Тохиргоо", icon: Settings },
];

function NavItem({ item, onClick }) {
  const pathname = usePathname();
  const active = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-foreground text-background font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <Icon size={16} />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <Badge
          variant={active ? "secondary" : "secondary"}
          className="text-[10px] h-4 px-1.5 rounded-full"
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 z-50 bg-background border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <Link
            href="/"
            className="font-bold text-sm tracking-tight text-foreground"
          >
            AURA SKIN
          </Link>
          <Badge variant="secondary" className="text-[10px] rounded-full">
            Admin
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-7 w-7"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={14} />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-border pt-4 space-y-1">
          <Separator className="mb-3" />
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronRight size={16} />
            Дэлгүүр харах
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-muted transition-colors">
            <LogOut size={16} />
            Гарах
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-background/95 backdrop-blur border-b border-border flex items-center px-4 gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setSidebarOpen(true)}
            aria-label="Цэс нээх"
          >
            <Menu size={16} />
          </Button>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">Администратор</span>
          <div className="w-7 h-7 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-semibold">
            A
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
