"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  Package,
  ShoppingBag,
  Star,
  User,
  Settings,
  MapPin,
  Info,
  Search,
  Tag,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";
import { PRODUCTS, BRANDS } from "@/lib/products";

// Хайлт хоосон үед харуулах хурдан холбоосууд.
const QUICK_LINKS = [
  { id: "home", label: "Нүүр хуудас", icon: Home, href: "/" },
  {
    id: "products",
    label: "Бүх бүтээгдэхүүн",
    icon: Package,
    href: "/products",
  },
  { id: "cart", label: "Миний сагс", icon: ShoppingBag, href: "/cart" },
  { id: "reviews", label: "Сэтгэгдэл", icon: Star, href: "/reviews" },
  {
    id: "branches",
    label: "Салбар дэлгүүрүүд",
    icon: MapPin,
    href: "/about#branches",
  },
  { id: "about", label: "Бидний тухай", icon: Info, href: "/about" },
  { id: "login", label: "Нэвтрэх", icon: User, href: "/login" },
  { id: "admin", label: "Удирдлагын самбар", icon: Settings, href: "/admin" },
];

const CATEGORIES = [
  { id: "serum", label: "Сэрум", href: "/products?cat=serum" },
  {
    id: "moisturizer",
    label: "Чийгшүүлэгч",
    href: "/products?cat=moisturizer",
  },
  { id: "cleanser", label: "Цэвэрлэгч", href: "/products?cat=cleanser" },
  { id: "toner", label: "Тоник & Эссенс", href: "/products?cat=toner" },
  { id: "mask", label: "Маск", href: "/products?cat=mask" },
  { id: "suncare", label: "Нарнаас хамгаалах", href: "/products?cat=suncare" },
];

// Command palette нь keyboard shortcut, барааны хайлт, хурдан navigation-ийг нэгтгэнэ.
export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // "/" дарахад хайлтыг нээж, custom event-ээр navbar trigger-ээс мөн ажиллуулна.
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const handleCustom = () => setOpen(true);

    document.addEventListener("keydown", handleKey);
    document.addEventListener("open-search", handleCustom);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("open-search", handleCustom);
    };
  }, []);

  const go = useCallback(
    (href) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const q = query.trim().toLowerCase();

  const matchedProducts = q
    ? PRODUCTS.filter(
        (p) =>
          p.nameMn.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.categoryMn ?? "").toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      ).slice(0, 6)
    : PRODUCTS.slice(0, 5);

  const matchedBrands = q
    ? BRANDS.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.origin.toLowerCase().includes(q),
      )
    : BRANDS;

  const matchedCategories = q
    ? CATEGORIES.filter((c) => c.label.toLowerCase().includes(q))
    : CATEGORIES;

  const matchedLinks = q
    ? QUICK_LINKS.filter((l) => l.label.toLowerCase().includes(q))
    : QUICK_LINKS;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Бараа, брэнд, ангилал, хуудас хайх..."
        value={query}
        onValueChange={setQuery}
        className="text-base h-12"
      />
      <CommandList className="max-h-[70vh]">
        <CommandEmpty>
          <div className="flex flex-col items-center py-8 text-center">
            <Search
              size={32}
              className="text-muted-foreground mb-3 opacity-30"
            />
            <p className="text-sm font-medium text-foreground">
              Илэрц олдсонгүй
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              &ldquo;{query}&rdquo; хайлтад тохирох зүйл олдсонгүй
            </p>
          </div>
        </CommandEmpty>

        {/* ── Products ── */}
        <CommandGroup heading="🛍 Бүтээгдэхүүн">
          {matchedProducts.map((p) => (
            <CommandItem
              key={p.id}
              value={`product-${p.id}-${p.nameMn}-${p.name}-${p.brand}-${p.category}`}
              onSelect={() => go(`/products/${p.slug}`)}
              className="flex items-center gap-3 py-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.nameMn}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  {p.brand}
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  {p.nameMn}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.categoryMn} · ⭐ {p.rating} ({p.reviews.toLocaleString()})
                </p>
              </div>
              <span className="text-xs font-bold text-foreground shrink-0">
                {p.price.toLocaleString("mn-MN")}₮
              </span>
            </CommandItem>
          ))}
          {q && matchedProducts.length > 0 && (
            <CommandItem
              value="search-all-products"
              onSelect={() => go(`/products?q=${encodeURIComponent(query)}`)}
              className="cursor-pointer text-muted-foreground italic text-sm"
            >
              <Tag size={14} className="mr-2 shrink-0" />
              &ldquo;{query}&rdquo; — бүх бараа харах
              <ArrowRight size={13} className="ml-auto" />
            </CommandItem>
          )}
        </CommandGroup>

        {/* ── Brands ── */}
        {matchedBrands.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="✨ Брэнд">
              {matchedBrands.map((b) => (
                <CommandItem
                  key={b.name}
                  value={`brand-${b.name}-${b.origin}`}
                  onSelect={() => go(b.href)}
                  className="cursor-pointer"
                >
                  <Sparkles
                    size={14}
                    className="mr-2 text-muted-foreground shrink-0"
                  />
                  <span className="font-medium">{b.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {b.origin}
                  </span>
                  <ArrowRight
                    size={12}
                    className="ml-auto text-muted-foreground"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* ── Categories ── */}
        {matchedCategories.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="📂 Ангилал">
              {matchedCategories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={`cat-${cat.id}-${cat.label}`}
                  onSelect={() => go(cat.href)}
                  className="cursor-pointer"
                >
                  <Layers size={14} className="mr-2 text-muted-foreground" />
                  {cat.label}
                  <ArrowRight
                    size={12}
                    className="ml-auto text-muted-foreground"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* ── Navigation ── */}
        {matchedLinks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="🗺 Хуудсууд">
              {matchedLinks.map(({ id, label, icon: Icon, href }) => (
                <CommandItem
                  key={id}
                  value={`page-${id}-${label}`}
                  onSelect={() => go(href)}
                  className="cursor-pointer"
                >
                  <Icon size={14} className="mr-2 text-muted-foreground" />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      {/* Keyboard hints */}
      <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[11px] text-muted-foreground select-none">
        <span className="flex items-center gap-1.5">
          <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">
            ↑↓
          </kbd>
          навигаци
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">
            ↵
          </kbd>
          нээх
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">
            esc
          </kbd>
          хаах
        </span>
        <span className="ml-auto flex items-center gap-1">
          <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">
            /
          </kbd>
        </span>
      </div>
    </CommandDialog>
  );
}

// Navbar дээр input шиг харагдах боловч palette нээдэг trigger товч.
export function SearchTrigger() {
  function open() {
    document.dispatchEvent(new CustomEvent("open-search"));
  }
  return (
    <button
      id="search-palette-trigger"
      onClick={open}
      className="flex items-center gap-2.5 h-9 w-full max-w-md rounded-lg border border-border bg-muted/40 px-4 text-sm text-muted-foreground hover:bg-muted hover:border-foreground/20 transition-all"
      aria-label="Хайлт нээх (⌘K)"
    >
      <Search size={14} className="shrink-0" />
      <span className="flex-1 text-left">Бараа, брэнд хайх...</span>
      <kbd className="hidden sm:inline-flex h-5 shrink-0 items-center rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
        /
      </kbd>
    </button>
  );
}
