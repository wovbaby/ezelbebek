import { createServerClient } from '@supabase/ssr';
import ProfilForm from '@/components/ProfilForm';
import { Trophy, Star, Settings, LogOut, Plus, Baby } from 'lucide-react'; // Baby ikonunu ekledim
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const revalidate = 0;

// --- SERVER ACTION: ÇIKIŞ YAP ---
async function cikisYap() {
  'use server'
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
           try {
             cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
           } catch {}
        },
      },
    }
  );
  
  await supabase.auth.signOut();
  redirect('/login');
}

export default async function ProfilPage() {
  // 1. Çerezleri Al
  const cookieStore = await cookies();

  // 2. Güvenli Supabase İstemcisi
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
           try {
             cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
           } catch {}
        },
      },
    }
  );

  // 3. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 4. Sadece Bu Kullanıcıya Ait Bebekleri Getir
  const { data: bebekler } = await supabase
    .from('bebekler')
    .select('*')
    .eq('user_id', user.id)
    .order('id');

  // --- YENİ EKLENDİ: Sadece Bu Kullanıcıya Ait Anneyi Getir ---
  let { data: anne } = await supabase
    .from('anne_profili')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Eğer anne profili henüz yoksa varsayılan boş obje oluştur (Hata vermesin diye)
  if (!anne) {
      anne = { ad: 'Anne', su_hedefi: 2000, resim_url: null };
  }
  
  // 5. Seçili ve Aktif Bebeği Belirle
  const seciliId = Number(cookieStore.get('secili_bebek')?.value) || 0;
  const aktifId = (seciliId && bebekler?.find(b => b.id === seciliId)) ? seciliId : bebekler?.[0]?.id;
  const seciliBebek = bebekler?.find(b => b.id === aktifId) || bebekler?.[0];

  // 6. İstatistikler
  let mamaSayisi = 0, bezSayisi = 0, uykuSayisi = 0, ilanSayisi = 0;

  if (aktifId) {
      const mamaRes = await supabase.from('aktiviteler').select('*', { count: 'exact', head: true }).eq('bebek_id', aktifId).eq('tip', 'mama');
      const bezRes = await supabase.from('aktiviteler').select('*', { count: 'exact', head: true }).eq('bebek_id', aktifId).eq('tip', 'bez');
      const uykuRes = await supabase.from('aktiviteler').select('*', { count: 'exact', head: true }).eq('bebek_id', aktifId).eq('tip', 'uyku');
      
      mamaSayisi = mamaRes.count || 0;
      bezSayisi = bezRes.count || 0;
      uykuSayisi = uykuRes.count || 0;
  }
  
  const ilanRes = await supabase.from('urunler').select('*', { count: 'exact', head: true });
  ilanSayisi = ilanRes.count || 0;

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
        
        {/* Üst Arka Plan */}
        <div className="bg-blue-600 h-48 rounded-b-[3rem] relative"></div>

        <div className="px-6 -mt-36 relative z-10">
            
            {/* Bebek Listesi Başlığı */}
            <div className="flex items-center justify-between mb-3 text-white/90 px-1">
                <h3 className="font-bold text-sm">Bebeklerim</h3>
                <Link href="/profil/ekle" className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors backdrop-blur-sm border border-white/10">
                    <Plus className="w-3 h-3" /> Yeni Ekle
                </Link>
            </div>

            {/* Yatay Bebek Listesi */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                {bebekler?.map((b) => (
                    <div key={b.id} className={`min-w-[100px] p-3 rounded-2xl flex flex-col items-center transition-all border-2 ${b.id === aktifId ? 'bg-white border-blue-400 shadow-lg scale-105' : 'bg-white/80 border-transparent shadow-sm'}`}>
                        <div className="w-12 h-12 rounded-full overflow-hidden mb-2 bg-gray-100 border border-gray-200">
                            {b.resim_url ? (
                                <img src={b.resim_url} className="w-full h-full object-cover" alt={b.ad} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">{b.ad.charAt(0)}</div>
                            )}
                        </div>
                        <p className="font-bold text-xs text-gray-800 truncate w-full text-center">{b.ad}</p>
                    </div>
                ))}
                {(!bebekler || bebekler.length === 0) && (
                    <div className="text-white text-xs p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        Henüz bebek eklenmedi.
                    </div>
                )}
            </div>

            {/* --- YENİ: ANNE PROFİL KARTI --- */}
            {/* Anne Profilini buraya ekliyoruz ki kullanıcı kendi resmini görsün */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {anne?.resim_url ? (
                        <img src={anne.resim_url} className="w-12 h-12 rounded-full object-cover border border-gray-200" alt="Anne" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-400">
                            <Baby className="w-6 h-6" />
                        </div>
                    )}
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">{anne?.ad || 'Anne Profili'}</h4>
                        <p className="text-xs text-gray-500">Hedef: {anne?.su_hedefi}ml Su</p>
                    </div>
                </div>
                <Link href="/anne" className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold">
                    Düzenle
                </Link>
            </div>
            
            {/* KART 1: Bebek Künyesi */}
            {seciliBebek ? (
                <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-gray-100">
                    <ProfilForm bebek={seciliBebek} />
                </div>
            ) : null}

            {/* KART 2: İstatistikler */}
            <div className="mb-6">
                <h3 className="text-gray-800 font-bold text-sm mb-3 ml-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    {seciliBebek?.ad || 'Bebek'} İstatistikleri
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Bez Değişimi" value={bezSayisi} color="bg-blue-50 text-blue-600" />
                    <StatCard label="Mama Öğünü" value={mamaSayisi} color="bg-orange-50 text-orange-600" />
                    <StatCard label="Uyku Kaydı" value={uykuSayisi} color="bg-indigo-50 text-indigo-600" />
                    <StatCard label="İlan Sayısı" value={ilanSayisi} color="bg-purple-50 text-purple-600" />
                </div>
            </div>

            {/* KART 3: Menü ve Çıkış */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <MenuItem icon={Star} label="Premium'a Geç" />
                <MenuItem icon={Settings} label="Uygulama Ayarları" />
                <div className="border-t border-gray-100"></div>
                
                {/* Çıkış Yap Formu */}
                <form action={cikisYap}>
                    <button className="w-full p-4 flex items-center gap-3 text-sm font-bold hover:bg-gray-50 transition-colors text-red-500">
                        <LogOut className="w-5 h-5" />
                        Çıkış Yap
                    </button>
                </form>
            </div>

            <p className="text-center text-[10px] text-gray-400 mt-8 mb-4">
                Ezel Bebek v1.2.0
            </p>

        </div>
    </main>
  );
}

// Helper bileşenler aynı
function StatCard({ label, value, color }: any) {
    return (
        <div className={`p-4 rounded-2xl ${color} flex flex-col items-center justify-center`}>
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-[10px] opacity-80 font-bold uppercase">{label}</span>
        </div>
    );
}

function MenuItem({ icon: Icon, label, isRed }: any) {
    return (
        <button className={`w-full p-4 flex items-center gap-3 text-sm font-bold hover:bg-gray-50 transition-colors ${isRed ? 'text-red-500' : 'text-gray-700'}`}>
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );
}