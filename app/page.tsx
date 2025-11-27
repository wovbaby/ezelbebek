import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Baby, Utensils, Moon, Wind } from 'lucide-react';
import HizliIslem from '@/components/HizliIslem';
import BebekSecici from '@/components/BebekSecici';

export const revalidate = 0;

export default async function Home() {
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

  // 1. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("❌ Kullanıcı bulunamadı, Login'e atılıyor.");
    redirect('/login');
  }

  // --- DEDEKTİF BAŞLANGICI ---
  console.log("------------------------------------------------");
  console.log("👤 Giriş Yapan User ID:", user.id);
  console.log("📧 Email:", user.email);

  // 2. Güvenlik (Onay) Kontrolü
  const { data: profil, error: profilHata } = await supabase
    .from('profiles')
    .select('*') // Tüm veriyi görelim
    .eq('id', user.id)
    .single();

  console.log("🔍 Veritabanından Gelen Profil:", profil);
  
  if (profilHata) {
      console.error("🚨 Profil Çekme Hatası:", profilHata.message);
  }

  // Profil yoksa veya onaylı değilse
  if (!profil || profil.onayli_mi !== true) {
      console.log("⛔ ERİŞİM REDDEDİLDİ -> Bekleme Odasına Atılıyor.");
      console.log("Sebep: ", !profil ? "Profil Yok" : "Onaylı Değil (False)");
      redirect('/beklemede');
  } else {
      console.log("✅ ERİŞİM ONAYLANDI -> Ana Sayfa Açılıyor.");
  }
  console.log("------------------------------------------------");
  // --- DEDEKTİF BİTİŞİ ---

  // 3. Bebekleri Getir
  const { data: tumBebekler } = await supabase
    .from('bebekler')
    .select('id, ad, resim_url')
    .eq('user_id', user.id);

  const bebekler = tumBebekler || [];

  // 4. Seçili Bebeği Belirle
  let seciliId = Number(cookieStore.get('secili_bebek')?.value);
  
  if (!seciliId || !bebekler.find(b => b.id === seciliId)) {
      seciliId = bebekler.length > 0 ? bebekler[0].id : 0;
  }
  
  const seciliBebek = bebekler.find(b => b.id === seciliId);

  // 5. Aktiviteleri Getir
  let aktiviteler = [];
  if (seciliId > 0) {
    const { data, error } = await supabase
      .from('aktiviteler')
      .select('*')
      .eq('bebek_id', seciliId)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (!error && data) {
        aktiviteler = data;
    }
  }

  return (
    <main className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      
      {/* --- HEADER --- */}
      <header className="flex-none h-64 relative z-40 rounded-b-[2.5rem] overflow-hidden shadow-xl bg-blue-600">
        
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30"></div>

        <div className="absolute inset-0 flex flex-col justify-between p-6 pt-12">
            <div className="self-start"> 
                 <BebekSecici bebekler={bebekler} seciliId={seciliId} />
            </div>

            <div className="text-center text-white mb-2">
                <h2 className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">Hoş Geldin</h2>
                <h1 className="text-4xl font-bold tracking-tight drop-shadow-md">{seciliBebek?.ad || "Bebek Ekle"}</h1>
            </div>
        </div>
      </header>

      {/* --- İÇERİK --- */}
      <div className="flex-1 overflow-y-auto relative z-30 scrollbar-hide">
        
        {seciliBebek && (
          <div className="sticky top-0 z-50 px-5 pt-6 pb-2 bg-gray-50/95 backdrop-blur-sm transition-all">
              <div className="origin-top"> 
                  <HizliIslem />
              </div>
          </div>
        )}

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