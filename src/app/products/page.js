// ── products/page.js ──────────────────────────────────────────────────────────
// Энэ файлын үүрэг:
//   Бүх бүтээгдэхүүнийг жагсааж харуулах, хайх, шүүх (filtering),
//   эрэмбэлэх (sorting) боломжтой үндсэн дэлгүүрийн хуудас.
//
//   Тусгай боломжууд:
//     - Олон төрлийн шүүлтүүр (Brand, Skin type, Price, etc.)
//     - URL-аас хайлтын утга болон брэнд унших
//     - Гар утсанд зориулсан "Sheet" шүүлтүүрийн цонх
//     - Хайлт болон шүүлтүүрийг useMemo-оор оновчтой тооцоолох
// ─────────────────────────────────────────────────────────────────────────────

"use client";

// useMemo: үнэтэй тооцооллыг (шүүлт) зөвхөн хамааралтай утга өөрчлөгдөхөд л дахин хийнэ
// useCallback: функцийг дахин үүсгэхээс сэргийлж санах ойд хадгална
// Suspense: searchParams уншихад Next.js-ээс шаарддаг wrapper
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// lucide-react icon-ууд
import { Search, SlidersHorizontal, X, ShoppingBag, ChevronDown, ChevronRight } from "lucide-react";

// UI компонентууд
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Layout & Data
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { SORT_OPTIONS, SKINCARE_ROUTINE, BRANDS, SKIN_TYPES, SKIN_CONCERNS } from "@/lib/products";

// Хамгийн дээд үнэ (Slider-т ашиглана)
const MAX_PRICE = 200000;

// ── FilterSection компонент ──────────────────────────────────────────────────
// Шүүлтүүрийн бүлгүүдийг (Брэнд, Үнэ гэх мэт) эвхэж нээх боломжтой болгоно.
function FilterSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 last:border-0 pb-4 mb-4 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-1 text-left group"
      >
        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-foreground group-hover:text-muted-foreground transition-colors">
          {title}
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
}

// ── FilterCheck компонент ────────────────────────────────────────────────────
// Нэг мөр checkbox болон түүний нэр (label).
function FilterCheck({ id, label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 py-0.5 cursor-pointer group">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="rounded"
      />
      <span className="text-sm text-foreground/75 group-hover:text-foreground transition-colors">
        {label}
      </span>
    </label>
  );
}

