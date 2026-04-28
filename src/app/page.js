import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TestimonialsSection from "@/components/TestimonialsSection";
import BranchesSection from "@/components/BranchesSection";
import MarqueeTicker from "@/components/MarqueeTicker";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/products";

// Нүүр хуудсан дээр түрүүлж харагдах бараа, ангиллын shortcut-ууд.
const FEATURED_PRODUCTS = PRODUCTS.slice(0, 8);

const HOME_CATEGORIES = [
  { label: "Сэрум", href: "/products?cat=serum", image: "/product1.png" },
  { label: "Чийгшүүлэгч", href: "/products?cat=moisturizer", image: "/product2.png" },
  { label: "Цэвэрлэгч", href: "/products?cat=cleanser", image: "/product3.png" },
  { label: "Тоник", href: "/products?cat=toner", image: "/product4.png" },
  { label: "Маск", href: "/products?cat=mask", image: "/mask.png" },
  { label: "Нарнаас хамгаалах", href: "/products?cat=suncare", image: "/suncare.png" },
];





// Нүүр хуудас нь брэндийн танилцуулга, гол ангилал, онцлох барааг нэгтгэнэ.
export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ══════════════════════════════════
            1. ЭХЛЭЛ ХЭСЭГ (HERO)
        ══════════════════════════════════ */}
        <section
          className="relative min-h-screen flex items-end pb-20 md:pb-32"
          aria-labelledby="hero-heading"
        >
          {/* Дэлгэц дүүрэн арын зураг */}
          <div className="absolute inset-0">
            <Image
              src="/hero.png"
              alt="AURA SKIN — Арьсны гоо сайхан"
              fill
              sizes="100vw"
              priority
              className="object-cover object-center"
            />
            {/* Өнгөний уусалт — зүүн талын текстийг уншигдахуйц болгох */}
            <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
            {/* Доод хэсгийн уусалт */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/50 to-transparent" />
          </div>

          {/* Агуулга */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <h1
                id="hero-heading"
                className="text-4xl sm:text-4xl md:text-5xl text-white leading-tight mb-6 animate-fade-up animation-delay-100"
              >
                Таны арьс
                <br />
                <em className="italic font-normal">гоо сайхан</em>
                <br />
                бол манай
                <br />
                <em className="italic font-normal">эрхэм зорилго</em>
              </h1>
              <p className="text-sm text-white/70 leading-relaxed mb-10 max-w-sm animate-fade-up animation-delay-200">
                Байгалийн гаралтай, шинжлэх ухааны үндэстэй бүтээгдэхүүнүүдээр
                арьсаа тэтгэж, жинхэнэ гоо сайхнаа нээн илрүүл.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-up animation-delay-300">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-lg border-white text-white hover:bg-white hover:text-black bg-transparent transition-colors duration-300 px-8 py-6 text-xs tracking-[0.3em] uppercase font-semibold flex items-center gap-2"
                >
                  <Link href="/products">
                    Бүтээгдэхүүн үзэх
                    <ArrowRight size={14} />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-lg border-white text-white hover:bg-white! hover:text-black! bg-transparent transition-colors duration-300 px-8 py-6 text-xs tracking-[0.3em] uppercase font-semibold"
                >
                  <Link href="/about">Бидний тухай</Link>
                </Button>
              </div>

              {/* Баталгаажуулах тоон үзүүлэлтүүд */}
              <div className="flex gap-8 mt-12 animate-fade-up animation-delay-400">
                {[
                  { num: "12K+", label: "Үйлчлүүлэгч" },
                  { num: "98%", label: "Сэтгэл ханамж" },
                  { num: "40+", label: "Бүтээгдэхүүн" },
                ].map((stat) => (
                  <div key={stat.label} className="text-white">
                    <p className="text-2xl">{stat.num}</p>
                    <p className="text-[10px] tracking-widest uppercase text-white/50 mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            2. УРСДАГ ТЕКСТ (MARQUEE)
        ══════════════════════════════════ */}
        <MarqueeTicker />

        {/* ══════════════════════════════════
            3. АНГИЛАЛУУД
        ══════════════════════════════════ */}
        <section
          className="py-20 px-4 bg-white"
          aria-labelledby="categories-heading"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {HOME_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="group flex flex-col items-center gap-3 transition-transform hover:-translate-y-1"
                  aria-label={`${cat.label} ангилал`}
                >
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-muted/30 border border-border group-hover:border-foreground transition-colors">
                    <Image 
                      src={cat.image} 
                      alt={cat.label} 
                      fill 
                      sizes="(max-width: 640px) 56px, 64px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <span className="text-[10px] tracking-[0.15em] uppercase text-foreground/70 group-hover:text-foreground transition-colors text-center font-medium leading-tight">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            4. ОНЦЛОХ БАРАА
        ══════════════════════════════════ */}
        <section
          className="py-20 px-4 bg-muted/50"
          aria-labelledby="products-heading"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
              <div>
                <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">
                  Онцлох бараа
                </p>
                <h2
                  id="products-heading"
                  className="text-4xl md:text-5xl text-foreground"
                >
                  Хамгийн их <em className="italic">борлуулагддаг</em>
                </h2>
              </div>
              <Link
                href="/products"
                className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase
                           text-foreground/60 hover:text-foreground transition-colors group"
                aria-label="Бүх бүтээгдэхүүн харах"
              >
                Бүх бараа
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              {FEATURED_PRODUCTS.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            5. БРЭНДИЙН ТҮҮХ БАННЕР
        ══════════════════════════════════ */}
        <section
          className="py-20 px-4 bg-foreground text-white"
          aria-labelledby="brand-story-heading"
        >
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-6">
              Манай гүн ухаан
            </p>
            <h2
              id="brand-story-heading"
              className="text-4xl md:text-6xl leading-tight mb-8"
            >
              &ldquo;Жинхэнэ гоо сайхан нь
              <br />
              <em className="italic">арьсны эрүүл мэндээс</em>
              <br />
              эхэлдэг.&rdquo;
            </h2>
            <Separator className="bg-white/10 max-w-xs mx-auto mb-8" />
            <p className="text-sm text-white/50 leading-relaxed max-w-xl mx-auto">
              Бид дэлхийд танигдсан, үр дүн нь батлагдсан шилдэг арьс арчилгааны брэндүүдийг 
              Монголдоо албан ёсны эрхтэйгээр импортлон борлуулдаг бөгөөд танд зөвхөн 
              баталгаатай, оригинал бүтээгдэхүүнүүдийг санал болгодог.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-10 rounded-full border border-white text-white bg-transparent hover:bg-white! hover:text-black! px-10 py-6 text-xs tracking-[0.3em] uppercase transition-colors duration-300"
            >
              <Link href="/about">Бидний тухай</Link>
            </Button>
          </div>
        </section>



        {/* ══════════════════════════════════
            7. СЭТГЭГДЛҮҮД
        ══════════════════════════════════ */}
        <TestimonialsSection />

        {/* ══════════════════════════════════
            8. САЛБАРУУД
        ══════════════════════════════════ */}
        <BranchesSection />
      </main>

      <Footer />
    </>
  );
}
