import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShoppingBag, MapPin, Plus } from 'lucide-react';
import IlanEkleFormu from '@/components/IlanEkleFormu'; // YENİ BİLEŞEN

export const revalidate = 0;

export default async function TakasPage({ searchParams }: { searchParams: { ekle?: string } }) {
  const cookieStore = await cookies();
  const modalAcik = searchParams.ekle === 'true'; // ?ekle=true ise modal açılır

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
           try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: urunler } = await supabase
    .from('urunler')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
        
        {/* Header */}
        <header className="bg-white p-6 sticky top-0 z-10 shadow-sm border-b border-gray-100 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-blue-600" /> Bebek Pazarı
                </h1>
                <p className="text-xs text-gray-500">İhtiyaç fazlasını sat, eksiklerini tamamla.</p>
            </div>
            {/* Ekle Butonu (URL query ile modalı açar) */}
            <a href="/takas?ekle=true" className="bg-blue-600 text-white p-2.5 rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-transform active:scale-95">
                <Plus className="w-5 h-5" />
            </a>
        </header>

        {/* Ürün Listesi */}
        <div className="p-4 grid grid-cols-2 gap-4">
            {urunler?.map((urun) => (
                <div key={urun.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                    <div className="h-32 overflow-hidden relative">
                        <img src={urun.resim_url} alt={urun.baslik} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                            {urun.sehir}
                        </span>
                    </div>
                    <div className="p-3">
                        <h3 className="font-bold text-gray-800 text-sm truncate">{urun.baslik}</h3>
                        <p className="text-blue-600 font-bold text-sm mt-1">{urun.fiyat} ₺</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                            <MapPin className="w-3 h-3" /> {urun.ilce}
                        </div>
                    </div>
                </div>
            ))}
            {(!urunler || urunler.length === 0) && <div className="col-span-2 text-center py-10 text-gray-400 text-sm">Henüz ilan yok.</div>}
        </div>

        {/* --- İLAN EKLEME MODALI --- */}
        {modalAcik && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white w-full max-w-md rounded-3xl p-6 relative animate-in slide-in-from-bottom-10 duration-300">
                    <a href="/takas" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">X</a>
                    <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Yeni İlan Ekle</h2>
                    
                    {/* Form Bileşeni */}
                    <IlanEkleFormu />
                </div>
            </div>
        )}

    </main>
  );
}