// ── FilterPanel компонент ────────────────────────────────────────────────────
// Бүх шүүлтүүрүүдийг нэгтгэсэн самбар (Desktop sidebar болон Mobile Sheet-д ашиглана).
function FilterPanel({ filters, onChange, onReset }) {
  // toggle: массив дотор утга байвал хасаж, байхгүй бол нэмэх функц
  const toggle = (key, value) => {
    onChange((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  return (
    <div className="flex flex-col">
      {/* 1. Арьс арчилгаа (Subcategories) */}
      <FilterSection title="Арьс арчилгаа" defaultOpen>
        {SKINCARE_ROUTINE.map((group) => (
          <div key={group.group} className="mb-3 last:mb-0">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1.5 font-medium">
              {group.group}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <FilterCheck
                  key={item.value}
                  id={`sub-${item.value}`}
                  label={item.label}
                  checked={filters.subcategories.includes(item.value)}
                  onChange={() => toggle("subcategories", item.value)}
                />
              ))}
            </div>
          </div>
        ))}
      </FilterSection>

      {/* 2. Брэнд */}
      <FilterSection title="Брэнд">
        <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto pr-1">
          {BRANDS.map((b) => (
            <FilterCheck
              key={b.name}
              id={`brand-${b.name}`}
              label={b.name}
              checked={filters.brands.includes(b.name)}
              onChange={() => toggle("brands", b.name)}
            />
          ))}
        </div>
      </FilterSection>

      {/* 3. Арьсны төрөл */}
      <FilterSection title="Арьсны төрөл">
        <div className="flex flex-col gap-0.5">
          {SKIN_TYPES.map((t) => (
            <FilterCheck
              key={t.value}
              id={`skin-${t.value}`}
              label={t.label}
              checked={filters.skinTypes.includes(t.value)}
              onChange={() => toggle("skinTypes", t.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* 4. Арьсны асуудал */}
      <FilterSection title="Арьсны асуудал">
        <div className="flex flex-col gap-0.5">
          {SKIN_CONCERNS.map((c) => (
            <FilterCheck
              key={c.value}
              id={`concern-${c.value}`}
              label={c.label}
              checked={filters.skinConcerns.includes(c.value)}
              onChange={() => toggle("skinConcerns", c.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* 5. Үнэ (Slider) */}
      <FilterSection title="Үнэ" defaultOpen>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={5000}
          value={[filters.minPrice, filters.maxPrice]}
          onValueChange={([min, max]) =>
            onChange((prev) => ({ ...prev, minPrice: min, maxPrice: max }))
          }
          className="mb-3"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{filters.minPrice.toLocaleString("mn-MN")}₮</span>
          <span className="font-semibold text-foreground">
            {filters.maxPrice.toLocaleString("mn-MN")}₮
          </span>
        </div>
      </FilterSection>

      {/* Зөвхөн байгаа барааг шүүх */}
      <div className="mt-4">
        <FilterCheck
          id="instock"
          label="Зөвхөн байгаа бараа"
          checked={filters.inStockOnly}
          onChange={(v) => onChange((prev) => ({ ...prev, inStockOnly: v === true }))}
        />
      </div>

      {/* Шүүлтүүр арилгах товч */}
      <Button variant="outline" size="sm" onClick={onReset} className="mt-6 rounded-lg text-xs tracking-widest uppercase">
        Шүүлт арилгах
      </Button>
    </div>
  );
}

// Анхны шүүлтүүрийн төлөв
const DEFAULT_FILTERS = {
  subcategories: [],
  brands: [],
  skinTypes: [],
  skinConcerns: [],
  minPrice: 0,
  maxPrice: MAX_PRICE,
  inStockOnly: false,
};

// ── ProductsPage үндсэн компонент ─────────────────────────────────────────────
function ProductsPage() {
  const searchParams = useSearchParams();
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?limit=1000")
      .then(res => res.json())
      .then(data => {
        const mapped = (data.products || []).map(p => ({
          ...p,
          nameMn: p.name_mn || p.name,
          originalPrice: p.original_price,
          inStock: p.in_stock,
          categoryMn: p.category_mn,
          reviews: p.reviews_count,
          skinTypes: p.skin_types || [],
          skinConcerns: p.skin_concerns || [],
          tags: p.tags || []
        }));
        setDbProducts(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // search: текст хайлт
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");

  // sort: эрэмбэлэх төрөл (featured, price-asc, etc.)
  const [sort, setSort] = useState("featured");

  // filters: бүх идэвхтэй шүүлтүүрүүд
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    // Хэрэв URL-аар брэндийн хаяг орж ирвэл шууд шүүнэ
    brands: searchParams.get("brand") ? [searchParams.get("brand")] : [],
  }));

  // Шүүлтүүрүүдийг арилгах функц (useCallback: оновчлол)
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
  }, []);

  // Хэдэн төрлийн шүүлтүүр идэвхтэй байгааг тоолох (badge харуулахад)
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.subcategories.length) n++;
    if (filters.brands.length) n++;
    if (filters.skinTypes.length) n++;
    if (filters.skinConcerns.length) n++;
    if (filters.minPrice > 0 || filters.maxPrice < MAX_PRICE) n++;
    if (filters.inStockOnly) n++;
    return n;
  }, [filters]);

  // ── БАРАА ШҮҮХ ГОЛ ЛОГИК ──
  // Энэ хэсэгт бүх нөхцөлийг шалгаж бараануудыг шүүнэ.
  const filteredProducts = useMemo(() => {
    let result = [...dbProducts];

    // 1. Текст хайлт (Нэр, Брэнд, Таг дотроос хайна)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nameMn.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 2. Дэд төрөл (Subcategory)
    if (filters.subcategories.length) {
      result = result.filter((p) => filters.subcategories.includes(p.subcategory));
    }

    // 3. Брэнд
    if (filters.brands.length) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }

    // 4. Арьсны төрөл (Барааны skinTypes массивт сонгосон төрөл байгаа эсэх)
    if (filters.skinTypes.length) {
      result = result.filter((p) =>
        filters.skinTypes.some((t) => p.skinTypes?.includes(t))
      );
    }

    // 5. Арьсны асуудал
    if (filters.skinConcerns.length) {
      result = result.filter((p) =>
        filters.skinConcerns.some((c) => p.skinConcerns?.includes(c))
      );
    }

    // 6. Үнийн хүрээ
    result = result.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    // 7. Зөвхөн байгаа бараа
    if (filters.inStockOnly) result = result.filter((p) => p.inStock);

    // ── ЭРЭМБЭЛЭХ (SORTING) ──
    if (sort === "price-asc")  result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "rating")     result.sort((a, b) => b.rating - a.rating);
    if (sort === "newest")     result.sort((a, b) => b.id - a.id);

    return result;
  }, [search, filters, sort, dbProducts]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {/* ХУУДАСНЫ ДЭЭД ХЭСЭГ (Header & Breadcrumb) */}
        <section className="border-b border-border/60 py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-foreground transition-colors">Нүүр</Link>
              <span>/</span>
              <span className="text-foreground">Бүтээгдэхүүн</span>
            </nav>
            <h1 className="text-5xl md:text-6xl text-foreground mb-2">Бүтээгдэхүүн</h1>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} бараа олдлоо
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="ml-3 underline hover:no-underline">
                  Шүүлт арилгах
                </button>
              )}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* TOOLBAR (Хайлт & Эрэмбэ) */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Текст хайлтын талбар */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="product-search"
                type="search"
                placeholder="Бараа, брэнд хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-full border-border text-sm h-9"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Эрэмбэлэх сонголт */}
              <div className="relative">
                <select
                  id="products-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none border border-border bg-background text-foreground text-sm px-4 py-2 pr-8 rounded-lg focus:outline-none focus:border-foreground cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>

              {/* МОБАЙЛ ШҮҮЛТҮҮР (Sheet) */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden rounded-lg text-xs flex gap-2">
                    <SlidersHorizontal size={14} />
                    Шүүлт
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 bg-foreground text-background text-[10px] rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl">Шүүлт</SheetTitle>
                  </SheetHeader>
                  <FilterPanel filters={filters} onChange={setFilters} onReset={resetFilters} />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* ИДЭВХТЭЙ ШҮҮЛТҮҮРИЙН ШОШГОНУУД (Active Filter Pills) */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.brands.map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-xs border border-border rounded-full px-3 py-1">
                  {b}
                  <button onClick={() => setFilters((p) => ({ ...p, brands: p.brands.filter((x) => x !== b) }))}>
                    <X size={11} />
                  </button>
                </span>
              ))}
              {/* Бусад шүүлтүүрүүдийг мөн адил энд харуулна... */}
              {/* (Код урт тул зарим хэсгийг товчлов) */}
              {filters.skinTypes.map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs border border-border rounded-full px-3 py-1">
                  {t}
                  <button onClick={() => setFilters((p) => ({ ...p, skinTypes: p.skinTypes.filter((x) => x !== t) }))}><X size={11} /></button>
                </span>
              ))}
              {filters.skinConcerns.map((c) => (
                <span key={c} className="flex items-center gap-1.5 text-xs border border-border rounded-full px-3 py-1">
                  {c}
                  <button onClick={() => setFilters((p) => ({ ...p, skinConcerns: p.skinConcerns.filter((x) => x !== c) }))}><X size={11} /></button>
                </span>
              ))}
              {filters.subcategories.map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-xs border border-border rounded-full px-3 py-1">
                  {s}
                  <button onClick={() => setFilters((p) => ({ ...p, subcategories: p.subcategories.filter((x) => x !== s) }))}><X size={11} /></button>
                </span>
              ))}
              {(filters.minPrice > 0 || filters.maxPrice < MAX_PRICE) && (
                <span className="flex items-center gap-1.5 text-xs border border-border rounded-full px-3 py-1">
                  {filters.minPrice.toLocaleString("mn-MN")}₮–{filters.maxPrice.toLocaleString("mn-MN")}₮
                  <button onClick={() => setFilters((p) => ({ ...p, minPrice: 0, maxPrice: MAX_PRICE }))}><X size={11} /></button>
                </span>
              )}
            </div>
          )}

          {/* ҮНДСЭН БҮТЭЦ (Sidebar + Grid) */}
          <div className="flex gap-8">
            {/* DESKTOP SIDEBAR (Том дэлгэцэнд л харагдана) */}
            <aside className="hidden lg:block w-60 shrink-0">
              <div className="sticky top-20">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[10px] tracking-[0.4em] uppercase font-semibold text-foreground">Шүүлт</h2>
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
                      Арилгах ({activeFilterCount})
                    </button>
                  )}
                </div>
                <FilterPanel filters={filters} onChange={setFilters} onReset={resetFilters} />
              </div>
            </aside>

            {/* БАРААНЫ GRID */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex justify-center py-24 text-muted-foreground">Уншиж байна...</div>
              ) : filteredProducts.length === 0 ? (
                // Бараа олдоогүй үеийн төлөв
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <ShoppingBag size={40} className="text-border mb-5" />
                  <h3 className="text-2xl text-foreground mb-2">Бараа олдсонгүй</h3>
                  <p className="text-sm text-muted-foreground mb-6">Шүүлт эсвэл хайлтыг өөрчлөн дахин оролдоно уу.</p>
                  <Button variant="outline" onClick={resetFilters} className="rounded-full text-xs">Шүүлт арилгах</Button>
                </div>
              ) : (
                // Барааны жагсаалт
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// ── Wrapper (Suspense шаардлагатай) ───────────────────────────────────────────
// useSearchParams ашигладаг тул Client Side-д Suspense дотор байх ёстой.
export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Уншиж байна...</div>}>
      <ProductsPage />
    </Suspense>
  );
}
