import { supabase } from '@/lib/supabaseClient';
import { Droplets, Calendar, RefreshCcw, Heart, Sparkles } from 'lucide-react';
import { suIc, suSifirla, anneGuncelle } from '@/app/actions';

export const revalidate = 0;

export default async function AnnePage() {
  const { data: anne } = await supabase.from('anne_profili').select('*').single();

  // Adet Döngüsü Hesabı
  let kalanGun = 0;
  let donguDurumu = "Bilinmiyor";
  
  if (anne?.son_adet_tarihi) {
    const sonTarih = new Date(anne.son_adet_tarihi);
    const bugun = new Date();
    
    // Geçen gün sayısı
    const gecenGun = Math.floor((bugun.getTime() - sonTarih.getTime()) / (1000 * 3600 * 24));
    const donguSuresi = anne.dongu_suresi || 28;
    
    // Kalan gün
    kalanGun = donguSuresi - (gecenGun % donguSuresi);
    
    // Durum belirle
    const donguGunu = gecenGun % donguSuresi;
    if (donguGunu < 5) donguDurumu = "Regl Dönemi";
    else if (donguGunu >= 12 && donguGunu <= 16) donguDurumu = "Yumurtlama Dönemi 🥚";
    else if (kalanGun < 3) donguDurumu = "PMS (Yaklaştı)";
    else donguDurumu = "Normal Dönem";
  }

  return (
    <main className="min-h-screen bg-pink-50 pb-32">
        
        {/* Header */}
        <header className="p-6 bg-white shadow-sm rounded-b-3xl sticky top-0 z-10">
            <h1 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                <Heart className="w-6 h-6 fill-pink-600" />
                Merhaba {anne?.ad || "Anne"}
            </h1>
            <p className="text-xs text-gray-500 mt-1">Kendine vakit ayırmayı unutma.</p>
        </header>

        <div className="p-6 space-y-6">
            
            {/* 1. GÜNLÜK MOTİVASYON / ASTROLOJİ (Statik Örnek) */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-2xl text-white shadow-lg shadow-pink-200 relative overflow-hidden">
                <Sparkles className="w-12 h-12 absolute -top-2 -right-2 text-white/20 rotate-12" />
                <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" /> Günün Mesajı
                </h3>
                <p className="text-sm font-medium italic opacity-95">
                    "Harika bir annesin! Bugün gökyüzü enerjini yükseltiyor, kendine bir kahve ısmarlamayı hak ettin."
                </p>
            </div>

            {/* 2. REGL DÖNGÜSÜ KARTI */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-pink-500" /> Döngü Takibi
                    </h3>
                    <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                        {donguDurumu}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{kalanGun}</p>
                        <p className="text-xs text-gray-400">Gün Kaldı</p>
                    </div>
                    
                    {/* Ayarlar Formu (Basit) */}
                    <form action={anneGuncelle} className="flex-1 ml-6 space-y-2">
                        <div>
                            <label className="text-[10px] text-gray-400 uppercase font-bold">Son Başlangıç</label>
                            <input type="date" name="son_adet_tarihi" defaultValue={anne?.son_adet_tarihi} className="w-full p-1 bg-gray-50 rounded border text-xs" />
                        </div>
                        <div className="flex gap-2">
                            <input type="number" name="dongu_suresi" placeholder="28" defaultValue={anne?.dongu_suresi} className="w-1/2 p-1 bg-gray-50 rounded border text-xs text-center" title="Döngü Süresi" />
                            <button className="w-1/2 bg-pink-500 text-white text-xs rounded font-bold">Güncelle</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 3. SU TAKİBİ */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-500" /> Su Takibi
                    </h3>
                    <form action={suSifirla}>
                        <button className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                            <RefreshCcw className="w-3 h-3" /> Sıfırla
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-4">
                    {/* Su Deposu Görseli */}
                    <div className="relative w-16 h-24 bg-blue-50 rounded-xl overflow-hidden border border-blue-100">
                        <div 
                            className="absolute bottom-0 left-0 w-full bg-blue-400 transition-all duration-500" 
                            style={{ height: `${Math.min((anne?.icilen_su / (anne?.su_hedefi || 10)) * 100, 100)}%` }}
                        ></div>
                    </div>

                    <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">
                            Hedef: <span className="font-bold">{anne?.su_hedefi} Bardak</span>
                        </p>
                        <p className="text-2xl font-bold text-blue-600 mb-3">
                            {anne?.icilen_su} <span className="text-sm text-gray-400 font-normal">Bardak içildi</span>
                        </p>
                        
                        <form action={suIc}>
                            <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform">
                                <Droplets className="w-4 h-4" /> Bir Bardak İçtim
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    </main>
  );
}