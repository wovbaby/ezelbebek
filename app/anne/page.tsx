import { supabase } from '@/lib/supabaseClient';
import { Droplets, Calendar, RefreshCcw, Heart, Sparkles, Settings } from 'lucide-react';
import { suIc, suSifirla, anneGuncelle } from '@/app/actions';

export const revalidate = 0;

// Motivasyon Sözleri (Rastgele biri gelir)
const SOZLER = [
    "Harika bir annesin! Bugün enerjin gökyüzü kadar yüksek.",
    "Kendine bir kahve ısmarla, bunu hak ettin.",
    "Senin mutluluğun, bebeğinin mutluluğu demek.",
    "Bugün derin bir nefes al ve anın tadını çıkar.",
    "Yorgunluk geçici, sevgin kalıcı. Harikasın!",
    "Süper kahramanların pelerine ihtiyacı yoktur, senin gibi anne olurlar."
];

export default async function AnnePage() {
  // Veriyi Çek
  const { data: anne } = await supabase.from('anne_profili').select('*').single();
  
  // Rastgele Söz Seç
  const gununSozu = SOZLER[Math.floor(Math.random() * SOZLER.length)];

  // --- DÖNGÜ HESAPLAMA ---
  let kalanGun = 0;
  let donguDurumu = "Ayarlanmadı";
  let donguRengi = "bg-gray-100 text-gray-500";
  
  if (anne?.son_adet_tarihi) {
    const sonTarih = new Date(anne.son_adet_tarihi);
    const bugun = new Date();
    
    // Geçen gün sayısı
    const farkZaman = bugun.getTime() - sonTarih.getTime();
    const gecenGun = Math.floor(farkZaman / (1000 * 3600 * 24));
    const donguSuresi = anne.dongu_suresi || 28;
    
    // Kalan gün (Negatif çıkarsa gecikme var demektir)
    const modGun = gecenGun % donguSuresi;
    kalanGun = donguSuresi - modGun;
    
    // Durum Analizi
    if (modGun < 5) {
        donguDurumu = "Regl Dönemi 🩸";
        donguRengi = "bg-red-100 text-red-600";
    } else if (modGun >= 12 && modGun <= 16) {
        donguDurumu = "Yumurtlama 🥚";
        donguRengi = "bg-purple-100 text-purple-600";
    } else if (kalanGun < 3) {
        donguDurumu = "PMS Dönemi 🍫";
        donguRengi = "bg-pink-100 text-pink-600";
    } else {
        donguDurumu = "Normal Dönem ✨";
        donguRengi = "bg-green-100 text-green-600";
    }
  }

  // --- SU HESAPLAMA ---
  const suHedefi = anne?.su_hedefi || 10;
  const icilen = anne?.icilen_su || 0;
  const suYuzdesi = Math.min((icilen / suHedefi) * 100, 100);

  return (
    <main className="min-h-screen bg-pink-50 pb-32">
        
        {/* Header */}
        <header className="p-6 bg-white shadow-sm rounded-b-[2.5rem] sticky top-0 z-10 border-b border-pink-100">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                        <Heart className="w-6 h-6 fill-pink-600" />
                        {anne?.ad || "Anne"}
                    </h1>
                    <p className="text-xs text-gray-400 mt-1 ml-1">Kendine iyi bak ki, dünya güzelleşsin.</p>
                </div>
                {/* Avatar (Süs) */}
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    <span className="text-xl">👩</span>
                </div>
            </div>
        </header>

        <div className="p-6 space-y-6">
            
            {/* 1. GÜNÜN MESAJI (KART) */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-2xl text-white shadow-lg shadow-pink-200 relative overflow-hidden">
                <Sparkles className="w-16 h-16 absolute -top-4 -right-4 text-white/20 rotate-12" />
                <h3 className="font-bold text-xs flex items-center gap-2 mb-2 uppercase tracking-wider opacity-90">
                    <Sparkles className="w-3 h-3" /> Günün Motivasyonu
                </h3>
                <p className="text-sm font-medium italic leading-relaxed">
                    "{gununSozu}"
                </p>
            </div>

            {/* 2. REGL DÖNGÜSÜ VE AYARLAR */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-pink-500" /> Döngü Takibi
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${donguRengi}`}>
                        {donguDurumu}
                    </span>
                </div>

                <div className="flex gap-6">
                    {/* Sayaç */}
                    <div className="flex flex-col items-center justify-center bg-pink-50 w-24 h-24 rounded-full border-4 border-pink-200">
                        <p className="text-3xl font-bold text-gray-800">{kalanGun}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-bold">Gün Kaldı</p>
                    </div>
                    
                    {/* Form (Sağ Taraf) */}
                    <form action={anneGuncelle} className="flex-1 space-y-3">
                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Son Adet Tarihi</label>
                            <input 
                                type="date" 
                                name="son_adet_tarihi" 
                                defaultValue={anne?.son_adet_tarihi} 
                                className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-pink-400 outline-none" 
                            />
                        </div>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Döngü (Gün)</label>
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
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-500" /> Su Takibi
                    </h3>
                    <form action={suSifirla}>
                        <button className="text-[10px] bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 px-2 py-1 rounded-full flex items-center gap-1 transition-colors">
                            <RefreshCcw className="w-3 h-3" /> Sıfırla
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-5 relative z-10">
                    {/* Görsel Su Deposu */}
                    <div className="relative w-16 h-32 bg-blue-50 rounded-full overflow-hidden border-4 border-white shadow-inner ring-2 ring-blue-100">
                        {/* Su Seviyesi Animasyonu */}
                        <div 
                            className="absolute bottom-0 left-0 w-full bg-blue-400 transition-all duration-700 ease-out opacity-80" 
                            style={{ height: `${suYuzdesi}%` }}
                        >
                            {/* Dalga Efekti (CSS ile yapılabilir, şimdilik düz renk) */}
                        </div>
                        {/* Yüzde Yazısı */}
                        <div className="absolute inset-0 flex items-center justify-center text-blue-900 font-bold text-xs drop-shadow-sm">
                            %{Math.round(suYuzdesi)}
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>İçilen: <b className="text-blue-600 text-lg">{icilen}</b></span>
                            <span>Hedef: <b>{suHedefi}</b></span>
                        </div>
                        
                        {/* Su Hedefi Ayarlama (Mini Form) */}
                        <form action={anneGuncelle} className="mb-3">
                             <div className="flex items-center gap-2">
                                <label className="text-[9px] text-gray-400">Hedef:</label>
                                <input type="number" name="su_hedefi" defaultValue={suHedefi} className="w-12 p-1 text-xs border rounded text-center" />
                                <button className="text-[9px] text-blue-500 underline">Ayarla</button>
                             </div>
                        </form>
                        
                        {/* İÇME BUTONU */}
                        <form action={suIc}>
                            <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform">
                                <Droplets className="w-4 h-4 fill-white" /> 
                                +1 Bardak Ekle
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    </main>
  );
}