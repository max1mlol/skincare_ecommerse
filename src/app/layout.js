import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SearchPalette } from "@/components/SearchPalette";

// Root layout нь бүх хуудсанд нийтлэг фонт, global style, context-уудыг залгаж өгдөг.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AURA SKIN — Арьс Засах Тэргүүлэх Брэнд",
  description:
    "Монголын тэргүүлэх арьсны арчилгааны дэлгүүр. Байгалийн гаралтай, шинжлэх ухааны үндэстэй бүтээгдэхүүнүүд.",
  keywords: "skincare, арьс засал, нүүрний тос, сэрум, Монгол",
};

// App Router-ийн үндсэн wrapper тул html болон body тагийг энд заавал буцаана.
export default function RootLayout({ children }) {
  return (
    <html
      lang="mn"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CartProvider>
          <SearchPalette />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
