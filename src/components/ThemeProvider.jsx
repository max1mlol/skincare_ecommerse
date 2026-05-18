// ── ThemeProvider.jsx ────────────────────────────────────────────────────────
// Энэ файлын үүрэг:
//   "next-themes" сангийн ThemeProvider-ийг манай төслийн нэртэй болгон
//   боодог (wrapper) жижиг компонент.
//
// Яагаад хэрэгтэй вэ?
//   next-themes нь "цайвар горим / харанхуй горим" хооронд шилжих боломжийг
//   хангадаг. ThemeProvider-ийг layout.js дотор нэг удаа байрлуулснаар
//   вэбсайтын аль ч хуудас, аль ч компонентоос useTheme() дуудаж болно.
// ─────────────────────────────────────────────────────────────────────────────

// "use client" — browser талд ажиллах компонент гэсэн тэмдэглэгээ.
"use client";

// next-themes сангаас ThemeProvider-ийг import хийхдээ NextThemesProvider гэж
// өөрчлөн нэрлэж авна. Ингэснээр доор өөрийн ThemeProvider нэрийг ашиглахад
// нэрийн зөрчилдөөн гарахгүй.
import { ThemeProvider as NextThemesProvider } from "next-themes";

// ThemeProvider:
//   - children → доторх бүх компонентыг хүлээн авна.
//   - ...props  → layout.js-аас дамжуулсан бусад тохируулгуудыг (attribute,
//                 defaultTheme, enableSystem гэх мэт) шууд NextThemesProvider-т
//                 дамжуулна. "..." нь spread operator бөгөөд "бүх үлдсэн
//                 параметрийг нэгтгэ" гэсэн утгатай.
export function ThemeProvider({ children, ...props }) {
  // NextThemesProvider дотор children-ийг байрлуулж, ...props-ийг дамжуулж буцаана.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
