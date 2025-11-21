import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import OneSignalInit from "@/components/OneSignalInit"; // YENİ

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ezel Bebek",
  description: "Bebek Gelişim, Takip ve Takas Platformu",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ezel Bebek",
    startupImage: [],
  },
  icons: {
    icon: "/icon.png", 
    apple: "/icon.png", 
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-50`}>
        
        {/* BİLDİRİM SİSTEMİNİ BAŞLAT */}
        <OneSignalInit />

        <div className="max-w-md mx-auto min-h-screen bg-white shadow-md relative pb-24">
           {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}