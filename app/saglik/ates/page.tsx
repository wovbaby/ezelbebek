import { supabase } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';
import { ArrowLeft, Thermometer, Pill, Activity } from 'lucide-react';
import Link from 'next/link';
import AtesForm from '@/components/AtesForm'; // Birazdan yapacağız
import AtesGrafik from '@/components/AtesGrafik'; // Birazdan yapacağız

export const revalidate = 0;

export default async function AtesPage() {
  const cookieStore = await cookies();
  const seciliId = Number(cookieStore.get('secili_bebek')?.value) || 1;

  // Son 24 saatin verilerini çek (Grafik için)
  const dun = new Date();
  dun.setDate(dun.getDate() - 1);

  const { data: kayitlar } = await supabase
    .from('ates_takibi')
    .select('*')
    .eq('bebek_id', seciliId)
    .order('created_at', { ascending: false })
    .limit(20); // Listede son 20 kayıt

  // En son ölçülen ateş
  const sonAtes = kayitlar?.[0]?.derece || 36.5;
  
  // Renk Belirle
  let durumRenk = "bg-green-500";
  let durumMetin = "Normal";
  if (sonAtes >= 37.5) { durumRenk = "bg-orange-500"; durumMetin = "Hafif Ateş"; }
  if (sonAtes >= 38.5) { durumRenk = "bg-red-500"; durumMetin = "Yüksek Ateş"; }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
        
        {/* Header */}
        <header className={`p-6 pb-12 rounded-b-[2.5rem] shadow-lg text-white transition-colors ${durumRenk}`}>
            <div className="flex items-center gap-4 mb-6">
                <Link href="/gelisim" className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-bold text-xl">Ateş Takibi</h1>
            </div>

            <div className="text-center">
                <p className="text-blue-100 text-xs uppercase font-bold tracking-widest mb-1">Son Ölçüm</p>
                <div className="flex items-center justify-center gap-2">
                    <Thermometer className="w-8 h-8 text-white/80" />
                    <span className="text-6xl font-bold">{sonAtes}</span>
                    <span className="text-2xl font-medium opacity-80">°C</span>
                </div>
                <div className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                    {durumMetin}
                </div>
            </div>
        </header>

        <div className="px-6 -mt-8 relative z-10 space-y-6">
            
            {/* GRAFİK KARTI */}
            <div className="bg-white p-4 rounded-2xl shadow-md h-64">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Ateş Seyri (Son Kayıtlar)
                </h3>
                <AtesGrafik data={kayitlar || []} />
            </div>

            {/* VERİ GİRİŞ FORMU */}
            <AtesForm />

            {/* GEÇMİŞ LİSTESİ */}
            <div className="space-y-3">
                <h3 className="text-gray-800 font-bold ml-1">Geçmiş Kayıtlar</h3>
                {kayitlar?.map((kayit) => (
                    <div key={kayit.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${kayit.derece >= 38 ? 'text-red-500' : kayit.derece >= 37.5 ? 'text-orange-500' : 'text-green-600'}`}>
                                    {kayit.derece}°C
                                </span>
                                <span className="text-xs text-gray-400">({kayit.olcum_yeri})</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(kayit.created_at).toLocaleString('tr-TR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        
                        {/* İlaç Verildiyse Göster */}
                        {kayit.ilac && kayit.ilac !== 'İlaçsız' && (
                            <div className="flex items-center gap-1bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                                <Pill className="w-4 h-4 text-purple-500" />
                                <span className="text-xs font-bold text-purple-700">{kayit.ilac}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    </main>
  );
}