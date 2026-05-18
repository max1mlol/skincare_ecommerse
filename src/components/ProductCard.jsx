"use client";

// Image: Next.js-ийн оптимизаци хийгдсэн зураг компонент.
//        Энгийн <img> тэгийн оронд ашиглахад зураг автоматаар шахагдаж, хурдан ачаалагдана.
import Image from "next/image";

// Link: Next.js-ийн хуудас шилжилтийн компонент.
//       Энгийн <a href="..."> оронд ашиглахад хуудас дахин ачаалагдахгүй, хурдан шилжинэ.
import Link from "next/link";

// Plus: lucide-react сангийн "+" дүрс (icon) — "Сагсанд нэмэх" товч дотор ашиглана.
import { Plus } from "lucide-react";

// useCart: CartContext.jsx дотор үүсгэсэн custom hook.
//          addItem функцийг авч барааг сагсанд нэмэхэд ашиглана.
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/lib/utils";

// Шошгоны өнгийн тохиргоо
// Барааны badge (шошго) төрлөөс хамаарч ямар өнгийн CSS класс ашиглахыг тодорхойлно.
// Жишээ: badge === "Бестселлер" → "bg-foreground text-background" гэсэн класс хэрэглэнэ.
// "??" (nullish coalescing) оператор: badge нь BADGE_STYLE-д байхгүй бол default өнгийг ашиглана.
const BADGE_STYLE = {
  Бестселлер: "bg-foreground text-background",
  Шинэ: "bg-sky-600 text-white",
  Хямдрал: "bg-red-500 text-white",
};

