import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Droplets, Calendar, RefreshCcw, Heart, Sparkles, Camera, Dumbbell, Flame } from 'lucide-react';
import { suIc, suSifirla, anneGuncelle } from '@/app/actions';
import Link from 'next/link';

export const revalidate = 0;

// --- GÜNLÜK MOTİVASYON ÜRETİCİSİ (AI SİMÜLASYONU) ---
function motivasyonUret(anneAdi: string) {
  // 1. Giriş (Hitap)
  const girisler = [
    `Günaydın ${anneAdi},`, 
    `Harika bir gün seni bekliyor ${anneAdi},`, 
    `Sevgili ${anneAdi}, bugün ışıl ışıl parlıyorsun,`,
    `Biliyorum bazen yoruluyorsun ${anneAdi}, ama`,
    `Hey süper kahraman ${anneAdi},`,
    `Bugün gökyüzü senin için gülümsüyor ${anneAdi},`
  ];

  // 2. Durum Tespiti (Empati)
  const durumlar = [
    "annelik zorlu bir maraton ve sen harika gidiyorsun.",
    "bebeğinin o gülüşü tüm uykusuz gecelere değiyor.",
    "bugün kendine biraz şefkat gösterme zamanı.",
    "sabır depon bazen azalabilir, bu çok normal.",
    "yaptığın fedakarlıklar görünmez değil, hepsi birer mucize.",
    "içindeki gücün farkında mısın? Dağları devirebilirsin."
  ];

  // 3. Aksiyon / Tavsiye
  const tavsiyeler = [
    "Şimdi derin bir nefes al ve omuzlarını gevşet.",
    "O kahveyi soğutmadan içmeyi hak ettin.",
    "Bugün ev işlerini boş ver, anın tadını çıkar.",
    "Aynaya bak ve 'Ben harikayım' de, çünkü öylesin!",
    "Bebeğin uyuduğunda sen de sadece uzan ve hiçbir şey yapma.",
    "Sevdiğin bir şarkıyı aç ve modunu yükselt."
  ];

  // 4. Kapanış (Güçlendirme)
  const sonlar = [
    "Sen bu işi çok iyi biliyorsun.",
    "Unutma, mükemmel değil mutlu anne lazım.",
    "Senin mutluluğun evin güneşidir.",
    "Yalnız değilsin, hepimiz aynı yoldayız.",
    "Sana güveniyoruz!",
    "Bugün senin günün olsun."
  ];

  // Rastgele Birleştir
  const r1 = girisler[Math.floor(Math.random() * girisler.length)];
  const r2 = durumlar[Math.floor(Math.random() * durumlar.length)];
  const r3 = tavsiyeler[Math.floor(Math.random() * tavsiyeler.length)];
  const r4 = sonlar[Math.floor(Math.random() * sonlar.length)];

  return `${r1} ${r2} ${r3} ${r4}`;
}

