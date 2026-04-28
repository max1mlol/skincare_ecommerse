"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";

const BADGE_STYLE = {
  Бестселлер: "bg-foreground text-background",
  Шинэ: "bg-sky-600 text-white",
  Хямдрал: "bg-red-500 text-white",
};

export default function ProductCard({ product, priority = false }) {
  const { addItem } = useCart();

  function addToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock) addItem(product, 1);
  }

  return (
    // h-full lets CSS grid stretch all cards in a row to equal height
    <article className="group h-full flex flex-col rounded-2xl border border-border/50 hover:border-border bg-card hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* ── Image ── fixed aspect-square so all images same height */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted/40 shrink-0"
        tabIndex={-1}
      >
        <Image
          src={product.image}
          alt={product.nameMn}
          fill
          sizes="(max-width:640px)50vw,(max-width:1024px)33vw,25vw"
          priority={priority}
          className={`object-cover transition-transform duration-500 ${
            product.inStock ? "group-hover:scale-105" : "opacity-50"
          }`}
        />

        {/* Badge pill */}
        {product.badge && (
          <span
            className={`absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLE[product.badge] ?? "bg-foreground text-background"}`}
          >
            {product.badge}
          </span>
        )}

        {/* Discount % */}
        {product.originalPrice && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}

        {/* Out-of-stock */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="bg-background text-foreground text-xs px-3 py-1 rounded-full font-medium border border-border">
              Дууссан
            </span>
          </div>
        )}
      </Link>

      {/* ── Info ── flex-1 so it fills remaining card height */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        {/* Brand */}
        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground leading-none">
          {product.brand}
        </p>

        {/* Name — line-clamp-2 keeps all names 2-line max */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 hover:underline underline-offset-2">
            {product.nameMn}
          </h3>
        </Link>

        {/* Stars + review count */}
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5" aria-label={`${product.rating} одтой`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={`w-2.5 h-2.5 ${i < Math.round(product.rating) ? "fill-amber-400" : "fill-muted"}`}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {product.rating} ({product.reviews.toLocaleString()})
          </span>
        </div>

        {/* Category tag */}
        <p className="text-[11px] text-muted-foreground">
          {product.categoryMn}
        </p>

        {/* Price + Add — mt-auto pushes to card bottom regardless of content height */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-foreground">
              {product.price.toLocaleString("mn-MN")}₮
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {product.originalPrice.toLocaleString("mn-MN")}₮
              </span>
            )}
          </div>

          <button
            onClick={addToCart}
            disabled={!product.inStock}
            aria-label="Сагсанд нэмэх"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
