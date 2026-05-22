"use client";
// Navbar: Вэбсайтын толгой хэсэг (Header).
// Энд лого, ангилал бүхий цэс, брэндүүдийн шүүлтүүр, хайлт, сагсны тоолуур, гэрэлт/харанхуй горим солигч болон хэрэглэгчийн профайл цэс агуулагдана.
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Sparkles, Tag, Package, Star, LogOut, Settings, ClipboardList, ShieldCheck, ChevronDown } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart }    from "@/context/CartContext";
import { useSession } from "@/context/SessionContext";
import { SearchTrigger } from "@/components/SearchPalette";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getAvatarUrl } from "@/lib/utils";

// Вэбсайтын үндсэн бүтээгдэхүүний ангилалууд
const CATEGORIES = [
  { href: "/products?cat=serum",       label: "Сэрум",             desc: "Тэжээлт, гэрэлтүүлэгч" },
  { href: "/products?cat=moisturizer", label: "Чийгшүүлэгч",      desc: "Өдөр, шөнийн крем" },
  { href: "/products?cat=cleanser",    label: "Цэвэрлэгч",        desc: "Гель, фоам, тос" },
  { href: "/products?cat=toner",       label: "Тоник & Эссенс",   desc: "Чийглэлт, гэрэлтүүлэгч" },
  { href: "/products?cat=mask",        label: "Маск",              desc: "Шавар, sheet, sleeping" },
  { href: "/products?cat=suncare",     label: "Нарнаас хамгаалах", desc: "SPF50+, PA++++" },
];

// Вэбсайтад борлуулагддаг онцлох брэндүүд
const BRANDS = [
  { href: "/products?brand=COSRX",          label: "COSRX",          origin: "Солонгос" },
  { href: "/products?brand=LANEIGE",        label: "LANEIGE",        origin: "Солонгос" },
  { href: "/products?brand=CeraVe",         label: "CeraVe",         origin: "АНУ" },
  { href: "/products?brand=Glow+Recipe",    label: "Glow Recipe",    origin: "АНУ" },
  { href: "/products?brand=ANESSA",         label: "ANESSA",         origin: "Япон" },
  { href: "/products?brand=La+Roche-Posay", label: "La Roche-Posay", origin: "Франц" },
  { href: "/products?brand=The+Ordinary",   label: "The Ordinary",   origin: "Канад" },
  { href: "/products?brand=innisfree",      label: "innisfree",      origin: "Солонгос" },
];

// getInitials: Хэрэглэгчийн нэрийн эхний үсгүүдийг авахад ашиглана (Жишээ нь: "Батаа Болд" -> "BB")
function getInitials(name = "") {
  return name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "U";
}

