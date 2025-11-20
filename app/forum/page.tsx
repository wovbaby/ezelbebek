import { supabase } from '@/lib/supabaseClient';
import { MessageCircle, Search, Plus } from 'lucide-react';
import Link from 'next/link'; // Link bileşenini ekledik

export const revalidate = 0;

export default async function ForumPage() {
  const { data: konular } = await supabase
    .from('forum_konulari')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
        <header className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-green-500" />
                Yardımlaşma
            </h1>
            
            {/* Arama Kutusu */}
            <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Konu ara (örn: kolik, diş...)" className="w-full pl-9 p-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200" />
            </div>
        </header>

        <div className="p-4 space-y-3">
            
            {/* Konu Ekle Butonu - ARTIK LİNKE TIKLAYINCA GİDİYOR */}
            <Link href="/forum/sor" className="block">
                <button className="w-full bg-green-500 text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-200 active:scale-95 transition-transform">
                    <Plus className="w-5 h-5" />
                    Yeni Soru Sor
                </button>
            </Link>

            {/* Konular Listesi */}
            {konular?.map((konu) => (
                <div key={konu.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded-md">
                            {konu.kategori || 'Genel'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                             {new Date(konu.created_at).toLocaleDateString('tr-TR')}
                        </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{konu.baslik}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{konu.icerik}</p>
                    
                    <div className="mt-3 flex items-center gap-2 border-t border-gray-50 pt-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                            {konu.yazar_ad?.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-500">{konu.yazar_ad}</span>
                        <span className="ml-auto text-xs text-blue-500 font-medium">Yorum Yap →</span>
                    </div>
                </div>
            ))}
            
            {/* Liste Boşsa Gösterilecek Mesaj */}
            {(!konular || konular.length === 0) && (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                    <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Henüz hiç soru sorulmamış.</p>
                    <p className="text-xs text-green-600 font-medium mt-1">İlk soran sen ol!</p>
                </div>
            )}
        </div>
    </main>
  );
}