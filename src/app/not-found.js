import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Олдоогүй route дээр хэрэглэгчийг үндсэн хуудсууд руу буцаах fallback дэлгэц.
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-57px)] px-4">
        <div className="text-center max-w-md">
          <p className="text-8xl font-bold text-foreground/10 select-none mb-2">
            404
          </p>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Хуудас олдсонгүй
          </h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            Уучлаарай, таны хайж байсан хуудас устгагдсан, эсвэл байхгүй байна.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="rounded-full px-8">
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
