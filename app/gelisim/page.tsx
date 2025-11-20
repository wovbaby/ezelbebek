import { supabase } from '@/lib/supabaseClient';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GunlukNot from '@/components/GunlukNot';
import TarihSecici from '@/components/TarihSecici'; // YENİ BİLEŞENİMİZ
import Link from 'next/link';

export const revalidate = 0;

export default async function GelisimPage({ searchParams }: { searchParams: { tarih?: string } }) {
  const bugun = new Date().toISOString().split('T')[0];
  const secilenTarih = searchParams.tarih || bugun;

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
    .gte('created_at', `${secilenTarih}T00:00:00`)
    .lte('created_at', `${secilenTarih}T23:59:59`)
    .order('created_at', { ascending: false });

  const { data: notlar } = await supabase
    .from('gunluk_notlar')
    .select('icerik')
    .eq('tarih', secilenTarih)
    .limit(1);
  
  const gunlukNotMetni = notlar?.[0]?.icerik || "";

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
        
        {/* HEADER */}
        <header className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between max-w-md mx-auto">
                {/* Geri Butonu */}
                <Link href={oncekiLink} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                
                {/* YENİ TARİH SEÇİCİ (Tıklayınca takvim açılır) */}
                <TarihSecici tarih={secilenTarih} />

                {/* İleri Butonu */}
                <Link href={sonrakiLink} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </div>
        </header>

        <div className="p-6 space-y-6 max-w-md mx-auto">
            
            <GunlukNot tarih={secilenTarih} mevcutNot={gunlukNotMetni} />

            {/* İSTATİSTİKLER */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <span className="block text-xs text-gray-400">Mama</span>
                    <span className="font-bold text-orange-500 text-lg">
                        {aktiviteler?.filter(a => a.tip === 'mama').length || 0}
                    </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <span className="block text-xs text-gray-400">Bez</span>
                    <span className="font-bold text-blue-500 text-lg">
                        {aktiviteler?.filter(a => a.tip === 'bez').length || 0}
                    </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                    <span className="block text-xs text-gray-400">Uyku</span>
                    <span className="font-bold text-indigo-500 text-lg">
                         {aktiviteler?.filter(a => a.tip === 'uyku').length || 0}
                    </span>
                </div>
            </div>

            {/* LİSTE */}
            <div>
                <h3 className="text-gray-800 font-bold text-sm mb-3 ml-1">Hareket Dökümü</h3>
                <div className="space-y-3 relative">
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                    {aktiviteler?.map((islem) => (
                        <div key={islem.id} className="relative pl-10">
                            <div className="absolute left-0 top-1 w-8 h-8 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center z-10 text-[10px] font-bold text-gray-500 shadow-sm">
                                {new Date(islem.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}).slice(0,5)}
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                <div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase
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
                            <p className="text-gray-400 text-sm">Kayıt yok.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    </main>
  );
}