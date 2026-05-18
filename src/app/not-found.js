// ── not-found.js ─────────────────────────────────────────────────────────────
// Энэ файлын үүрэг:
//   Хэрэглэгч байхгүй URL хаягаар хандах үед харагдах 404 хуудас.
//   Next.js-ийн тусгай файл бөгөөд автоматаар дуудагддаг.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      {/* Дэлгэцийн голд байрлах 404 хэсэг */}
      <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-57px)] px-4">
        <div className="text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Арын фон дахь том 404 бичиг */}
          <p className="text-8xl font-bold text-foreground/10 select-none mb-2">404</p>
          
          <h1 className="text-2xl font-semibold text-foreground mb-2">Хуудас олдсонгүй</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Уучлаарай, таны хайж байсан хуудас устгагдсан, эсвэл хаяг нь буруу байна.
          </p>

          {/* Хэрэглэгчийг буцаах товчлуурууд */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="rounded-full px-8 shadow-md">
              <Link href="/">Нүүр хуудас</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-8">
              <Link href="/products">Бүтээгдэхүүн үзэх</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
