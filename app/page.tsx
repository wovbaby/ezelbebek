import { supabase } from '@/lib/supabaseClient';
import { Baby, Utensils, Moon, Wind } from 'lucide-react';
import HizliIslem from '@/components/HizliIslem';
import BebekSecici from '@/components/BebekSecici';
import { cookies } from 'next/headers';

export const revalidate = 0;

export default async function Home() {
  // 1. Verileri Çek
  const cookieStore = await cookies();
  const seciliId = Number(cookieStore.get('secili_bebek')?.value) || 0;
  const { data: tumBebekler } = await supabase.from('bebekler').select('id, ad, resim_url');
  
  // Aktif bebeği bul
  const aktifId = (seciliId && tumBebekler?.find(b => b.id === seciliId)) ? seciliId : tumBebekler?.[0]?.id;
  const seciliBebek = tumBebekler?.find(b => b.id === aktifId);

  // Logları çek
  const { data: aktiviteler } = await supabase
    .from('aktiviteler')
    .select('*')
    .eq('bebek_id', aktifId)
    .order('created_at', { ascending: false })
    .limit(20); // Daha fazla log gösterelim

  return (
    // h-screen ve overflow-hidden: Sayfanın tamamını ekrana sabitler
    <main className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      
      {/* --- SABİT ÜST BAR (HEADER) --- */}
      {/* z-40 verdik ki içerik kayarken bunun altından geçsin */}
      <header className="flex-none bg-blue-600 text-white pt-8 pb-10 px-6 rounded-b-[3rem] shadow-xl z-40 relative">
        
        <div className="flex flex-col items-center gap-4">
            
            {/* BEBEK SEÇİCİ (En Üstte) */}
            {/* z-50 vererek en üste çıkardık, menü açılınca altta kalmaz */}
            <div className="relative z-50">
                <BebekSecici bebekler={tumBebekler || []} seciliId={aktifId} />
            </div>

            {/* KOCAMAN PROFİL FOTOSU */}
            <div className="relative">
                <div className="w-24 h-24 rounded-full p-1 bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-lg">
                    {seciliBebek?.resim_url ? (
                        <img 
                            src={seciliBebek.resim_url} 
                            alt={seciliBebek.ad} 
                            className="w-full h-full rounded-full object-cover bg-white"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center text-blue-300">
                            <Baby className="w-12 h-12" />
                        </div>
                    )}
                </div>
                {/* Online Noktası Süsü (İsteğe bağlı) */}
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 border-2 border-blue-600 rounded-full"></div>
            </div>

            <div className="text-center">
                <h2 className="text-blue-100 text-xs font-medium uppercase tracking-widest">Hoş Geldin</h2>
                <h1 className="text-3xl font-bold tracking-wide mt-1">{seciliBebek?.ad || "Bebek"}</h1>
            </div>

        </div>
      </header>

      {/* --- KAYDIRILABİLİR İÇERİK ALANI --- */}
      {/* flex-1: Kalan boşluğu doldur */}
      {/* overflow-y-auto: Sadece bu kısım kaydırılsın */}
      <div className="flex-1 overflow-y-auto relative -mt-6 pt-6 pb-32 px-6 z-30 scrollbar-hide">
        
        {/* HIZLI İŞLEM BUTONLARI */}
        <HizliIslem />

        {/* CANLI LOG LİSTESİ */}
        <div className="mt-6">
            <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                Son Hareketler
                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Bugün</span>
            </h3>
            
            <div className="space-y-3">
                {aktiviteler?.map((islem) => {
                    let Icon = Baby;
                    let colorClass = "bg-gray-100 text-gray-600";
                    
                    if (islem.tip === 'mama') { Icon = Utensils; colorClass = "bg-orange-100 text-orange-600"; }
                    if (islem.tip === 'bez') { Icon = Wind; colorClass = "bg-blue-100 text-blue-600"; }
                    if (islem.tip === 'uyku') { Icon = Moon; colorClass = "bg-indigo-100 text-indigo-600"; }

                    return (
                        <div key={islem.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform active:scale-95">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                                <Icon className="w-6 h-6" /> 
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className="text-base font-bold text-gray-800 capitalize">{islem.tip}</p>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                        {new Date(islem.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium mt-0.5 truncate">
                                    {islem.detay || "Detay girilmedi"}
                                </p>
                            </div>
                        </div>
                    );
                })}
                
                {(!aktiviteler || aktiviteler.length === 0) && (
                    <div className="text-center py-12 opacity-50">
                        <Baby className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Henüz kayıt yok.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </main>
  );
}