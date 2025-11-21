import { supabase } from '@/lib/supabaseClient';
import { ChevronLeft, ChevronRight, Syringe, Thermometer, Star, ChevronRight as ChevronRightIcon } from 'lucide-react'; // Star ikonu eklendi
import GunlukNot from '@/components/GunlukNot';
import TarihSecici from '@/components/TarihSecici';
import Link from 'next/link';
import { cookies } from 'next/headers';

export const revalidate = 0;

export default async function GelisimPage({ searchParams }: { searchParams: Promise<{ tarih?: string }> }) {
  const params = await searchParams;
  const bugun = new Date().toISOString().split('T')[0];
  const secilenTarih = params.tarih || bugun;

  const cookieStore = await cookies();
  const seciliId = Number(cookieStore.get('secili_bebek')?.value) || 1;

  // Önceki/Sonraki gün linkleri
  const dateObj = new Date(secilenTarih);
  const oncekiGun = new Date(dateObj); oncekiGun.setDate(dateObj.getDate() - 1);
  const sonrakiGun = new Date(dateObj); sonrakiGun.setDate(dateObj.getDate() + 1);
  
  const oncekiLink = `/gelisim?tarih=${oncekiGun.toISOString().split('T')[0]}`;
  const sonrakiLink = `/gelisim?tarih=${sonrakiGun.toISOString().split('T')[0]}`;

  // Verileri Çek
  const { data: aktiviteler } = await supabase
    .from('aktiviteler')
    .select('*')
    .eq('bebek_id', seciliId)
    .gte('created_at', `${secilenTarih}T00:00:00`)
    .lte('created_at', `${secilenTarih}T23:59:59`)
    .order('created_at', { ascending: false });

  const { data: notlar } = await supabase
    .from('gunluk_notlar')
    .select('icerik')
    .eq('bebek_id', seciliId)
    .eq('tarih', secilenTarih)
    .limit(1);
  
  const gunlukNotMetni = notlar?.[0]?.icerik || "";

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
        
        {/* HEADER */}
        <header className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between max-w-md mx-auto">
                <Link href={oncekiLink} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                
                <TarihSecici tarih={secilenTarih} />

                <Link href={sonrakiLink} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </div>
        </header>

        <div className="p-6 space-y-4 max-w-md mx-auto">
            
            {/* --- KISAYOL BUTONLARI --- */}
            <div className="grid gap-4">
                
                {/* 1. AŞI TAKVİMİ (YEŞİL) */}
                <Link href="/asi-takvimi">
                    <div className="bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-teal-200 active:scale-95 transition-transform cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full border border-white/30">
                                <Syringe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-md">Aşı Takvimi</h3>
                                <p className="text-xs text-teal-100 opacity-90">Eksik aşıları kontrol et</p>
                            </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-white/80" />
                    </div>
                </Link>

                {/* 2. ATEŞ TAKİBİ (KIRMIZI) */}
                <Link href="/saglik/ates">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-red-200 active:scale-95 transition-transform cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full border border-white/30">
                                <Thermometer className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-md">Ateş Takibi</h3>
                                <p className="text-xs text-red-100 opacity-90">Derece ve ilaç kaydı</p>
                            </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-white/80" />
                    </div>
                </Link>

                {/* 3. YILDIZ REHBERİ (MOR - YENİ EKLENDİ) */}
                <Link href="/astroloji">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-indigo-200 active:scale-95 transition-transform cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full border border-white/30">
                                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-md">Yıldız Rehberi</h3>
                                <p className="text-xs text-indigo-200 opacity-90">Günlük burç yorumu</p>
                            </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-white/80" />
                    </div>
                </Link>

            </div>

            {/* GÜNLÜK NOT */}
            <div className="mt-2">
                <GunlukNot tarih={secilenTarih} mevcutNot={gunlukNotMetni} />
            </div>

            {/* İSTATİSTİKLER */}
            <div className="grid grid-cols-3 gap-2 text-center mt-4">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <span className="block text-xs text-gray-400 uppercase font-bold">Mama</span>
                    <span className="font-bold text-orange-500 text-lg">
                        {aktiviteler?.filter(a => a.tip === 'mama').length || 0}
                    </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <span className="block text-xs text-gray-400 uppercase font-bold">Bez</span>
                    <span className="font-bold text-blue-500 text-lg">
                        {aktiviteler?.filter(a => a.tip === 'bez').length || 0}
                    </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <span className="block text-xs text-gray-400 uppercase font-bold">Uyku</span>
                    <span className="font-bold text-indigo-500 text-lg">
                         {aktiviteler?.filter(a => a.tip === 'uyku').length || 0}
                    </span>
                </div>
            </div>

            {/* GÜNLÜK LİSTE */}
            <div>
                <h3 className="text-gray-800 font-bold text-sm mb-3 ml-1 mt-4">Günün Özeti</h3>
                <div className="space-y-3 relative">
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                    {aktiviteler?.map((islem) => (
                        <div key={islem.id} className="relative pl-10">
                            <div className="absolute left-0 top-1 w-8 h-8 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center z-10 text-[10px] font-bold text-gray-500 shadow-sm">
                                {new Date(islem.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}).slice(0,5)}
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                <div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider
                                        ${islem.tip === 'mama' ? 'bg-orange-100 text-orange-600' : 
                                            islem.tip === 'bez' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        {islem.tip}
                                    </span>
                                    <p className="text-sm text-gray-700 mt-2 font-medium">
                                        {islem.detay || "Detay girilmedi"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!aktiviteler || aktiviteler.length === 0) && (
                        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-400 text-sm">Bu tarihte kayıt yok.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    </main>
  );
}