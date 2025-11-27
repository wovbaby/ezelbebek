import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LogOut, Clock, RefreshCw } from 'lucide-react';

export const revalidate = 0;

// --- ÇIKIŞ YAPMA İŞLEMİ (Server Action) ---
// Bu fonksiyon oturumu kapatır ve Login sayfasına yönlendirir.
async function cikisYap() {
  'use server'
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
  
  await supabase.auth.signOut();
  redirect('/login');
}

export default async function BeklemedePage() {
  // Sayfa her açıldığında: "Acaba onaylandım mı?" diye kontrol et.
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll() { return cookieStore.getAll() } },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
      const { data: profil } = await supabase.from('profiles').select('onayli_mi').eq('id', user.id).single();
      // Eğer Admin onay verdiyse, kullanıcıyı otomatik içeri al!
      if (profil && profil.onayli_mi) {
          redirect('/'); 
      }
  } else {
      // Kullanıcı yoksa zaten login'e gitmeli
      redirect('/login');
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Clock className="w-12 h-12 text-orange-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Hesabınız İnceleniyor</h1>
        
        <p className="text-gray-600 text-sm mb-8 max-w-md leading-relaxed">
            Güvenliğimiz için yeni üyelikleri yönetici onayından geçiriyoruz.<br/>
            Hesabınız onaylandığında bu sayfayı yenileyerek giriş yapabilirsiniz.
        </p>
        
        <div className="flex flex-col gap-3 w-full max-w-xs">
            {/* 1. Durumu Kontrol Et Butonu (Sayfayı yeniler) */}
            <a href="/beklemede" className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4" /> Durumu Kontrol Et
            </a>

            {/* 2. Çıkış Yap Butonu (Oturumu Kapatır -> Döngüyü Kırar) */}
            <form action={cikisYap} className="w-full">
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-200 active:scale-95">
                    <LogOut className="w-4 h-4" /> Çıkış Yap / Giriş Ekranı
                </button>
            </form>
        </div>
    </div>
  );
}