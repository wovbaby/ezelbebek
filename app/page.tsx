import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Baby, Utensils, Moon, Wind } from 'lucide-react';
import HizliIslem from '@/components/HizliIslem';
import BebekSecici from '@/components/BebekSecici';

// Sayfanın her istekte yenilenmesini sağla (Dinamik Veri)
export const revalidate = 0;

export default async function Home() {
  const cookieStore = await cookies();

  // 1. Sunucu Tarafı Supabase İstemcisi Oluştur
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
           // Server Component içinde cookie set edilemez ama okuma için gereklidir
           try {
             cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
           } catch {
             // Server component set hatasını yoksay
           }
        },
      },
    }
  );

  // 2. Giriş Yapan Kullanıcıyı Bul
  const { data: { user } } = await supabase.auth.getUser();

  // 3. SADECE Bu Kullanıcıya Ait Bebekleri Getir (.eq('user_id', user.id))
  // Eğer kullanıcı yoksa boş dizi döner
  let tumBebekler = [];
  if (user) {
    const { data } = await supabase
      .from('bebekler')
      .select('id, ad, resim_url')
      .eq('user_id', user.id); // <-- İŞTE SİHİRLİ SATIR
    tumBebekler = data || [];
  }

  // 4. Seçili Bebeği Belirle
  const seciliId = Number(cookieStore.get('secili_bebek')?.value) || 0;
  const aktifId = (seciliId && tumBebekler.find(b => b.id === seciliId)) ? seciliId : tumBebekler[0]?.id;
  const seciliBebek = tumBebekler.find(b => b.id === aktifId);

  // 5. Aktiviteleri Getir (Eğer bebek seçiliyse)
  let aktiviteler = [];
  if (aktifId) {
    const { data } = await supabase
      .from('aktiviteler')
      .select('*')
      .eq('bebek_id', aktifId)
      .order('created_at', { ascending: false })
      .limit(20);
    aktiviteler = data || [];
  }

  return (
    <main className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      
      {/* --- 1. HEADER (SABİT, RESİMLİ) --- */}
      <header className="flex-none h-64 relative z-40 rounded-b-[2.5rem] overflow-hidden shadow-xl bg-blue-600">
        
        {/* Arkaplan Resmi */}
        {seciliBebek?.resim_url ? (
            <img 
                src={seciliBebek.resim_url} 
                alt={seciliBebek.ad} 
                className="absolute inset-0 w-full h-full object-cover"
            />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Baby className="w-32 h-32 text-white/20" />
            </div>
        )}

        {/* Karartma */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30"></div>

        {/* İÇERİK */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 pt-12">
            
            {/* BEBEK SEÇİCİ - SOL ÜSTTE */}
            <div className="self-start"> 
                 <BebekSecici bebekler={tumBebekler} seciliId={aktifId} />
            </div>

            {/* İSİM - ORTADA ALTTA */}
            <div className="text-center text-white mb-2">
                <h2 className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">Hoş Geldin</h2>
                <h1 className="text-4xl font-bold tracking-tight drop-shadow-md">{seciliBebek?.ad || "Bebek Ekle"}</h1>
            </div>
        </div>
      </header>

      {/* --- 2. İÇERİK ALANI (KAYDIRILABİLİR) --- */}
      <div className="flex-1 overflow-y-auto relative z-30 scrollbar-hide">
        
        {/* HIZLI İŞLEM (YAPIŞKAN / STICKY) */}
        {seciliBebek && (
          <div className="sticky top-0 z-50 px-5 pt-6 pb-2 bg-gray-50/95 backdrop-blur-sm transition-all">
              <div className="origin-top"> 
                  <HizliIslem />
              </div>
          </div>
        )}

        {/* CANLI LOG LİSTESİ */}
        <div className="px-6 pb-32 mt-2">
            <h3 className="text-gray-800 font-bold text-md mb-3 flex items-center gap-2 ml-1">
                Bugünün Hareketleri
            </h3>
            
            <div className="space-y-2.5">
                {aktiviteler.map((islem) => {
                    let Icon = Baby;
                    let colorClass = "bg-gray-100 text-gray-600";
                    
                    if (islem.tip === 'mama') { Icon = Utensils; colorClass = "bg-orange-50 text-orange-600"; }
                    if (islem.tip === 'bez') { Icon = Wind; colorClass = "bg-blue-50 text-blue-600"; }
                    if (islem.tip === 'uyku') { Icon = Moon; colorClass = "bg-indigo-50 text-indigo-600"; }

                    return (
                        <div key={islem.id} className="bg-white p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center gap-3">
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
                
                {aktiviteler.length === 0 && (
                    <div className="text-center py-12 opacity-50">
                        <Baby className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">
                           {seciliBebek ? "Henüz kayıt yok." : "Lütfen bir bebek ekleyin."}
                        </p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </main>
  );
}