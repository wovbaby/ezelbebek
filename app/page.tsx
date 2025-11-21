import { supabase } from '@/lib/supabaseClient';
import { Baby, Utensils, Moon, Wind } from 'lucide-react';
import HizliIslem from '@/components/HizliIslem';
import BebekSecici from '@/components/BebekSecici'; // Yeni bileşen
import { cookies } from 'next/headers';

export const revalidate = 0;

export default async function Home() {
  // 1. Cookie'den Seçili ID'yi Al
  const cookieStore = await cookies();
  const seciliId = Number(cookieStore.get('secili_bebek')?.value) || 0;

  // 2. Tüm Bebekleri Çek (Seçicide listelemek için)
  const { data: tumBebekler } = await supabase.from('bebekler').select('id, ad, resim_url');

  // Eğer cookie yoksa veya hatalıysa ilk bebeği seçili yap
  const aktifId = (seciliId && tumBebekler?.find(b => b.id === seciliId)) ? seciliId : tumBebekler?.[0]?.id;

  // 3. Seçili Bebeğin Aktivitelerini Çek
  const { data: aktiviteler } = await supabase
    .from('aktiviteler')
    .select('*')
    .eq('bebek_id', aktifId) // SADECE SEÇİLİ BEBEK
    .order('created_at', { ascending: false })
    .limit(10);

  const seciliBebek = tumBebekler?.find(b => b.id === aktifId);

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-blue-600 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-blue-100 text-sm font-medium">Hoş Geldin</h2>
            
            {/* BEBEK SEÇİCİ BURADA */}
            <div className="mt-1">
                <BebekSecici bebekler={tumBebekler || []} seciliId={aktifId} />
            </div>
          </div>
          
          <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm border border-white/30 shadow-sm">
            {seciliBebek?.resim_url ? (
                <img src={seciliBebek.resim_url} className="w-12 h-12 rounded-full object-cover" />
            ) : (
                <div className="w-12 h-12 flex items-center justify-center"><Baby className="w-7 h-7 text-white" /></div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 px-6 -mt-8 z-20 relative">
        <HizliIslem />
        {/* Liste kodları aynen kalıyor... */}
        <div className="mb-24">
             <h3 className="text-gray-800 font-bold text-lg mb-3">Son Hareketler ({seciliBebek?.ad})</h3>
             {/* ... Liste döngüsü (aktiviteler.map) ... */}
             {/* Önceki kodun aynısını kullanabilirsin, sadece başlığı dinamik yaptım */}
             <div className="space-y-3">
                {aktiviteler?.map((islem) => (
                    <div key={islem.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        {/* ... liste içeriği ... */}
                        <div>
                            <p className="text-sm font-bold text-gray-800 capitalize">{islem.tip}</p>
                            <p className="text-xs text-gray-500">{islem.detay}</p>
                        </div>
                        <span className="ml-auto text-[10px] text-gray-400">
                            {new Date(islem.created_at).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                ))}
             </div>
        </div>
      </div>
    </main>
  );
}