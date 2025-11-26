import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShoppingBag, MapPin, Plus } from 'lucide-react';
import Link from 'next/link';
import IlanEkleFormu from '@/components/IlanEkleFormu'; // Direct Upload Formu
import KonumFiltre from '@/components/KonumFiltre'; // Senin Şehir Filtren

export const revalidate = 0;

// Next.js 15 için Props Tipi
type Props = {
  searchParams: Promise<{ sehir?: string; ekle?: string }>
}

export default async function TakasPage(props: Props) {
  const cookieStore = await cookies();
  
  // Next.js 15: searchParams'ı await ile bekliyoruz
  const searchParams = await props.searchParams;
  const sehir = searchParams.sehir;
  const modalAcik = searchParams.ekle === 'true'; // ?ekle=true ise modal açılır

  // 1. Güvenli Supabase Client
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

  // 3. Veritabanı Sorgusu (Filtreli)
  let query = supabase
    .from('urunler')
    .select('*')
    .order('created_at', { ascending: false });

  // Eğer şehir seçiliyse filtrele
  if (sehir) {
    query = query.ilike('sehir', `%${sehir}%`); // Esnek arama (Büyük/Küçük harf)
  }

  const { data: urunler } = await query;

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
        
        {/* Header */}
        <header className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-purple-600" />
                    Bebek Pazarı
                </h1>
                <p className="text-xs text-gray-500">
                    {sehir ? `${sehir} Vitrini` : 'Tüm İlanlar'}
                </p>
            </div>
            
            {/* Ekle Butonu (Modal açar) */}
            {/* Mevcut filtreleri koruyarak ?ekle=true ekler */}
            <Link 
                href={`/takas?${new URLSearchParams({ ...(sehir ? { sehir } : {}), ekle: 'true' }).toString()}`}
                className="bg-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg active:scale-95 transition-transform"
            >
                <Plus className="w-4 h-4" />
                İlan Ver
            </Link>
        </header>

        <div className="p-4">
            {/* Konum Filtresi */}
            <div className="mb-4">
                <KonumFiltre />
            </div>

            {/* Ürün Listesi */}
            <div className="grid grid-cols-2 gap-4">
                {urunler?.map((urun) => (
                    <div key={urun.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col">
                        
                        {/* Resim Alanı */}
                        <div className="relative h-40 w-full bg-gray-100">
                            {urun.resim_url ? (
                                <img src={urun.resim_url} alt={urun.baslik} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 text-xs">Resim Yok</div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-md">
                                {urun.fiyat} ₺
                            </div>
                        </div>

                        {/* Bilgiler */}
                        <div className="p-3 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-800 text-sm truncate">{urun.baslik}</h3>
                            
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1 mb-2">
                                <MapPin className="w-3 h-3 text-purple-500" />
                                {urun.sehir || 'Şehir Yok'} / {urun.ilce}
                            </div>

                            <div className="mt-auto flex justify-between items-center">
                                <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md inline-block capitalize">
                                    {urun.kategori}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Boş Durum */}
            {(!urunler || urunler.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-gray-500 font-medium text-sm">Bu kriterlerde hiç ürün yok.</p>
                    {sehir && <Link href="/takas" className="text-xs text-purple-600 mt-2 underline">Filtreyi Temizle</Link>}
                </div>
            )}
        </div>

        {/* --- İLAN EKLEME MODALI (Direct Upload Formu İçerir) --- */}
        {modalAcik && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-md rounded-3xl p-6 relative animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
                    <Link 
                        href={`/takas${sehir ? `?sehir=${sehir}` : ''}`} 
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full"
                    >
                        <Plus className="w-5 h-5 rotate-45" />
                    </Link>
                    
                    <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">Yeni İlan Ekle</h2>
                    <p className="text-xs text-gray-400 text-center mb-6">Fotoğraf yükle ve detayları gir</p>
                    
                    {/* Direct Upload Form Bileşeni */}
                    <IlanEkleFormu />
                </div>
            </div>
        )}

    </main>
  );
}