// ProductCard компонент
// Параметрүүд:
//   product  → харуулах барааны бүх мэдээллийг агуулсан объект
//   priority → зураг ачаалах тэргүүлэлт (эхний 4 карт true → дэлгэцэнд эрт гарна)
export default function ProductCard({ product, priority = false }) {
  // useCart hook-оос addItem функцийг авна (сагсанд нэмэх).
  const { addItem } = useCart();

  // addToCart: "Сагсанд нэмэх" товч дарагдах үед дуудагдах функц.
  function addToCart(e) {
    // e.preventDefault(): товч Link дотор байгаа тул хуудас шилжилт хийхгүй байлгана.
    e.preventDefault();
    // e.stopPropagation(): энэ товчны дарах үйлдэл эцэг (parent) элемент рүү "дамжихгүй" байлгана.
    //   Жишээ: карт бүхэлдээ Link тул энэ хамгаалалтгүйгээр дарвал бүтээгдэхүүний хуудас нээгдчихнэ.
    e.stopPropagation();
    // Зөвхөн нөөцтэй бараа нэмнэ (inStock === true бол).
    if (product.inStock) addItem(product, 1);
  }

  return (
    // <article> — HTML5 семантик тэг, нэг барааны "блок" гэдгийг хайлтын системд мэдэгдэнэ.
    // h-full: CSS grid хамт ашиглагдах үед бүх картыг нэг ижил өндөртэй болгоно.
    // group: hover хийхэд дотор байгаа элементүүдийг хамтад нь өөрчилдөг Tailwind класс.
    <article className="group h-full flex flex-col rounded-2xl border border-border/50 hover:border-border bg-card hover:shadow-md transition-all duration-200 overflow-hidden">

      {/* ── ЗУРГИЙН ХЭСЭГ ── */}
      {/* aspect-square: өргөн = өндөр тэгш дөрвөлжин хэлбэрийг хадгална */}
      {/* tabIndex={-1}: энэ Link-ийг гарын товчоор (Tab) хандах жагсаалтаас хасна */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted/40 shrink-0"
        tabIndex={-1}
      >
        {/* Next.js зурагт fill prop → эцэг div-ийн хэмжээг дүүргэж харуулна */}
        {/* sizes → ямар дэлгэцний өргөнд ямар хэмжээний зураг ачаалахыг хэлнэ */}
        {/* product.inStock байвал hover дээр zoom (scale-105), байхгүй бол бүдэг (opacity-50) */}
        <Image
          src={getImageUrl(product.image)}
          alt={product.nameMn}
          fill
          sizes="(max-width:640px)50vw,(max-width:1024px)33vw,25vw"
          priority={priority}
          className={`object-cover transition-transform duration-500 ${
            product.inStock ? "group-hover:scale-105" : "opacity-50"
          }`}
        />

        {/* ── ШОШГО (BADGE) ── */}
        {/* product.badge байвал л харуулна (&&: зүүн тал true үед баруун талыг үзүүлнэ) */}
        {product.badge && (
          <span
            // BADGE_STYLE[product.badge] → шошгоны нэрээр өнгийг хайна.
            // ?? "bg-foreground text-background" → байхгүй бол default өнгө ашиглана.
            className={`absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLE[product.badge] ?? "bg-foreground text-background"}`}
          >
            {product.badge}
          </span>
        )}

        {/* ── ХЯМДРАЛЫН ХУВЬ ── */}
        {/* originalPrice байвал хямдралыг % байдлаар бодож харуулна */}
        {/* Math.round: тоог ойролцоогоор бүхэл болгоно */}
        {/* (1 - price/originalPrice) * 100 → хямдралын хувь */}
        {product.originalPrice && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}

        {/* ── ДУУССАН БАРААНЫ ТЭМДЭГ ── */}
        {/* !product.inStock → inStock нь false (нөөц дууссан) бол харуулна */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="bg-background text-foreground text-xs px-3 py-1 rounded-full font-medium border border-border">
              Дууссан
            </span>
          </div>
        )}
      </Link>

      {/* ── МЭДЭЭЛЛИЙН ХЭСЭГ ── */}
      {/* flex-1: зургийн доорх үлдсэн зайг бүрэн дүүргэнэ → бүх карт нэг ижил өндөртэй болно */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">

        {/* ── БРЭНД ── */}
        {/* tracking-widest: үсгүүдийн хоорондох зай их болгоно (COSRX гэх мэт) */}
        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground leading-none">
          {product.brand}
        </p>

        {/* ── БАРААНЫ НЭР ── */}
        {/* line-clamp-2: нэр урт байвал 2 мөрөнд хязгаарлаж "..." харуулна */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 hover:underline underline-offset-2">
            {product.nameMn}
          </h3>
        </Link>

        {/* Үнэлгээ болон сэтгэгдлийн тоо */}
        <div className="flex items-center gap-1">
          {/* Array.from({ length: 5 }) → 5 ширхэг хоосон утгатай массив үүсгэнэ */}
          {/* .map((_, i) → i нь 0–4 тоонуудыг дамжина */}
          {/* i < Math.round(product.rating) → үнэлгээнээс бага index-тэй одны өнгийг шар болгоно */}
          <div className="flex gap-0.5" aria-label={`${product.rating} одтой`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={`w-2.5 h-2.5 ${i < Math.round(product.rating) ? "fill-amber-400" : "fill-muted"}`}
              >
                {/* Одны SVG дүрсийн зам */}
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          {/* Дундаж үнэлгээ ба нийт сэтгэгдлийн тоо */}
          {/* toLocaleString(): тоог таслал бүхий форматаар харуулна (жишээ: 1,200) */}
          <span className="text-[11px] text-muted-foreground">
            {product.rating} ({product.reviews.toLocaleString()})
          </span>
        </div>

        {/* ── АНГИЛАЛ ── */}
        <p className="text-[11px] text-muted-foreground">
          {product.categoryMn}
        </p>

        {/* ── ҮНЭ БОЛОН НЭМЭХ ТОВЧЛУУР ── */}
        {/* mt-auto: дээрх агуулгаас үл хамааран энэ хэсгийг картын доод хэсэгт "наалдуулна" */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">

          {/* Үнийн хэсэг */}
          <div className="flex items-baseline gap-1.5">
            {/* toLocaleString("mn-MN"): Монгол форматаар тоог харуулна */}
            <span className="text-sm font-bold text-foreground">
              {product.price.toLocaleString("mn-MN")}₮
            </span>
            {/* originalPrice байвал хуучин үнийг зурагдуулж (line-through) харуулна */}
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {product.originalPrice.toLocaleString("mn-MN")}₮
              </span>
            )}
          </div>

          {/* Сагсанд нэмэх товч */}
          {/* disabled: нөөц дууссан бол товч идэвхгүй болно */}
          <button
            onClick={addToCart}
            disabled={!product.inStock}
            aria-label="Сагсанд нэмэх"
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            {/* Plus(+) icon, хэмжээ 14px */}
            <Plus size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
