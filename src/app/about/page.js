// ── app/about/page.js ─────────────────────────────────────────────────────────
// Энэ файлын үүрэг:
//   AURA SKIN брэндийн танилцуулгын хуудас (/about).
//   Hero гарчиг, зорилго, үнэт зүйлс, баг хамт олон, CTA хэсгийг нэгтгэнэ.
//   Server Component (use client байхгүй) → серверт HTML бэлдэж илгээнэ.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// BadgeCheck: баталгааны тэмдэг | ShieldCheck: хамгаалал | Sparkles: гэрэл | Truck: хүргэлт
import { BadgeCheck, ShieldCheck, Sparkles, Truck, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── ҮНЭТ ЗҮЙЛСИЙН ЖАГСААЛТ ────────────────────────────────────────────────────
// "Яагаад биднийг сонгох вэ?" хэсэгт 4 карт болгон харагдана.
// icon: JSX компонент (капитал үсгийг icon: Icon байдлаар задалж авна)
const VALUES = [
  {
    icon: BadgeCheck,
    title: "100% Баталгаат оригинал",
    desc: "Бид бүх бүтээгдэхүүнээ албан ёсны эрхтэй дистрибьютер болон үйлдвэрлэгчээс нь шууд татан авдаг тул хуурамч бараа худалдаалахгүй.",
  },
  {
    icon: ShieldCheck,
    title: "Мэргэжилтнүүдийн сонголт",
    desc: "Манайд худалдаалагдаж буй бүх брэнд дэлхийн шилдэг арьсны эмч нарын хүлээн зөвшөөрсөн бүтээгдэхүүнүүд байдаг.",
  },
  {
    icon: Sparkles,
    title: "Шилдэг брэндүүд нэг дор",
    desc: "COSRX, La Roche-Posay, The Ordinary зэрэг дэлхийд танигдсан шилдэг брэндүүдийг нэг дороос авах боломжтой.",
  },
  {
    icon: Truck,
    title: "Найдвартай хүргэлт",
    desc: "Улаанбаатар хот дотор 24 цагийн дотор, орон нутагт 3-5 хоногт найдвартай, түргэн шуурхай хүргэнэ.",
  },
];

// ── БАГИЙН ГИШҮҮДИЙН ЖАГСААЛТ ─────────────────────────────────────────────────
// initials: зурагны оронд нэрийн товчлолыг дугуй хайрцагт харуулна
const TEAM = [
  { name: "Дулмаа Цэрэн",   role: "Үүсгэн байгуулагч & CEO",         initials: "ДЦ" },
  { name: "Болд Ганбаатар", role: "Брэндийн менежер",                initials: "БГ" },
  { name: "Оюунаа Нэргүй",  role: "Арьс эмч, зөвлөх",               initials: "ОН" },
  { name: "Тэнгис Батаа",   role: "Бүтээгдэхүүн хариуцсан менежер", initials: "ТБ" },
];

// SEO мета мэдээлэл — Next.js автоматаар <head> дотор оруулна
export const metadata = {
  title: "Бидний тухай — AURA SKIN",
  description: "AURA SKIN-ийн тухай. Манай зорилго, үнэт зүйлс, баг.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* 1. HERO — харанхуй дэвсгэртэй гарчиг */}
        <section className="bg-zinc-900 dark:bg-zinc-950 text-white py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs tracking-[0.4em] uppercase text-white/40 mb-4">Бидний тухай</p>
            {/* <em>: italic хэлбэрийн онцолсон текст */}
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
              Арьс арчилгааны
              <br />
              <em className="italic font-light">шинэ стандартыг тогтооно</em>
            </h1>
            <p className="text-base text-white/60 leading-relaxed max-w-xl mx-auto">
              AURA SKIN нь 2026 онд үүсгэн байгуулагдсан бөгөөд дэлхийд танигдсан, үр дүн нь батлагдсан шилдэг арьс арчилгааны брэндүүдийг Монголын хэрэглэгчиддээ албан ёсны эрхтэйгээр, найдвартай хүргэх зорилготой дэлгүүр юм.
            </p>
          </div>
        </section>

        {/* 2. ЗОРИЛГЫН ХЭСЭГ — текст + тоон үзүүлэлтүүд */}
        {/* lg:grid-cols-2: том дэлгэцэнд 2 баганатай (зүүн текст, баруун тоо) */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Зүүн тал */}
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4">Манай зорилго</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-6">
                Жинхэнэ гоо сайхан нь
                <br />
                арьсны эрүүл мэндээс эхэлдэг
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Бид дэлхийн шилдэг арьс арчилгааны брэндүүдийг нэг дор төвлөрүүлж, хэрэглэгчиддээ зөвхөн 100% оригинал, үр дүнтэй бүтээгдэхүүнийг санал болгохыг зорьдог. Бидний сонгосон брэнд бүр олон улсын чанарын өндөр шаардлага хангасан, клиник туршилтаар батлагдсан байдаг.
              </p>
              <Button asChild className="rounded-full px-8 gap-2">
                <Link href="/products">Бүтээгдэхүүн үзэх <ArrowRight size={14} /></Link>
              </Button>
            </div>

            {/* Баруун тал: 4 тоон үзүүлэлт (2×2 grid) */}
            <div className="grid grid-cols-2 gap-4">
              {/* { num, label } → объектоос задалж авна */}
              {[
                { num: "40+",   label: "Бүтээгдэхүүн" },
                { num: "10K+", label: "Байнгын үйлчлүүлэгч" },
                { num: "4.9★", label: "Дундаж үнэлгээ" },
                { num: "12+",  label: "Дэлхийн брэнд" },
              ].map(({ num, label }) => (
                <div key={label} className="bg-muted/30 rounded-2xl p-6 text-center">
                  <p className="text-3xl font-bold text-foreground">{num}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* 3. ҮНЭТ ЗҮЙЛСИЙН ХЭСЭГ — 4 карт */}
        <section className="py-20 px-4 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">Манай үнэт зүйлс</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground">Яагаад биднийг сонгох вэ?</h2>
            </div>
            {/* Утасны дэлгэцэнд 1, дунд 2, том 4 баганатай */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* icon: Icon → задлан авсны дараа <Icon /> гэж дуудна */}
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                  {/* Icon-ийн дугуй хайрцаг */}
                  <div className="w-10 h-10 bg-zinc-800 dark:bg-zinc-700 rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. БАГИ ХАМТ ОЛНЫ ХЭСЭГ */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">Манай баг</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground">Бидний баг хамт олон</h2>
            </div>
            {/* 2×2 (утас) → 4 (том дэлгэц) баганатай */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {TEAM.map(({ name, role, initials }) => (
                <div key={name} className="text-center p-6 bg-muted/20 rounded-2xl border border-border/40 hover:border-border transition-colors">
                  {/* Нэрийн товчлол бүхий дугуй avatar — mx-auto: голд тэнцүүлнэ */}
                  <div className="w-16 h-16 rounded-full bg-foreground text-background text-lg font-bold flex items-center justify-center mx-auto mb-4">
                    {initials}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. CTA ХЭСЭГ — дуудлага (Call To Action) */}
        <section className="py-24 px-4 bg-zinc-900 dark:bg-zinc-950 text-white text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <Sparkles size={24} className="mb-6 text-white/40" />
            <p className="text-xs tracking-[0.4em] uppercase text-white/50 mb-4">Таны арьсанд хэрэгтэй бүхэн</p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-6 leading-tight">
              AURA SKIN-тэй хамт
              <br />
              {/* text-white/60: бага зэрэг бүдэг цагаан */}
              <span className="text-white/60">гоо сайхнаа тодотго</span>
            </h2>
            <p className="text-sm text-white/60 mb-10 max-w-md mx-auto leading-relaxed">
              Өөрийн арьсанд хамгийн сайн, чанартай бүтээгдэхүүнийг сонгоорой.
            </p>
            {/* variant="secondary": цайвар товч — харанхуй дэвсгэр дээр тод харагдана */}
            <Button asChild variant="secondary" className="rounded-full px-10">
              <Link href="/products">Бүтээгдэхүүн</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
