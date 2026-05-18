// Энэ файлын үүрэг:
//   Бүтээгдэхүүн, брэнд, ангилал, хуудас хайх Command Palette цонх.
//   "/" товч дарахад нээгдэнэ. Хоёр компонент export хийнэ:
//     1. SearchPalette — хайлтын үндсэн цонх (layout.js дотор нэг удаа байна)
//     2. SearchTrigger — Navbar дахь хайлтын "input шиг" харагдах товч

"use client";

// useEffect:   дэлгэцэнд гарсны дараа keyboard listener нэмнэ
// useState:    хайлтын текст болон цонхны нээлттэй/хаалттай төлөвийг хадгална
// useCallback: функцийг цээжилж (memoize) шаардлагагүй дахин үүсгэхгүй байна
import { useEffect, useState, useCallback } from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

// shadcn/ui Command компонентууд:
// CommandDialog    — нэвчилтэнд нэвтрэх харилцах цонх (modal)
// CommandEmpty     — хайлтын илэрц байхгүй үед харуулах агуулга
// CommandGroup     — хайлтын бүлэглэл (гарчигтай)
// CommandInput     — хайлтын текст оруулах талбар
// CommandItem      — нэг хайлтын сонголт
// CommandList      — бүх сонголтуудыг агуулсан жагсаалт
// CommandSeparator — бүлэглэлүүдийн хоорондох зааглагч шугам
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";

// Хайлтын палетт дотор ашиглах icon-ууд
import {
  Home, Package, ShoppingBag, Star, User, Settings,
  MapPin, Info, Search, Tag, Layers, Sparkles,
} from "lucide-react";

// PRODUCTS: бүх барааны жагсаалт | BRANDS: бүх брэндийн жагсаалт
import { PRODUCTS, BRANDS } from "@/lib/products";

// ХУРДАН ХОЛБООСУУДЫН ЖАГСААЛТ
// Хайлт хоосон байх үед харуулах бэлэн навигацийн холбоосууд.
const QUICK_LINKS = [
  { id: "home",     label: "Нүүр хуудас",      icon: Home,       href: "/" },
  { id: "products", label: "Бүх бүтээгдэхүүн", icon: Package,    href: "/products" },
  { id: "cart",     label: "Миний сагс",        icon: ShoppingBag,href: "/cart" },
  { id: "branches", label: "Салбар дэлгүүрүүд", icon: MapPin,     href: "/about#branches" },
  { id: "about",    label: "Бидний тухай",       icon: Info,       href: "/about" },
];

// АНГИЛЛУУДЫН ЖАГСААЛТ
// Хайлтын ангиллын бүлэгт харагдах бэлэн сонголтууд.
const CATEGORIES = [
  { id: "serum",       label: "Сэрум",             href: "/products?cat=serum" },
  { id: "moisturizer", label: "Чийгшүүлэгч",       href: "/products?cat=moisturizer" },
  { id: "cleanser",    label: "Цэвэрлэгч",          href: "/products?cat=cleanser" },
  { id: "toner",       label: "Тоник & Эссенс",     href: "/products?cat=toner" },
  { id: "mask",        label: "Маск",               href: "/products?cat=mask" },
  { id: "suncare",     label: "Нарнаас хамгаалах",  href: "/products?cat=suncare" },
];

