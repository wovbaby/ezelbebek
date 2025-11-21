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
  
  const aktifId = (seciliId && tumBebekler?.find(b => b.id === seciliId)) ? seciliId : tumBebekler?.[0]?.id;
  const seciliBebek = tumBebekler?.find(b => b.id === aktifId);

  const { data: aktiviteler } = await supabase
    .from('aktiviteler')
    .select('*')
    .eq('bebek_id', aktifId)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <main className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      
      {/* --- YENİ HEADER TASARIMI (Tam Ekran Resim) --- */}
      <header className="flex-none h-72 relative z-40 rounded-b-[3rem] overflow-hidden shadow-xl bg-blue-600">
        
        {/* 1. Arkaplan Resmi */}
        {seciliBebek?.resim_url ? (
            <img 
                src={seciliBebek.resim_url} 
                alt={seciliBebek.ad} 
                className="absolute inset-0 w-full h-full object-cover"
            />
        ) : (
            // Resim yoksa varsayılan desen
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Baby className="w-32 h-32 text-white/20" />
            </div>
        )}

        {/* 2. Karartma Katmanı (Yazılar okunsun diye) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* 3. İçerik (Bebek Seçici ve İsim) */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6">
            
            {/* Bebek Seçici (En üstte sağda dursun mu? Hayır, ortada kalsın) */}
            <div className="absolute top-6 right-6 z-50">
                 <BebekSecici bebekler={tumBebekler || []} seciliId={aktifId} />
            </div>

            <div className="text-center text-white z-10">
                <h2 className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">Hoş Geldin</h2>
                <h1 className="text-4xl font-bold tracking-tight drop-shadow-md">{seciliBebek?.ad || "Bebek"}</h1>
            </div>
        </div>
      </header>

      {/* --- İÇERİK ALANI --- */}
      <div className="flex-1 overflow-y-auto relative -mt-8 pt-8 pb-32 px-5 z-30 scrollbar-hide">
        
        {/* HIZLI İŞLEM (Biraz küçültülmüş hali) */}
        {/* scale-90 ile tüm bloğu %10 küçülttük */}
        <div className="scale-95 origin-top"> 
            <HizliIslem />
        </div>

        {/* CANLI LOG LİSTESİ */}
        <div className="mt-2">
            <h3 className="text-gray-800 font-bold text-md mb-3 flex items-center gap-2 ml-1">
                Son Hareketler
                <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Bugün</span>
            </h3>
            
            <div className="space-y-2.5">
                {aktiviteler?.map((islem) => {
                    let Icon = Baby;
                    let colorClass = "bg-gray-100 text-gray-600";
                    
                    if (islem.tip === 'mama') { Icon = Utensils; colorClass = "bg-orange-50 text-orange-600"; }
                    if (islem.tip === 'bez') { Icon = Wind; colorClass = "bg-blue-50 text-blue-600"; }
                    if (islem.tip === 'uyku') { Icon = Moon; colorClass = "bg-indigo-50 text-indigo-600"; }

                    return (
                        <div key={islem.id} className="bg-white p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center gap-3 transition-transform active:scale-95">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                                <Icon className="w-5 h-5" /> 
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-gray-800 capitalize">{islem.tip}</p>
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {new Date(islem.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">
                                    {islem.detay || "Detay girilmedi"}
                                </p>
                            </div>
                        </div>
                    );
                })}
                
                {(!aktiviteler || aktiviteler.length === 0) && (
                    <div className="text-center py-8 opacity-50">
                        <p className="text-gray-400 text-xs">Henüz kayıt yok.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </main>
  );
}