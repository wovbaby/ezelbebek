import type { Metadata, Viewport } from "next"; // Viewport'u ekledik
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

// 1. PWA VE MOBİL AYARLARI (Metadata)
export const metadata: Metadata = {
  title: "Ezel Bebek",
  description: "Bebek Gelişim, Takip ve Takas Platformu",
  manifest: "/manifest.json", // Manifest dosyasını tanıttık
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ezel Bebek",
    startupImage: [],
  },
  icons: {
    icon: "/icon.png", // Tarayıcı sekmesi
    apple: "/icon.png", // iPhone ana ekranı
  },
};

// 2. EKRAN AYARLARI (Viewport)
// Bu ayar, mobilde inputlara tıklayınca ekranın zoom yapmasını engeller
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb", // Uygulamanın tema rengi (Mavi)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-50`}>
        
        {/* İçerik Alanı */}
        {/* pb-24: Alt menünün içeriği kapatmaması için boşluk */}
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-md relative pb-24">
           {children}
        </div>

        {/* Alt Menü Bileşeni */}
        <BottomNav />

      </body>
    </html>
  );
}