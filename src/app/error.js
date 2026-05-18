"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Бодит төсөл дээр алдааг Sentry зэрэг систем рүү илгээж болно
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
