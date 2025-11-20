import { supabase } from '@/lib/supabaseClient';
import { ShoppingBag, Plus, MapPin } from 'lucide-react';
import KonumFiltre from '@/components/KonumFiltre';
import Link from 'next/link';

// Sayfanın her seferinde güncel veriyi çekmesini sağlar
export const revalidate = 0;

// Next.js 15 için Props tipi tanımı
type Props = {
  searchParams: Promise<{ sehir?: string }>
}

// Ana Sayfa Bileşeni
export default async function TakasPage(props: Props) {
  // Next.js 15'te searchParams'ı await ile beklemek zorunludur
  const searchParams = await props.searchParams;
  const sehir = searchParams?.sehir;

  // Veritabanı Sorgusu
  let query = supabase
    .from('urunler')
    .select('*')
    .order('created_at', { ascending: false });

  // Şehir filtresi varsa sorguya ekle
  if (sehir) {
    query = query.eq('sehir', sehir);
  }

  const { data: urunler } = await query;

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
        
        <header className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-purple-600" />
                    Pazar Yeri
                </h1>
                <p className="text-xs text-gray-500">
                    {sehir ? `${sehir} Vitrini` : 'Tüm İlanlar'}
                </p>
            </div>
            
            {/* DÜZELTME: Butonu Link içine aldık, artık çalışır */}
            <Link href="/takas/ekle">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg active:scale-95 transition-transform">
                    <Plus className="w-4 h-4" />
                    İlan Ver
                </button>
            </Link>
        </header>

        <div className="p-4">
            {/* Filtre Bileşeni */}
            <KonumFiltre />

            {/* Ürün Listesi */}
            <div className="grid grid-cols-2 gap-4">
                {urunler?.map((urun) => (
                    <div key={urun.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col">
                        
                        {/* Resim Alanı */}
                        <div className="relative h-40 w-full bg-gray-200">
                            {urun.resim_url ? (
                                <img src={urun.resim_url} alt={urun.baslik} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">Resim Yok</div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-md">
                                {urun.fiyat}
                            </div>
                        </div>

                        {/* Bilgiler */}
                        <div className="p-3 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-800 text-sm truncate">{urun.baslik}</h3>
                            
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1 mb-2">
                                <MapPin className="w-3 h-3 text-purple-500" />
                                {urun.sehir || 'Şehir Yok'}
                            </div>

                            <div className="mt-auto">
                                <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md mb-2 inline-block">
                                    {urun.kategori}
                                </span>
                                <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded-lg border border-gray-200">
                                    İncele
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Boş Durum */}
            {(!urunler || urunler.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-200 mb-3" />
                    <p className="text-gray-500 font-medium">Bu şehirde hiç ürün yok.</p>
                    <p className="text-xs text-gray-400 mt-1">Filtreyi temizleyip diğerlerine bakabilirsin.</p>
                </div>
            )}
        </div>
    </main>
  );
}