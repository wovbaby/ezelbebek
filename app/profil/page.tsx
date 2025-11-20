import { supabase } from '@/lib/supabaseClient';
import ProfilForm from '@/components/ProfilForm';
import { Trophy, Star, Settings, LogOut } from 'lucide-react';

export const revalidate = 0;

export default async function ProfilPage() {
  // 1. Bebek Bilgisi
  const { data: bebekler } = await supabase.from('bebekler').select('*').limit(1);
  const bebek = bebekler?.[0];

  // 2. Toplam İstatistikler (Gamification)
  const { count: mamaSayisi } = await supabase.from('aktiviteler').select('*', { count: 'exact', head: true }).eq('tip', 'mama');
  const { count: bezSayisi } = await supabase.from('aktiviteler').select('*', { count: 'exact', head: true }).eq('tip', 'bez');
  const { count: uykuSayisi } = await supabase.from('aktiviteler').select('*', { count: 'exact', head: true }).eq('tip', 'uyku');
  const { count: ilanSayisi } = await supabase.from('urunler').select('*', { count: 'exact', head: true });

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
        
        {/* Üst Arka Plan (Dekoratif) */}
        <div className="bg-blue-600 h-40 rounded-b-[3rem] relative"></div>

        <div className="px-6 -mt-28 relative z-10">
            
            {/* KART 1: Bebek Künyesi */}
            <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
                <ProfilForm bebek={bebek} />
            </div>

            {/* KART 2: İstatistikler (Rozetler) */}
            <div className="mb-6">
                <h3 className="text-gray-800 font-bold text-sm mb-3 ml-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Başarı İstatistikleri
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Bez Değişimi" value={bezSayisi || 0} color="bg-blue-50 text-blue-600" />
                    <StatCard label="Mama Öğünü" value={mamaSayisi || 0} color="bg-orange-50 text-orange-600" />
                    <StatCard label="Uyku Kaydı" value={uykuSayisi || 0} color="bg-indigo-50 text-indigo-600" />
                    <StatCard label="İlan Sayısı" value={ilanSayisi || 0} color="bg-purple-50 text-purple-600" />
                </div>
            </div>

            {/* KART 3: Ayarlar Menüsü (Görsel) */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <MenuItem icon={Star} label="Premium'a Geç" />
                <MenuItem icon={Settings} label="Uygulama Ayarları" />
                <div className="border-t border-gray-100"></div>
                <MenuItem icon={LogOut} label="Çıkış Yap" isRed />
            </div>

            <p className="text-center text-[10px] text-gray-400 mt-6">
                Ezel Bebek v1.0.0
            </p>

        </div>
    </main>
  );
}

// Küçük yardımcı bileşenler
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