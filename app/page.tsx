import { supabase } from '@/lib/supabaseClient';
import { Baby, Utensils, Moon, Wind } from 'lucide-react';
import HizliIslem from '@/components/HizliIslem';

// Sayfanın her açılışta veriyi taze çekmesini sağlar
export const revalidate = 0;

export default async function Home() {
  // 1. Bebek Bilgisi (Resim URL dahil)
  const { data: bebekler } = await supabase
    .from('bebekler')
    .select('*')
    .limit(1);
  
  const bebek = bebekler?.[0];
  const bebekIsmi = bebek?.ad || "Bebek";
  const bebekResmi = bebek?.resim_url;

  // 2. Son Aktiviteleri Çek
  const { data: aktiviteler } = await supabase
    .from('aktiviteler')
    .select('*')
    .order('created_at', { ascending: false }) // En yeni en üstte
    .limit(10); // Son 10 işlem

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-blue-100 text-sm font-medium">Hoş Geldin</h2>
            <h1 className="text-2xl font-bold tracking-wide">{bebekIsmi}</h1>
          </div>
          
          {/* DİNAMİK PROFİL RESMİ ALANI */}
          <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm border border-white/30 shadow-sm">
            {bebekResmi ? (
                <img 
                    src={bebekResmi} 
                    alt={bebekIsmi} 
                    className="w-12 h-12 rounded-full object-cover"
                />
            ) : (
                <div className="w-12 h-12 flex items-center justify-center">
                    <Baby className="w-7 h-7 text-white" />
                </div>
            )}
          </div>

        </div>
      </header>

      <div className="flex-1 px-6 -mt-8 z-20 relative">
        
        {/* YENİ BUTONLAR VE POPUP BURADA */}
        <HizliIslem />

        {/* CANLI LİSTE */}
        <div className="mb-24"> {/* Alt menü payı için margin arttırdık */}
            <h3 className="text-gray-800 font-bold text-lg mb-3">Son Hareketler</h3>
            
            <div className="space-y-3">
                {aktiviteler?.map((islem) => {
                    // İkonu tipe göre belirle
                    let Icon = Baby;
                    if (islem.tip === 'mama') Icon = Utensils;
                    if (islem.tip === 'bez') Icon = Wind;
                    if (islem.tip === 'uyku') Icon = Moon;

                    return (
                        <div key={islem.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            
                            {/* Dinamik Renkli İkon Kutusu */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                ${islem.tip === 'mama' ? 'bg-orange-100 text-orange-600' : 
                                  islem.tip === 'bez' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                <Icon className="w-5 h-5" /> 
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                {/* Tip ve Detay */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 capitalize leading-tight">
                                            {islem.tip}
                                        </p>
                                        {/* Detay varsa göster */}
                                        <p className="text-xs text-gray-600 font-medium mt-0.5 truncate">
                                            {islem.detay || "Detay yok"}
                                        </p>
                                    </div>
                                    
                                    {/* Saat */}
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                        {new Date(islem.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>

                        </div>
                    );
                })}
                
                {(!aktiviteler || aktiviteler.length === 0) && (
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-sm">Henüz kayıt yok.</p>
                        <p className="text-xs text-gray-300 mt-1">Yukarıdan eklemeye başla!</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </main>
  );
}