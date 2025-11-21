import { supabase } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';
import { ArrowLeft, ShieldCheck, Calendar } from 'lucide-react';
import Link from 'next/link';
import AsiSatiri from '@/components/AsiSatiri';

export const revalidate = 0;

export default async function AsiTakvimiPage() {
  // 1. Seçili Bebeği Bul
  const cookieStore = await cookies();
  const seciliId = Number(cookieStore.get('secili_bebek')?.value) || 1; // Varsayılan 1

  // Bebek ismini çek
  const { data: bebek } = await supabase.from('bebekler').select('ad').eq('id', seciliId).single();

  // 2. Tüm Aşı Takvimini Çek
  const { data: takvim } = await supabase
    .from('asi_takvimi')
    .select('*')
    .order('ay', { ascending: true });

  // 3. Bebeğin Yaptırdığı Aşıları Çek
  const { data: yapilanlar } = await supabase
    .from('asi_durumu')
    .select('asi_id')
    .eq('bebek_id', seciliId);

  // Yapılan aşı ID'lerini basit bir diziye çevir (Kontrol kolay olsun diye)
  const yapilanAsiIdleri = yapilanlar?.map(y => y.asi_id) || [];

  // 4. Veriyi Grupla (Aylara Göre)
  // Örn: { 0: [Aşı1, Aşı2], 2: [Aşı3, Aşı4] }
  const gruplanmisAsilar: Record<number, any[]> = {};
  
  takvim?.forEach((asi) => {
    if (!gruplanmisAsilar[asi.ay]) {
        gruplanmisAsilar[asi.ay] = [];
    }
    gruplanmisAsilar[asi.ay].push(asi);
  });

  // Ay Başlıkları İçin Yardımcı Fonksiyon
  const ayBasligi = (ay: number) => {
    if (ay === 0) return "Doğumda";
    if (ay === 1) return "1. Ayın Sonu";
    if (ay === 12) return "1 Yaş (12. Ay)";
    if (ay === 24) return "2 Yaş (24. Ay)";
    return `${ay}. Ayın Sonu`;
  };

  return (
    <main className="min-h-screen bg-white pb-24">
        
        {/* Header */}
        <header className="p-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white z-10">
            <Link href="/gelisim" className="p-2 bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
                <h1 className="font-bold text-gray-800 text-lg">Aşı Takvimi</h1>
                <p className="text-xs text-gray-500">{bebek?.ad || 'Bebek'} için T.C. Sağlık Bakanlığı Takvimi</p>
            </div>
        </header>

        <div className="p-4 space-y-8">
            {/* Her Ay Grubu İçin Döngü */}
            {Object.keys(gruplanmisAsilar).map((ayStr) => {
                const ay = parseInt(ayStr);
                const asilar = gruplanmisAsilar[ay];
                
                // O aydaki tüm aşılar yapıldı mı? (Görsel Süsleme)
                const hepsiTamam = asilar.every(a => yapilanAsiIdleri.includes(a.id));

                return (
                    <div key={ay} className="relative">
                        {/* Ay Başlığı */}
                        <div className="flex items-center gap-3 mb-3 sticky top-20 z-0 bg-white py-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border 
                                ${hepsiTamam ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                {ayBasligi(ay)}
                            </div>
                            <div className="h-px bg-gray-100 flex-1"></div>
                        </div>

                        {/* Aşı Listesi */}
                        <div className="space-y-3 pl-2 border-l-2 border-gray-100 ml-4">
                            {asilar.map((asi) => (
                                <AsiSatiri 
                                    key={asi.id} 
                                    asi={asi} 
                                    yapildiMi={yapilanAsiIdleri.includes(asi.id)} 
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>

    </main>
  );
}