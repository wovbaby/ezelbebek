import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import OneSignalInit from "@/components/OneSignalInit";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // --- GÜVENLİK VE MENÜ KONTROLÜ ---
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
      },
    }
  );

  // 1. Kullanıcıyı ve Profilini Kontrol Et
  const { data: { user } } = await supabase.auth.getUser();
  let onayliMi = false;

  if (user) {
      const { data: profil } = await supabase
        .from('profiles')
        .select('onayli_mi')
        .eq('id', user.id)
        .single();
      
      // Profil varsa ve onaylıysa true
      if (profil && profil.onayli_mi === true) {
          onayliMi = true;
      }
  }

  // 2. Menüyü Göster/Gizle Kararı
  // Sadece giriş yapmış VE onaylı kullanıcılar menüyü görebilir.
  const menuyuGoster = user && onayliMi;

  return (
    <html lang="tr">
      <body className={`${inter.className} bg-gray-50`}>
        
        {/* Bildirim Sistemi */}
        <OneSignalInit />

        <div className="max-w-md mx-auto min-h-screen bg-white shadow-md relative pb-24">
           {children}
        </div>

        {/* --- MENÜYÜ SADECE ONAYLIYSA GÖSTER --- */}
        {menuyuGoster && <BottomNav />}
      </body>
    </html>
  );
}