// AvatarCircle: Хэрэглэгчийн аватар зураг байвал харуулж, байхгүй бол нэрнийх нь эхний үсгүүдийг харуулна
function AvatarCircle({ user, size = 32 }) {
  const initials = getInitials(user?.name);
  return (
    <Avatar style={{ width: size, height: size }}>
      <AvatarImage src={getAvatarUrl(user?.avatar_url)} alt={user?.name ?? "Avatar"} className="object-cover" />
      <AvatarFallback className="bg-foreground text-background font-semibold" style={{ fontSize: size * 0.35 }}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

// ProfileDropdown: Профайл цэсний dropdown
function ProfileDropdown() {
  const { user, loading, logout } = useSession();

  // Session ачаалж байх үед Skeleton харагдана
  if (loading) return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;

  // Нэвтрээгүй хэрэглэгчид харагдах нэвтрэх, бүртгүүлэх товчлуурууд
  if (!user) return (
    <div className="hidden sm:flex items-center gap-1">
      <Button variant="ghost" size="sm" asChild className="h-8 px-3 text-sm text-foreground/70">
        <Link href="/login">Нэвтрэх</Link>
      </Button>
      <Button size="sm" asChild className="h-8 px-3 text-sm rounded-full">
        <Link href="/register">Бүртгүүлэх</Link>
      </Button>
    </div>
  );

  return (
    <div className="hidden sm:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring outline-none"
            aria-label="Профайл цэс"
          >
            <AvatarCircle user={user} size={30} />
            <span className="text-xs font-medium max-w-[80px] truncate hidden md:block">
              {user.name?.split(" ")[0] ?? user.email}
            </span>
            <ChevronDown size={12} className="text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl z-50">
          <div className="flex items-center gap-3 px-4 py-3">
            <AvatarCircle user={user} size={36} />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              {user.role === "admin" && (
                <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded-full">
                  <ShieldCheck size={9} /> Admin
                </span>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          {user.role !== "admin" ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/account/profile" className="flex items-center gap-2.5 cursor-pointer">
                  <Settings size={14} className="text-muted-foreground" /> Профайл тохиргоо
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account/orders" className="flex items-center gap-2.5 cursor-pointer">
                  <ClipboardList size={14} className="text-muted-foreground" /> Миний захиалга
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-2.5 cursor-pointer">
                <ShieldCheck size={14} className="text-muted-foreground" /> Admin самбар
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => logout()} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer">
            <div className="flex items-center gap-2.5 w-full">
              <LogOut size={14} /> Гарах
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function Navbar() {
  const { totalItems }              = useCart();
  const { user, loading, logout }   = useSession();
  const [scrolled, setScrolled]     = useState(false); // Дэлгэц доош гүйлгэсэн эсэхийг тодорхойлно (Сүүдэр харуулах)
  const [mobileOpen, setMobileOpen] = useState(false); // Гар утасны хажуугийн цэс нээлттэй эсэх

  useEffect(() => {
    // Хэрэглэгч хуудсыг доош гүйлгэхэд Navbar-т сүүдэр болон хүрээ нэмэх логик
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header className={`sticky top-0 z-50 w-full border-b bg-background/98 backdrop-blur transition-shadow ${scrolled ? "shadow-sm border-border/60" : "border-border/30"}`}>
        <div className="max-w-7xl mx-auto flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0 font-bold text-sm tracking-tight" aria-label="AURA SKIN">
            AURA SKIN
          </Link>

          {/* Desktop цэс */}
          <div className="hidden md:flex items-center">
            <NavigationMenu viewport={true}>
              <NavigationMenuList className="gap-0">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-3 text-sm text-foreground/70 hover:text-foreground bg-transparent hover:bg-transparent">
                    Бүтээгдэхүүн
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[520px] p-4">
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <Package size={13} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ангилал</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {CATEGORIES.map((c) => (
                          <Link key={c.href} href={c.href} className="flex flex-col gap-0.5 rounded-xl p-3 hover:bg-muted transition-colors group">
                            <span className="text-sm font-medium group-hover:underline underline-offset-2">{c.label}</span>
                            <span className="text-xs text-muted-foreground">{c.desc}</span>
                          </Link>
                        ))}
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center gap-4">
                        <Link href="/products" className="flex items-center gap-1.5 text-xs font-medium hover:underline"><Sparkles size={12} />Бүх бараа</Link>
                        <Link href="/products?sale=1" className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline"><Tag size={12} />Хямдрал</Link>
                        <Link href="/products?sort=rating" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:underline ml-auto"><Star size={12} />Шилдэг</Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-3 text-sm text-foreground/70 hover:text-foreground bg-transparent hover:bg-transparent">
                    Брэнд
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[360px] p-4">
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <Sparkles size={13} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Брэндүүд</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {BRANDS.map((b) => (
                          <Link key={b.href} href={b.href} className="flex flex-col gap-0.5 rounded-xl px-3 py-2.5 hover:bg-muted transition-colors group">
                            <span className="text-sm font-medium">{b.label}</span>
                            <span className="text-[11px] text-muted-foreground">{b.origin}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/products?sale=1" className="inline-flex h-9 items-center px-3 text-sm text-red-600 hover:text-red-700 font-medium rounded-lg hover:bg-muted transition-colors">
                    Хямдрал
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/about" className="inline-flex h-9 items-center px-3 text-sm text-foreground/70 hover:text-foreground rounded-lg hover:bg-muted transition-colors">
                    Бидний тухай
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Глобал хайлтын талбарыг дуудах товчлуур */}
          <div className="flex-1"><SearchTrigger /></div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Сагс */}
            <Button variant="ghost" size="icon" asChild className="relative h-8 w-8">
              <Link href="/cart" aria-label="Сагс">
                <ShoppingBag className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-foreground text-[9px] font-medium text-background">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
            <ThemeToggle />
            <div className="w-px h-4 bg-border hidden sm:block mx-1"></div>
            {/* Хэрэглэгчийн цэсний dropdown */}
            <ProfileDropdown />

            {/* Гар утасны цэс */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" aria-label="Цэс нээх">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0 flex flex-col">
                <SheetHeader className="px-5 py-4 border-b text-left">
                  <SheetTitle className="text-sm font-bold tracking-tight">AURA SKIN</SheetTitle>
                </SheetHeader>

                {/* Гар утсан дээр нэвтэрсэн хэрэглэгчийн товч мэдээллийг харуулах */}
                {user && (
                  <div className="flex items-center gap-3 px-5 py-4 border-b bg-muted/30">
                    <AvatarCircle user={user} size={38} />
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Гар утасны цэсний холбоосууд */}
                <nav className="flex flex-col px-3 py-4 gap-0.5 flex-1 overflow-y-auto">
                  {[
                    { href: "/products",              label: "Бүх бүтээгдэхүүн" },
                    { href: "/products?cat=serum",    label: "Сэрум" },
                    { href: "/products?cat=toner",    label: "Тоник & Эссенс" },
                    { href: "/products?sale=1",       label: "🏷 Хямдрал" },
                    { href: "/about",                 label: "Бидний тухай" },
                  ].map((l) => (
                    <Link key={l.href} href={l.href} onClick={closeMenu}
                      className="flex items-center rounded-lg px-3 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors">
                      {l.label}
                    </Link>
                  ))}
                  {user && (
                    <>
                      <Separator className="my-2" />
                      {user.role !== "admin" ? (
                        <>
                          <Link href="/account/profile" onClick={closeMenu} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted transition-colors">
                            <Settings size={14} className="text-muted-foreground" /> Профайл тохиргоо
                          </Link>
                          <Link href="/account/orders" onClick={closeMenu} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted transition-colors">
                            <ClipboardList size={14} className="text-muted-foreground" /> Миний захиалга
                          </Link>
                        </>
                      ) : (
                        <Link href="/admin" onClick={closeMenu} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted transition-colors">
                          <ShieldCheck size={14} className="text-muted-foreground" /> Admin самбар
                        </Link>
                      )}
                    </>
                  )}
                </nav>

                {/* Гар утасны доод хэсэгт нэвтрэх эсвэл гарах товчийг харуулах */}
                <div className="px-4 pb-6 pt-4 flex flex-col gap-2 border-t shrink-0">
                  {user ? (
                    <Button variant="outline" className="w-full h-9 rounded-full text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => { logout(); closeMenu(); }}>
                      <LogOut size={14} className="mr-2" /> Гарах
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full h-9 rounded-full">
                        <Link href="/login" onClick={closeMenu}>Нэвтрэх</Link>
                      </Button>
                      <Button asChild className="w-full h-9 rounded-full">
                        <Link href="/register" onClick={closeMenu}>Бүртгүүлэх</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