// SearchPalette үндсэн компонент
export function SearchPalette() {
  // open: хайлтын цонх нээлттэй эсэх (true = нээлттэй)
  const [open, setOpen] = useState(false);

  // query: хэрэглэгчийн хайж буй текст
  const [query, setQuery] = useState("");

  // disablePointerSelection: гарын товчоор навигац хийж байх үед
  // хулганы hover-оор санамсаргүй сонголт өөрчлөгдөхгүй байлгана.
  const [disablePointerSelection, setDisablePointerSelection] = useState(false);

  // useRouter: хуудас шилжилт хийхэд ашиглана
  const router = useRouter();

  // KEYBOARD + CUSTOM EVENT LISTENER
  useEffect(() => {
    const handleKey = (e) => {
      // "/" товч дарсан бол хайлтыг нэмэх/хаах.
      // Гэхдээ INPUT эсвэл TEXTAREA дотор бичиж байвал ажиллуулахгүй
      // (хэрэглэгч бичиж байгаа текстэд "/" тэмдэгт орж байрлахгүй байна).
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
        e.preventDefault(); // "/" браузерт анхны утгаараа ажиллахгүй болно
        setDisablePointerSelection(false);
        setOpen((o) => !o); // Нээлттэй бол хаа, хаалттай бол нээ
      }
    };

    // Navbar-ийн SearchTrigger товч дарахад "open-search" гэсэн custom event илгээнэ.
    // Энд тэр eventийг сонсоод цонхыг нээнэ.
    const handleCustom = () => {
      setDisablePointerSelection(false);
      setOpen(true);
    };

    // document: бүх хуудасны keyboard болон custom event-ийг сонсоно.
    document.addEventListener("keydown", handleKey);
    document.addEventListener("open-search", handleCustom);

    // Cleanup: компонент устах үед listener-уудыг устгана (санах ой хадгалахгүй).
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("open-search", handleCustom);
    };
  }, []); // [] → зөвхөн нэг удаа component ачаалагдах үед ажиллана

  // ── ШИЛЖИХ ФУНКЦ ─────────────────────────────────────────────────────────
  // useCallback: go функцийг цээжилнэ — router өөрчлөгдөхгүй бол дахин үүсгэхгүй.
  const go = useCallback(
    (href) => {
      setDisablePointerSelection(false);
      setOpen(false);  // Цонхыг хаана
      setQuery("");    // Хайлтыг цэвэрлэнэ
      router.push(href); // Тухайн хаяг руу шилжинэ
    },
    [router],
  );

  // Цонх нээх/хаахад дуудагдах функц
  const handleOpenChange = useCallback((nextOpen) => {
    if (!nextOpen) setDisablePointerSelection(false);
    setOpen(nextOpen);
  }, []);

  // Гарын сумаар навигац хийх үед хулганы hover-оор сонголт өөрчлөгдөхгүй байлгана
  const handlePaletteKeyDown = useCallback((e) => {
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      setDisablePointerSelection(true);
    }
  }, []);

  // Хулгана хөдлөх үед pointer selection-ийг дахин идэвхжүүлнэ
  const handlePalettePointerMove = useCallback(() => {
    setDisablePointerSelection((isDisabled) => (isDisabled ? false : isDisabled));
  }, []);

  // ── ХАЙЛТЫН ҮР ДҮН ───────────────────────────────────────────────────────
  // q: query-г тайрч (trim), жижиг үсэг болгосон хайлтын үг.
  // Ингэснээр "COSRX" болон "cosrx" хоёул ижил үр дүн өгнө.
  const q = query.trim().toLowerCase();

  // ── Бүтээгдэхүүн хайлт ──
  // q байвал filter хийнэ, байхгүй бол эхний 5-ийг харуулна.
  // .filter(): условие хангасан элементүүдийг шинэ массив болгоно.
  // .slice(0, 6): хамгийн ихдээ 6 үр дүн харуулна (хэтрэхгүй).
  const matchedProducts = q
    ? PRODUCTS.filter(
        (p) =>
          p.nameMn.toLowerCase().includes(q) ||   // Монгол нэр
          p.name.toLowerCase().includes(q) ||      // Англи нэр
          p.brand.toLowerCase().includes(q) ||     // Брэнд
          (p.categoryMn ?? "").toLowerCase().includes(q) || // Ангилал
          p.tags.some((t) => t.toLowerCase().includes(q)),  // Тэгүүд
      ).slice(0, 6)
    : PRODUCTS.slice(0, 5); // Хоосон үед 5 онцлох бараа

  // ── Брэнд хайлт ──
  const matchedBrands = q
    ? BRANDS.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||     // Брэндийн нэр
          b.origin.toLowerCase().includes(q),     // Улс
      )
    : BRANDS; // Хоосон үед бүх брэнд

  // ── Ангилал хайлт ──
  const matchedCategories = q
    ? CATEGORIES.filter((c) => c.label.toLowerCase().includes(q))
    : CATEGORIES;

  // ── Хурдан холбоос хайлт ──
  const matchedLinks = q
    ? QUICK_LINKS.filter((l) => l.label.toLowerCase().includes(q))
    : QUICK_LINKS;

  return (
    // CommandDialog: Modal байдлаар нээгддэг хайлтын цонх
    // open: нээлттэй эсэх | onOpenChange: нээх/хаах үед дуудагдана
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      commandProps={{
        disablePointerSelection,
        onKeyDown: handlePaletteKeyDown,
        onPointerMove: handlePalettePointerMove,
      }}
    >
      {/* Хайлтын текст оруулах талбар */}
      <CommandInput
        placeholder="Бараа, брэнд, ангилал, хуудас хайх..."
        value={query}
        onValueChange={setQuery} // Текст өөрчлөгдөх бүрд query шинэчлэгдэнэ
        className="text-base h-12"
      />

      {/* max-h-[70vh]: хайлтын жагсаалт дэлгэцийн 70%-аас ихгүй байна */}
      <CommandList className="max-h-[70vh]">

        {/* Хайлтад юу ч олдоогүй үед харуулах хэсэг */}
        <CommandEmpty>
          <div className="flex flex-col items-center py-8 text-center">
            <Search size={32} className="text-muted-foreground mb-3 opacity-30" />
            <p className="text-sm font-medium text-foreground">Илэрц олдсонгүй</p>
            <p className="text-xs text-muted-foreground mt-1">
              &ldquo;{query}&rdquo; хайлтад тохирох зүйл олдсонгүй
            </p>
          </div>
        </CommandEmpty>

        {/* ── БҮТЭЭГДЭХҮҮН БҮЛЭГ ── */}
        <CommandGroup heading="Бүтээгдэхүүн">
          {matchedProducts.map((p) => (
            <CommandItem
              key={p.id}
              // value: хайлтын системд энэ сонголтыг таних уникал текст
              value={`product-${p.id}-${p.nameMn}-${p.name}-${p.brand}-${p.category}`}
              onSelect={() => go(`/products/${p.slug}`)} // Сонгоход барааны хуудас руу шилжинэ
              className="flex items-center gap-3 py-2.5 cursor-pointer"
            >
              {/* Барааны жижиг зураг */}
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted shrink-0">
                <Image
                  src={getImageUrl(p.image)}
                  alt={p.nameMn}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Барааны нэр, ангилал, үнэлгээ */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{p.brand}</p>
                {/* truncate: урт нэрийг "..." болгоно */}
                <p className="text-sm font-medium text-foreground truncate">{p.nameMn}</p>
                <p className="text-xs text-muted-foreground">
                  {p.categoryMn} · ⭐ {p.rating} ({p.reviews.toLocaleString()})
                </p>
              </div>
              {/* Үнэ */}
              <span className="text-xs font-bold text-foreground shrink-0">
                {p.price.toLocaleString("mn-MN")}₮
              </span>
            </CommandItem>
          ))}

          {/* Хайлтын үр дүн байвал "бүх бараа харах" холбоос нэмнэ */}
          {q && matchedProducts.length > 0 && (
            <CommandItem
              value="search-all-products"
              onSelect={() => go(`/products?q=${encodeURIComponent(query)}`)}
              className="cursor-pointer text-muted-foreground italic text-sm"
            >
              <Tag size={14} className="mr-2 shrink-0" />
              &ldquo;{query}&rdquo; — бүх бараа харах
            </CommandItem>
          )}
        </CommandGroup>

        {/* ── БРЭНД БҮЛЭГ ── */}
        {/* matchedBrands.length > 0 бол л харуулна */}
        {matchedBrands.length > 0 && (
          <>
            <CommandSeparator /> {/* Зааглагч шугам */}
            <CommandGroup heading="Брэнд">
              {matchedBrands.map((b) => (
                <CommandItem
                  key={b.name}
                  value={`brand-${b.name}-${b.origin}`}
                  onSelect={() => go(b.href)}
                  className="cursor-pointer"
                >
                  <Sparkles size={14} className="mr-2 text-muted-foreground shrink-0" />
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="truncate font-medium">{b.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{b.origin}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* ── АНГИЛАЛ БҮЛЭГ ── */}
        {matchedCategories.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Ангилал">
              {matchedCategories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={`cat-${cat.id}-${cat.label}`}
                  onSelect={() => go(cat.href)}
                  className="cursor-pointer"
                >
                  <Layers size={14} className="mr-2 text-muted-foreground" />
                  <span className="font-medium">{cat.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* ── ХУУДАСНЫ НАВИГАЦ БҮЛЭГ ── */}
        {matchedLinks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Хуудсууд">
              {/* { id, label, icon: Icon, href } → объектоос задалж авна */}
              {/* icon-ийг Icon гэж нэрлэж авна — Capitalized байхгүй бол JSX-д ажиллахгүй */}
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

      {/* ── KEYBOARD ТУСЛАМЖИЙН МӨР ── */}
      {/* Цонхны доод хэсэгт товчлуурын тайлбарыг харуулна */}
      {/* select-none: текстийг хулганаар сонгох боломжгүй болгоно */}
      <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[11px] text-muted-foreground select-none">
        {/* kbd: гарын товчлуурыг илэрхийлэх HTML тэг */}
        <span className="flex items-center gap-1.5">
          <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">↑↓</kbd>
          навигаци
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">↵</kbd>
          нээх
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">esc</kbd>
          хаах
        </span>
        <span className="ml-auto flex items-center gap-1">
          <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">/</kbd>
        </span>
      </div>
    </CommandDialog>
  );
}

// ── SearchTrigger компонент ───────────────────────────────────────────────────
// Navbar дахь "Бараа, брэнд хайх..." гэсэн input шиг харагдах товч.
// Дарахад хайлтын цонх (SearchPalette) нээгдэнэ.
// Жинхэнэ input биш — зөвхөн харагдах төрхтэй товч.
export function SearchTrigger() {
  // "open-search" custom event илгээнэ — SearchPalette үүнийг сонсоно.
  function open() {
    document.dispatchEvent(new CustomEvent("open-search"));
  }

  return (
    <button
      id="search-palette-trigger"
      onClick={open}
      className="flex items-center gap-2.5 h-9 w-full max-w-md rounded-lg border border-border bg-muted/40 px-4 text-sm text-muted-foreground hover:bg-muted hover:border-foreground/20 transition-all"
      aria-label="Хайлт нээх (/)"
    >
      <Search size={14} className="shrink-0" />
      <span className="flex-1 text-left">Бараа, брэнд хайх...</span>
      {/* Гарын "/" товчны тайлбар — sm+ дэлгэцэнд л харагдана */}
      <kbd className="hidden sm:inline-flex h-5 shrink-0 items-center rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
        /
      </kbd>
    </button>
  );
}
