// layout.js: Вэбсайтын бүх хуудсанд нийтлэг ашиглагдах үндсэн бүтэц (Root Layout).
// Энд фонт, глобал CSS загвар, хэрэглэгчийн сесс болон сагсны контекст (Provider), хайлтын системд зориулсан мета өгөгдлүүд тодорхойлогдоно.
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider }    from "@/context/CartContext";
import { SessionProvider } from "@/context/SessionContext";
import { ThemeProvider }   from "@/components/ThemeProvider";
import { SearchPalette }   from "@/components/SearchPalette";
import { TooltipProvider } from "@/components/ui/tooltip";

// Google fonts-оос Geist болон Geist Mono фонтуудыг ачаалах
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Вэбсайтын SEO болон олон нийтийн сүлжээнд харагдах мета мэдээллүүд
export const metadata = {
  metadataBase: new URL("https://auraskin.mn"),
  title: {
    default:  "AURA SKIN — Монголын Арьс Арчилгааны Дэлгүүр",
    template: "%s | AURA SKIN",
  },
  description: "Монголын тэргүүлэх арьсны арчилгааны дэлгүүр. COSRX, La Roche-Posay, CeraVe — 100% оригинал бараа.",
  keywords:    ["skincare", "арьс засал", "нүүрний тос", "сэрум", "COSRX", "Монгол"],
  openGraph: {
    type:        "website",
    locale:      "mn_MN",
    url:         "https://auraskin.mn",
    siteName:    "AURA SKIN",
    title:       "AURA SKIN — Монголын Арьс Арчилгааны Дэлгүүр",
    description: "Дэлхийн шилдэг арьс арчилгааны брэндүүд нэг дороос. 100% оригинал.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "AURA SKIN" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "AURA SKIN — Монголын Арьс Арчилгааны Дэлгүүр",
    description: "Дэлхийн шилдэг арьс арчилгааны брэндүүд нэг дороос.",
    images:      ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mn" data-scroll-behavior="smooth" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* ThemeProvider: Цайвар/Харанхуй горим солигч */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* SessionProvider: Хэрэглэгч нэвтэрсэн эсэхийг хянах сесс */}
          <SessionProvider>
            {/* CartProvider: Сагсны мэдээлэл болон үйлдлийг удирдах */}
            <CartProvider>
              {/* SearchPalette: "/" товчоор нээгдэх глобал хайлт */}
              <SearchPalette />
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </CartProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
