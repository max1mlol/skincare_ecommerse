"use client";
// FeaturedProducts: Нүүр хуудас дээрх онцлох бүтээгдэхүүнүүдийг харуулах хэсэг.
// Энд хамгийн их борлуулалттай буюу шинээр нэмэгдсэн шилдэг 8 бүтээгдэхүүнийг серверээс дуудаж харуулна.
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]); // Онцлох бараануудын жагсаалт
  const [loading, setLoading] = useState(true); // Ачаалалтын төлөв

  useEffect(() => {
    // API-аас хамгийн шинэ 8 бүтээгдэхүүнийг татах хүсэлт
    fetch("/api/products?limit=8&sort=newest")
      .then(res => {
        if (!res.ok) throw new Error("API холбогдож чадсангүй");
        return res.json();
      })
      .then(d => {
        // Өгөгдлийн сангийн snake_case талбаруудыг ProductCard-ын хүлээж авах camelCase талбаруудтай тааруулж зураглах (Map хийх)
        const mapped = (d.products || []).map(p => ({
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
        setProducts(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted-foreground bg-muted/50 animate-pulse">Онцлох бараа уншиж байна...</div>;
  }

  return (
    <section className="py-20 px-4 bg-muted/50" aria-labelledby="products-heading">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">
              Онцлох бараа
            </p>
            <h2 id="products-heading" className="text-4xl md:text-5xl text-foreground font-semibold">
              Хамгийн их <em className="italic font-normal">борлуулагддаг</em>
            </h2>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-foreground/60 hover:text-foreground transition-colors group"
            aria-label="Бүх бүтээгдэхүүн харах"
          >
            Бүх бараа
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 8 бүтээгдэхүүнийг 4 баганаар харуулах */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}
