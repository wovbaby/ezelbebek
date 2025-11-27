import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShoppingBag, MapPin, Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import IlanEkleFormu from '@/components/IlanEkleFormu';
import KonumFiltre from '@/components/KonumFiltre';

export const revalidate = 0;

type Props = {
  searchParams: Promise<{ sehir?: string; ekle?: string }>
}

export default async function TakasPage(props: Props) {
  const cookieStore = await cookies();
  
  // Next.js 15: searchParams asenkron okunur
  const searchParams = await props.searchParams;
  const sehir = searchParams?.sehir || '';
  const modalAcik = searchParams?.ekle === 'true';

  // 1. Supabase Bağlantısı
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

  // 2. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 3. İlanları Çek
  let query = supabase
    .from('urunler')
    .select('*')
    .order('created_at', { ascending: false });

  if (sehir) {
    query = query.ilike('sehir', `%${sehir}%`);
  }

  const { data: urunler } = await query;

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
        
        {/* Header */}
        <header className="bg-white p-4 sticky top-0 z-10 shadow-sm border-b border-gray-100 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-purple-600" />
                    Bebek Pazarı
                </h1>
                <p className="text-xs text-gray-500">
                    {sehir ? `${sehir} Vitrini` : 'Tüm Türkiye'}
                </p>
            </div>
            
            {/* İlan Ver Butonu (Modal Açar) */}
            <Link 
                href={`/takas?${new URLSearchParams({ ...(sehir ? { sehir } : {}), ekle: 'true' }).toString()}`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg active:scale-95 transition-transform"
            >
                <Plus className="w-4 h-4" />
                İlan Ver
            </Link>
        </header>

        <div className="p-4">
            {/* Filtre */}
            <div className="mb-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Filter className="w-4 h-4" /> Konum Filtresi
                </div>
                <KonumFiltre /> 
            </div>

            {/* Liste */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {urunler?.map((urun) => (
                    <div key={urun.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col h-full">
                        <div className="relative h-36 w-full bg-gray-100">
                            {urun.resim_url ? (
                                <img src={urun.resim_url} alt={urun.baslik} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 text-xs">Görsel Yok</div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                                {urun.fiyat} ₺
                            </div>
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">{urun.baslik}</h3>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-auto pt-2">
                                <MapPin className="w-3 h-3 text-purple-500" />
                                <span className="truncate">{urun.sehir || 'Şehir Yok'} / {urun.ilce}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Boş Durum */}
            {(!urunler || urunler.length === 0) && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium text-sm">İlan bulunamadı.</p>
                    {sehir && <Link href="/takas" className="text-xs text-purple-600 mt-2 font-bold underline">Filtreyi Temizle</Link>}
                </div>
            )}
        </div>

        {/* --- MODAL (PENCERE) --- */}
        {modalAcik && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
                <Link href={`/takas${sehir ? `?sehir=${sehir}` : ''}`} className="absolute inset-0 z-0" />
                
                <div className="bg-white w-full max-w-md rounded-3xl p-6 relative z-10 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl max-h-[85vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-20 pb-2 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">Yeni İlan Ekle</h2>
                        <Link 
                            href={`/takas${sehir ? `?sehir=${sehir}` : ''}`} 
                            className="bg-gray-100 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <Plus className="w-5 h-5 text-gray-500 rotate-45" />
                        </Link>
                    </div>
                    
                    {/* Form Bileşeni */}
                    <IlanEkleFormu />
                </div>
            </div>
        )}
    </main>
  );
}