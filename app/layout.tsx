import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

// 1. PWA VE MOBİL AYARLARI
export const metadata: Metadata = {
  title: "Ezel Bebek",
  description: "Bebek Gelişim, Takip ve Takas Platformu",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ezel Bebek",
  },
  icons: {
    icon: "/icon.png",  // ARTIK STANDART
    apple: "/icon.png", // ARTIK STANDART
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
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-md relative pb-24">
           {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}