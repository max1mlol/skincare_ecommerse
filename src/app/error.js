"use client";
// error.js: Глобал алдааны boundary.
// Энэ хуудас нь вэбсайтын алдааг хэрэглэгчид мэдээлэх, дахин ачааллах боломж олгоно.
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Алдааны мэдээллийг хөгжүүлэгчийн консол дээр хэвлэх (Бодит төсөлд Sentry руу илгээж болно)
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="w-16 h-16 text-destructive mb-6" />
      <h2 className="text-2xl font-bold tracking-tight mb-2">Уучлаарай, системд алдаа гарлаа!</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Ямар нэгэн санаандгүй алдаа гарсан байна. Та хуудсыг дахин ачааллана уу эсвэл хэсэг хугацааны дараа дахин оролдоно уу.
      </p>
      <div className="flex items-center gap-4">
        {/* reset() функц нь алдаа гарсан хуудсыг дахин зураглах (re-render) оролдлого хийнэ */}
        <Button onClick={() => reset()} variant="default">
          Дахин оролдох
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Нүүр хуудас руу буцах
        </Button>
      </div>
    </div>
  );
}