export default async function AnnePage() {
  // 1. Çerezleri ve Supabase Client'ı oluştur
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

  // 2. Kullanıcıyı Kontrol Et
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // 3. SADECE Bu Kullanıcının Anne Profilini Getir
  let { data: anne } = await supabase
    .from('anne_profili')
    .select('*')
    .eq('user_id', user.id) // <-- KRİTİK DEĞİŞİKLİK
    .single();

  // 4. Dinamik Mesajı Oluştur
  const gununSozu = motivasyonUret(anne?.ad || "Anne");

  // --- DÖNGÜ HESAPLAMA ---
  let kalanGun = 0;
  let donguDurumu = "Veri Bekleniyor";
  let donguRengi = "bg-gray-100 text-gray-500";
  
  if (anne?.son_adet_tarihi) {
    const sonTarih = new Date(anne.son_adet_tarihi);
    const bugun = new Date();
    
    if (!isNaN(sonTarih.getTime())) {
        const farkZaman = bugun.getTime() - sonTarih.getTime();
        const gecenGun = Math.floor(farkZaman / (1000 * 3600 * 24));
        const donguSuresi = anne.dongu_suresi || 28;
        
        let modGun = gecenGun % donguSuresi;
        if (modGun < 0) modGun += donguSuresi;

        kalanGun = donguSuresi - modGun;
        
        if (modGun < 5) { donguDurumu = "Regl Dönemi 🩸"; donguRengi = "bg-red-100 text-red-600"; } 
        else if (modGun >= 12 && modGun <= 16) { donguDurumu = "Yumurtlama 🥚"; donguRengi = "bg-purple-100 text-purple-600"; } 
        else if (kalanGun <= 3) { donguDurumu = "PMS Dönemi 🍫"; donguRengi = "bg-pink-100 text-pink-600"; } 
        else { donguDurumu = "Normal Dönem ✨"; donguRengi = "bg-green-100 text-green-600"; }
    }
  }

  const suHedefi = anne?.su_hedefi || 10;
  const icilen = anne?.icilen_su || 0;
  const suYuzdesi = Math.min((icilen / suHedefi) * 100, 100);

  return (
    <main className="min-h-screen bg-pink-50 pb-32">
        
        {/* HEADER */}
        <header className="p-6 bg-white shadow-sm rounded-b-[2.5rem] sticky top-0 z-10 border-b border-pink-100">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                        <Heart className="w-6 h-6 fill-pink-600" />
                        Merhaba, {anne?.ad || "Anne"}
                    </h1>
                    <p className="text-xs text-gray-400 mt-1 ml-1">Kendine iyi bak ki, dünya güzelleşsin.</p>
                </div>
                
                {/* Profil Resmi */}
                <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center border-2 border-white shadow-md overflow-hidden relative">
                    {anne?.resim_url ? (
                        <img src={anne.resim_url} alt="Anne" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl absolute inset-0 flex items-center justify-center">👩</span>
                    )}
                </div>
            </div>
        </header>

        <div className="p-6 space-y-6">
            
            {/* 1. GÜNÜN MESAJI (DİNAMİK) */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-2xl text-white shadow-lg shadow-pink-200 relative overflow-hidden">
                <Sparkles className="w-16 h-16 absolute -top-4 -right-4 text-white/20 rotate-12" />
                <h3 className="font-bold text-xs flex items-center gap-2 mb-2 uppercase tracking-wider opacity-90">
                    <Sparkles className="w-3 h-3" /> Günün Motivasyonu
                </h3>
                <p className="text-sm font-medium italic leading-relaxed">"{gununSozu}"</p>
            </div>

            {/* 2. REGL DÖNGÜSÜ */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-pink-500" /> Döngü & Profil
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${donguRengi}`}>
                        {donguDurumu}
                    </span>
                </div>

                <div className="flex gap-6">
                    <div className="flex flex-col items-center justify-center bg-pink-50 w-24 h-24 rounded-full border-4 border-pink-200 shrink-0">
                        <p className="text-3xl font-bold text-gray-800">{kalanGun}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-bold">Gün Kaldı</p>
                    </div>
                    
                    <form action={anneGuncelle} className="flex-1 space-y-3">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-[9px] text-gray-400 uppercase font-bold block mb-1">İsim</label>
                                <input type="text" name="ad" defaultValue={anne?.ad || 'Anne'} className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs" placeholder="İsminiz" />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-400 uppercase font-bold block mb-1 text-center">Foto</label>
                                <label className="w-[34px] h-[34px] flex items-center justify-center bg-pink-100 text-pink-500 rounded-lg cursor-pointer hover:bg-pink-200 transition-colors">
                                    <Camera className="w-4 h-4" />
                                    <input type="file" name="resim" accept="image/*" className="hidden" />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Son Adet Tarihi</label>
                            <input type="date" name="son_adet_tarihi" defaultValue={anne?.son_adet_tarihi} className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-pink-400 outline-none" />
                        </div>
                        
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Döngü (Gün)</label>
                                <input type="number" name="dongu_suresi" defaultValue={anne?.dongu_suresi || 28} className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-center" />
                            </div>
                            <button type="submit" className="h-[34px] px-4 bg-pink-500 text-white text-xs rounded-lg font-bold shadow-md active:scale-95 transition-transform">
                                Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 3. SU TAKİBİ */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
                 <div className="flex justify-between items-center mb-4 relative z-10">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Droplets className="w-5 h-5 text-blue-500" /> Su Takibi</h3>
                    <form action={suSifirla}><button className="text-[10px] bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 px-2 py-1 rounded-full flex items-center gap-1 transition-colors"><RefreshCcw className="w-3 h-3" /> Sıfırla</button></form>
                </div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="relative w-16 h-32 bg-blue-50 rounded-full overflow-hidden border-4 border-white shadow-inner ring-2 ring-blue-100">
                        <div className="absolute bottom-0 left-0 w-full bg-blue-400 transition-all duration-700 ease-out opacity-80" style={{ height: `${suYuzdesi}%` }}></div>
                        <div className="absolute inset-0 flex items-center justify-center text-blue-900 font-bold text-xs drop-shadow-sm">%{Math.round(suYuzdesi)}</div>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>İçilen: <b className="text-blue-600 text-lg">{icilen}</b></span><span>Hedef: <b>{suHedefi}</b></span></div>
                        <form action={anneGuncelle} className="mb-3"><div className="flex items-center gap-2"><label className="text-[9px] text-gray-400">Hedef:</label><input type="number" name="su_hedefi" defaultValue={suHedefi} className="w-12 p-1 text-xs border rounded text-center" /><button className="text-[9px] text-blue-500 underline">Ayarla</button></div></form>
                        <form action={suIc}><button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform"><Droplets className="w-4 h-4 fill-white" /> +1 Bardak Ekle</button></form>
                    </div>
                </div>
            </div>

            {/* 4. SPOR VE EGZERSİZ */}
            <Link href="/anne/spor">
                <div className="bg-orange-500 text-white p-5 rounded-2xl shadow-lg shadow-orange-200 mt-6 flex items-center justify-between cursor-pointer active:scale-95 transition-transform">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Dumbbell className="w-5 h-5" /> Fit Anne
                        </h3>
                        <p className="text-xs text-orange-100 mt-1">Kısa ev egzersizleri</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold flex items-center gap-1 justify-end">
                            {anne?.yakilan_kalori || 0} <Flame className="w-4 h-4 fill-white" />
                        </p>
                        <p className="text-left text-[10px] uppercase font-bold opacity-80">Yakılan Kalori</p>
                    </div>
                </div>
            </Link>

        </div>
    </main>
  );
}
