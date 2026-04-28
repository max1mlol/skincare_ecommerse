"use client";

import { useState, useMemo, useCallback, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ShoppingBag, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, CATEGORIES, SORT_OPTIONS } from "@/lib/products";

// Catalog filter-ийн дээд үнийн хязгаар.
const MAX_PRICE = 500000;

// Desktop болон mobile drawer хоёуланд нь дахин ашиглагдах filter panel.
function FilterPanel({ filters, onFilterChange, onReset }) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-4">
          Ангилал
        </h3>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <Checkbox
                id={`cat-${cat.value}`}
                checked={filters.category === cat.value}
                onCheckedChange={() => onFilterChange("category", cat.value)}
                className="rounded-lg"
              />
              <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-4">
          Үнийн хязгаар
        </h3>
        <Slider
          id="price-range-slider"
          min={0}
          max={MAX_PRICE}
          step={1000}
          value={[filters.maxPrice]}
          onValueChange={([val]) => onFilterChange("maxPrice", val)}
          className="mb-3"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0₮</span>
          <span className="font-semibold text-foreground">
            {filters.maxPrice.toLocaleString("mn-MN")}₮
          </span>
        </div>
      </div>

      {/* In-stock only */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            id="in-stock-filter"
            checked={filters.inStockOnly}
            onCheckedChange={(v) => onFilterChange("inStockOnly", v)}
            className="rounded-lg"
          />
          <span className="text-sm text-foreground/80">
            Зөвхөн байгаа бараа
          </span>
        </label>
      </div>

      {/* Reset */}
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="rounded-lg border-border text-xs tracking-widest uppercase"
      >
        Шүүлт арилгах
      </Button>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
function ProductsPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [sort, setSort] = useState(() => searchParams.get("sort") ?? "featured");
  const [filters, setFilters] = useState({
    category: searchParams.get("cat") ?? "all",
    brand: searchParams.get("brand") ?? "all",
    sale: searchParams.get("sale") === "1",
    maxPrice: MAX_PRICE,
    inStockOnly: false,
  });

  const [prevSearchStr, setPrevSearchStr] = useState(searchParams.toString());

  if (searchParams.toString() !== prevSearchStr) {
    setPrevSearchStr(searchParams.toString());
    setSearch(searchParams.get("q") ?? "");
    setSort(searchParams.get("sort") ?? "featured");
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get("cat") ?? "all",
      brand: searchParams.get("brand") ?? "all",
      sale: searchParams.get("sale") === "1",
    }));
  }

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ category: "all", brand: "all", sale: false, maxPrice: MAX_PRICE, inStockOnly: false });
    setSearch("");
    setSort("featured");
  }, []);

  // Derived: filtered + sorted products
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nameMn.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.categoryMn.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // category
    if (filters.category !== "all") {
      result = result.filter((p) => p.category === filters.category);
    }

    // brand
    if (filters.brand !== "all") {
      result = result.filter((p) => p.brand === filters.brand);
    }

    // sale
    if (filters.sale) {
      result = result.filter((p) => p.badge === "Хямдрал" || p.originalPrice);
    }

    // price
    result = result.filter((p) => p.price <= filters.maxPrice);

    // in-stock
    if (filters.inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // sort
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sort === "newest") result.sort((a, b) => b.id - a.id);
    // "featured" → default order

    return result;
  }, [search, filters, sort]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.brand !== "all") count++;
    if (filters.sale) count++;
    if (filters.maxPrice < MAX_PRICE) count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters]);

  return (
    <>
      <Navbar />

      <main className="pt-4 md:pt-4 min-h-screen">
        {/* ── Page header ── */}
        <section className="border-b border-border/60 py-10 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav
              className="flex items-center gap-2 text-xs text-muted-foreground mb-6"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Нүүр
              </Link>
              <span>/</span>
              <span className="text-foreground">Бүтээгдэхүүн</span>
            </nav>
            <h1 className="text-5xl md:text-6xl text-foreground mb-3">
              Бүтээгдэхүүн
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} бараа олдлоо
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ── Toolbar ── */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md flex items-center">
              <Search
                size={15}
                className="absolute left-3.5 text-muted-foreground pointer-events-none"
              />
              <Input
                id="product-search"
                type="search"
                placeholder="Бараа хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-lg border-border focus-visible:ring-0 focus-visible:border-foreground text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Хайлт арилгах"
                  className="absolute right-3 text-muted-foreground hover:text-foreground/80"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Sort */}
              <div className="relative">
                <select
                  id="products-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none border border-border bg-white text-sm px-4 py-2.5 pr-9 focus:outline-none focus:border-foreground cursor-pointer"
                  aria-label="Эрэмбэлэх"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
              </div>

              {/* Mobile filter trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden rounded-lg border-border text-xs tracking-widest uppercase flex gap-2"
                    aria-label="Шүүлт нээх"
                  >
                    <SlidersHorizontal size={14} />
                    Шүүлт
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 bg-foreground text-white text-[10px] rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 rounded-lg">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl tracking-wide">
                      Шүүлт
                    </SheetTitle>
                  </SheetHeader>
                  <FilterPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={resetFilters}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* ── Main grid + sidebar ── */}
          <div className="flex gap-10">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-28">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] tracking-[0.4em] uppercase text-foreground font-semibold">
                    Шүүлт
                  </h2>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Арилгах
                    </button>
                  )}
                </div>
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={resetFilters}
                />
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              {/* Active filter pills */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {filters.category !== "all" && (
                    <span className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 rounded-lg bg-muted/20">
                      {
                        CATEGORIES.find((c) => c.value === filters.category)
                          ?.label
                      }
                      <button
                        onClick={() => handleFilterChange("category", "all")}
                        aria-label="Ангилал арилгах"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  )}
                  {filters.brand !== "all" && (
                    <span className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 rounded-lg bg-muted/20">
                      {filters.brand}
                      <button
                        onClick={() => handleFilterChange("brand", "all")}
                        aria-label="Брэнд арилгах"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  )}
                  {filters.sale && (
                    <span className="flex items-center gap-1.5 text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg bg-red-50/50">
                      Хямдралтай
                      <button
                        onClick={() => handleFilterChange("sale", false)}
                        aria-label="Хямдрал арилгах"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  )}
                  {filters.maxPrice < MAX_PRICE && (
                    <span className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 rounded-lg bg-muted/20">
                      ≤ {filters.maxPrice.toLocaleString("mn-MN")}₮
                      <button
                        onClick={() =>
                          handleFilterChange("maxPrice", MAX_PRICE)
                        }
                        aria-label="Үнэ арилгах"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  )}
                  {filters.inStockOnly && (
                    <span className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 rounded-lg bg-muted/20">
                      Байгаа бараа
                      <button
                        onClick={() => handleFilterChange("inStockOnly", false)}
                        aria-label="Stock шүүлт арилгах"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {filteredProducts.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <ShoppingBag size={40} className="text-border mb-5" />
                  <h3 className="text-2xl text-foreground mb-2">
                    Бараа олдсонгүй
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Шүүлт эсвэл хайлтыг өөрчлөн дахин оролдоно уу.
                  </p>
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="rounded-lg text-xs tracking-widest uppercase"
                  >
                    Шүүлт арилгах
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} priority={i < 6} />
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

// Wrap in Suspense so useSearchParams() works with App Router static rendering
export default function ProductsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
          Уншиж байна...
        </div>
      }
    >
      <ProductsPage />
    </Suspense>
  );
}
