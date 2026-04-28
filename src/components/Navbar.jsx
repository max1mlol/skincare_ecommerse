"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Tag,
  Package,
  Star,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { SearchTrigger } from "@/components/SearchPalette";

// Desktop dropdown дотор харагдах үндсэн ангиллууд.
const SHOP_CATEGORIES = [
  {
    href: "/products?cat=serum",
    label: "Сэрум",
    desc: "Тэжээлт, гэрэлтүүлэгч",
  },
  {
    href: "/products?cat=moisturizer",
    label: "Чийгшүүлэгч",
    desc: "Өдөр, шөнийн крем",
  },
  {
    href: "/products?cat=cleanser",
    label: "Цэвэрлэгч",
    desc: "Гель, фоам, тос",
  },
  {
    href: "/products?cat=toner",
    label: "Тоник & Эссенс",
    desc: "Чийглэлт, гэрэлтүүлэгч",
  },
  { href: "/products?cat=mask", label: "Маск", desc: "Шавар, sheet, sleeping" },
  {
    href: "/products?cat=suncare",
    label: "Нарнаас хамгаалах",
    desc: "SPF50+, PA++++",
  },
];

// Брэндээр шууд шүүх богино холбоосууд.
const BRANDS = [
  { href: "/products?brand=COSRX", label: "COSRX", origin: "Солонгос" },
  { href: "/products?brand=LANEIGE", label: "LANEIGE", origin: "Солонгос" },
  { href: "/products?brand=CeraVe", label: "CeraVe", origin: "АНУ" },
  { href: "/products?brand=Glow+Recipe", label: "Glow Recipe", origin: "АНУ" },
  { href: "/products?brand=ANESSA", label: "ANESSA", origin: "Япон" },
  { href: "/products?brand=TATCHA", label: "TATCHA", origin: "Япон" },
  {
    href: "/products?brand=La+Roche-Posay",
    label: "La Roche-Posay",
    origin: "Франц",
  },
  {
    href: "/products?brand=The+Ordinary",
    label: "The Ordinary",
    origin: "Канад",
  },
  {
    href: "/products?brand=Drunk+Elephant",
    label: "Drunk Elephant",
    origin: "АНУ",
  },
  { href: "/products?brand=Kiehl%27s", label: "Kiehl's", origin: "АНУ" },
  { href: "/products?brand=innisfree", label: "innisfree", origin: "Солонгос" },
  {
    href: "/products?brand=Some+By+Mi",
    label: "Some By Mi",
    origin: "Солонгос",
  },
];

// Гар утасны drawer-д илүү цомхон навигац ашиглана.
const MOBILE_LINKS = [
  { href: "/products", label: "Бүх бүтээгдэхүүн" },
  { href: "/products?cat=serum", label: "Сэрум" },
  { href: "/products?cat=toner", label: "Тоник & Эссенс" },
  { href: "/products?cat=moisturizer", label: "Чийгшүүлэгч" },
  { href: "/products?cat=mask", label: "Маск" },
  { href: "/products?cat=suncare", label: "Нарнаас хамгаалах" },
  { href: "/products?sale=1", label: "🏷 Хямдрал" },
  { href: "/about", label: "Бидний тухай" },
  { href: "/about#branches", label: "Салбар дэлгүүрүүд" },
];

