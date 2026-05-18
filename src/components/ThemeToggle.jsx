// Энэ файлын үүрэг:
//   Navbar-ийн баруун талд харагдах нар / сар дүрстэй товчлуур.
//   Дарахад "цайвар горим" болон "харанхуй горим" хооронд шилжинэ.
// ─────────────────────────────────────────────────────────────────────────────

// "use client" — React hook-уудыг ашиглахын тулд заавал байх ёстой тэмдэглэгээ.
"use client";

// useTheme: next-themes сангаас одоогийн theme-ийг унших болон өөрчлөх hook.
import { useTheme } from "next-themes";

// useSyncExternalStore: React 18-д нэмэгдсэн hook.
// Server (SSR) болон Client (browser) талын зөрүүг аюулгүй шалгахад ашиглана.
// useState + useEffect хэрэглэхгүй тул "set-state-in-effect" lint алдаа гарахгүй.
import { useSyncExternalStore } from "react";

// Moon, Sun: lucide-react сангийн SVG дүрсүүд (icon).
import { Moon, Sun } from "lucide-react";

// Button: төслийн UI сангаас дахин ашиглах боломжтой товчлуурын компонент.
import { Button } from "@/components/ui/button";

// subscribe: useSyncExternalStore-ийн 1-р аргумент.
// Энэ hook-т "гадаад өөрчлөлтийг сонсох" механизм шаардлагатай боловч
// бид зөвхөн клиент талд гарсан эсэхийг нэг удаа шалгах тул хоосон функц буцаана.
function subscribe() {
  return () => {};
}

// ThemeToggle компонент.
// className — гаднаас нэмэлт CSS класс дамжуулах боломж олгоно (default нь хоосон тэмдэг).
export function ThemeToggle({ className = "" }) {
  // useTheme hook-оос гурван утга авна:
  //   setTheme     → горимыг өөрчлөх функц
  //   resolvedTheme→ "system" сонгосон үед системийн бодит горимыг тодорхойлно
  const { setTheme, resolvedTheme } = useTheme();

  // useSyncExternalStore ашиглан клиент талд гарсан эсэхийг тодорхойлно.
  //   - 2-р аргумент (клиент snapshot): () => true  → browser дээр үргэлж true
  //   - 3-р аргумент (сервер snapshot): () => false → SSR дээр false буцаана
  // Ингэснээр hydration mismatch алдаа гарахгүй бөгөөд useEffect/setState шаардахгүй.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  // Дэлгэцэнд гараагүй байх үед хоосон хайрцаг буцаана (icon байршлыг барьж байхад).
  // SSR үед горимыг мэдэхгүй тул icon харуулахгүй байна.
  if (!mounted) return <div className="w-8 h-8" />;

  // resolvedTheme === "dark" бол isDark нь true болно.
  // Ингэснээр аль icon харуулах, аль горимд шилжих вэ гэдгийг шийдэнэ.
  const isDark = resolvedTheme === "dark";

  return (
    // Button компонент — variant="ghost" нь арын өнгөгүй (ил харагдах) хувилбар.
    // size="icon" нь дөрвөлжин хэлбэртэй жижиг хэмжээ.
    // onClick: дарахад харанхуй горим байвал цайвар, эсвэл харанхуй руу шилжинэ.
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Цайвар горим" : "Харанхуй горим"}
      className={`h-8 w-8 ${className}`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* Харанхуй горимд нар (Sun) icon, цайвар горимд сар (Moon) icon харуулна */}
      {isDark ? (
        <Sun className="h-4 w-4 transition-all" />
      ) : (
        <Moon className="h-4 w-4 transition-all" />
      )}
    </Button>
  );
}
