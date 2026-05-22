// Энэ файлын үүрэг:
//   "/" хаягт харагдах нүүр хуудас.
//   Hero зураг, брэндийн урсдаг ticker, ангиллууд, онцлох бараа,
//   брэндийн түүх, сэтгэгдэл, салбарын мэдээллийг нэгтгэнэ.
//
//   Server Component (use client байхгүй) → серверт HTML-ийг бэлдэж илгээнэ.
//   Энэ нь SEO-д маш сайн: Google хуудасны агуулгыг шууд уншина.

// Next.js-ийн оптимизаци хийгдсэн зураг, холбоос компонентууд
import Image from "next/image";
import Link from "next/link";

// shadcn/ui товч болон зааглагч компонентууд
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ArrowRight: → дүрс (icon)
import { ArrowRight } from "lucide-react";

// Дахин ашиглагдах компонентуудыг import хийнэ
import Navbar               from "@/components/Navbar";
import Footer               from "@/components/Footer";
import BranchesSection      from "@/components/BranchesSection";
import MarqueeTicker        from "@/components/MarqueeTicker";
import FeaturedProducts     from "@/components/FeaturedProducts";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title:       "Нүүр хуудас",
  description: "AURA SKIN — Монголын тэргүүлэх арьс арчилгааны дэлгүүр. COSRX, La Roche-Posay, CeraVe зэрэг 100% оригинал бүтээгдэхүүн.",
  path:        "/",
});

// Нүүр хуудасны ангиллын дугуй зурагт холбоосуудын жагсаалт
const HOME_CATEGORIES = [
  { label: "Сэрум",              href: "/products?cat=serum",        image: "/product1.png" },
  { label: "Чийгшүүлэгч",       href: "/products?cat=moisturizer",  image: "/product2.png" },
  { label: "Цэвэрлэгч",         href: "/products?cat=cleanser",     image: "/product3.png" },
  { label: "Тоник",              href: "/products?cat=toner",        image: "/product4.png" },
  { label: "Маск",               href: "/products?cat=mask",         image: "/mask.png" },
  { label: "Нарнаас хамгаалах", href: "/products?cat=suncare",      image: "/suncare.png" },
];

// HomePage компонент
export default function HomePage() {
  return (
    // React Fragment: нэмэлт div тэггүйгээр хэд хэдэн элемент буцаана
    <>
      <Navbar />

      <main>
        
        {/* 1. HERO ХЭСЭГ — дэлгэц дүүрэн арын зурагтай эхлэлийн хэсэг     */}
        
        {/* min-h-screen: дэлгэцийн бүрэн өндрийг эзэлнэ */}
        {/* items-end pb-20: агуулгыг доод хэсэгт байрлуулна */}
        <section
          className="relative min-h-screen flex items-end pb-20 md:pb-32"
          aria-labelledby="hero-heading"
        >
          {/* ── АРЫН ЗУРАГНЫ ДАВХАРГА ── */}
          {/* absolute inset-0: parent-ийн хэмжээг бүрэн дүүргэнэ */}
          <div className="absolute inset-0">
            {/* fill: parent div-ийн хэмжээг дүүргэнэ */}
            {/* priority: эхний дэлгэцэнд харагдах тул хамгийн түрүүнд ачаална */}
            {/* object-cover: зураг хажуугийн харьцаагаа алдалгүй дэлгэц дүүргэнэ */}
            <Image
              src="/hero.png"
              alt="AURA SKIN — Арьсны гоо сайхан"
              fill
              sizes="100vw"
              priority
              className="object-cover object-center"
            />
            {/* Зүүн талын градиент: текст уншигдахуйц болгоно */}
            <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
            {/* Доод хэсгийн градиент: зурагтай агуулгын хооронд зөөлрүүлэнэ */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/50 to-transparent" />
          </div>

          {/* ── ТЕКСТИЙН АГУУЛГА ── */}
          {/* z-10: арын зурагны давхаргын дээгүүр харагдана */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              {/* id="hero-heading": aria-labelledby-тай холбоно → accessibility */}
              {/* animate-fade-up: globals.css-д тодорхойлсон доороос дээш гарах animation */}
              <h1
                id="hero-heading"
                className="text-4xl sm:text-4xl md:text-5xl text-white leading-tight mb-6 animate-fade-up animation-delay-100"
              >
                Таны арьс
                <br />
                {/* <em> italic хэлбэрийн текст → онцлон харуулна */}
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

              {/* Товчлуурын бүлэг */}
              <div className="flex flex-wrap gap-4 animate-fade-up animation-delay-300">
                {/* asChild: Button-ийн стилийг Link-д "өгнө" */}
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

              {/* ── ТООН ҮЗҮҮЛЭЛТҮҮД (социал нотлогдохуй) ── */}
              {/* .map() ашиглан давтагдсан бүтэцтэй элементүүдийг богино кодоор үүсгэнэ */}
              <div className="flex gap-8 mt-12 animate-fade-up animation-delay-400">
                {[
                  { num: "12K+", label: "Үйлчлүүлэгч" },
                  { num: "98%",  label: "Сэтгэл ханамж" },
                  { num: "40+",  label: "Бүтээгдэхүүн" },
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

        
        {/* 2. УРСДАГ БРЭНДИЙН TICKER                                        */}
        <MarqueeTicker />

        {/* 3. АНГИЛЛЫН ДУГУЙ ЗУРАГТ ХОЛБООСУУД                              */}
        <section className="py-20 px-4 bg-background" aria-labelledby="categories-heading">
          <div className="max-w-7xl mx-auto">
            {/* Утасны дэлгэцэнд 2, дунд 3, том 6 баганатай grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {HOME_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  // hover:-translate-y-1: hover дээр дээш бага зэрэг "хөвнө"
                  className="group flex flex-col items-center gap-3 transition-transform hover:-translate-y-1"
                  aria-label={`${cat.label} ангилал`}
                >
                  {/* Дугуй зурагт хэсэг */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-muted/30 border border-border group-hover:border-foreground transition-colors">
                    {/* scale-110: hover дээр зураг томрох */}
                    <Image
                      src={cat.image}
                      alt={cat.label}
                      fill
                      sizes="(max-width: 640px) 56px, 64px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  {/* Ангиллын нэр */}
                  <span className="text-[10px] tracking-[0.15em] uppercase text-foreground/70 group-hover:text-foreground transition-colors text-center font-medium leading-tight">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        
        {/* 4. ОНЦЛОХ БАРАА (8 бараа grid байдлаар бодит API-аас татах) */}
        <FeaturedProducts />

        
        {/* 5. БРЭНДИЙН ҮЗЭЛ БАРИМТЛАЛЫН БАННЕР (харанхуй дэвсгэртэй) */}
        <section
          className="py-20 px-4 bg-zinc-900 dark:bg-zinc-950 text-white"
          aria-labelledby="brand-story-heading"
        >
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-6">
              Манай гүн ухаан
            </p>
            <h2 id="brand-story-heading" className="text-4xl md:text-6xl leading-tight mb-8">
              &ldquo;Жинхэнэ гоо сайхан нь
              <br />
              <em className="italic">арьсны эрүүл мэндээс</em>
              <br />
              эхэлдэг.&rdquo;
            </h2>
            {/* Separator: хэвтээ зааглагч шугам */}
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

        
        {/* 6. САЛБАР ДЭЛГҮҮРҮҮД */}
        <BranchesSection />
      </main>

      <Footer />
    </>
  );
}