// Navbar нь navigation, search, cart, auth урсгалуудыг нэг дор удирдана.
export default function Navbar() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll хийхэд header-д багахан сүүдэр өгч ялгарал нэмнэ.
  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 8);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Mobile menu нээгдэх үед арын хуудсыг scroll-оос түгжиж өгнө.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Sticky Header ── */}
      <header
        className={`sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur transition-shadow ${scrolled ? "shadow-sm border-border/60" : "border-border/30"}`}
      >
        <div className="max-w-7xl mx-auto flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="AURA SKIN">
            <span className="font-bold text-sm tracking-tight text-foreground">
              AURA SKIN
            </span>
          </Link>

          {/* Desktop NavigationMenu */}
          <div className="hidden md:flex items-center">
            <NavigationMenu viewport={true}>
              <NavigationMenuList className="gap-0">
                {/* Shop dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-3 text-sm text-foreground/70 hover:text-foreground bg-transparent hover:bg-transparent data-popup-open:bg-transparent data-open:bg-transparent">
                    Бүтээгдэхүүн
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[520px] p-4">
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <Package size={13} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                          Ангилал
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {SHOP_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.href}
                            href={cat.href}
                            className="flex flex-col gap-0.5 rounded-xl p-3 hover:bg-muted transition-colors group"
                          >
                            <span className="text-sm font-medium text-foreground group-hover:underline underline-offset-2">
                              {cat.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {cat.desc}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center gap-3">
                        <Link
                          href="/products"
                          className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
                        >
                          <Sparkles size={12} />
                          Бүх бараа харах
                        </Link>
                        <Link
                          href="/products?sale=1"
                          className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline"
                        >
                          <Tag size={12} />
                          Хямдрал
                        </Link>
                        <Link
                          href="/products?sort=rating"
                          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:underline ml-auto"
                        >
                          <Star size={12} />
                          Шилдэг
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Brands dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-3 text-sm text-foreground/70 hover:text-foreground bg-transparent hover:bg-transparent data-popup-open:bg-transparent data-open:bg-transparent">
                    Брэнд
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[420px] p-4">
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <Sparkles size={13} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                          Брэндүүд
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {BRANDS.map((b) => (
                          <Link
                            key={b.href}
                            href={b.href}
                            className="flex flex-col gap-0.5 rounded-xl px-3 py-2.5 hover:bg-muted transition-colors group"
                          >
                            <span className="text-sm font-medium text-foreground leading-tight">
                              {b.label}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {b.origin}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Хямдрал - plain link */}
                <NavigationMenuItem>
                  <Link
                    href="/products?sale=1"
                    className="inline-flex h-9 items-center px-3 text-sm text-red-600 hover:text-red-700 font-medium transition-colors rounded-lg hover:bg-muted"
                  >
                    Хямдрал
                  </Link>
                </NavigationMenuItem>

                {/* About - plain link */}
                <NavigationMenuItem>
                  <Link
                    href="/about"
                    className="inline-flex h-9 items-center px-3 text-sm text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                  >
                    Бидний тухай
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Search — flex-1 */}
          <div className="flex-1">
            <SearchTrigger />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative h-8 w-8"
            >
              <Link href="/cart" aria-label="Сагс">
                <ShoppingBag className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-foreground text-[9px] font-medium text-background">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>

            <Separator
              orientation="vertical"
              className="mx-0.5 h-4 hidden sm:block"
            />

            {/* Auth */}
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 px-3 text-sm text-foreground/70"
              >
                <Link href="/login">Нэвтрэх</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="h-8 px-3 text-sm rounded-full"
              >
                <Link href="/register">Бүртгүүлэх</Link>
              </Button>
            </div>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileOpen(true)}
              aria-label="Цэс нээх"
              id="mobile-menu-toggle"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Мобайл цэс"
        className={`fixed top-0 right-0 h-full w-72 z-60 bg-background shadow-xl flex flex-col transition-transform duration-300 ease-out border-l border-border md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0">
          <span className="font-bold text-sm tracking-tight">AURA SKIN</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex flex-col px-3 py-4 gap-0.5 flex-1 overflow-y-auto">
          {MOBILE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center rounded-lg px-3 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 pb-6 flex flex-col gap-2 border-t border-border pt-4 shrink-0">
          <Button variant="outline" asChild className="w-full h-9 rounded-full">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              Нэвтрэх
            </Link>
          </Button>
          <Button asChild className="w-full h-9 rounded-full">
            <Link href="/register" onClick={() => setMobileOpen(false)}>
              Бүртгүүлэх
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
