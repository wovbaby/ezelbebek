import { supabase } from '@/lib/supabaseClient';
import { Sparkles, Star, Moon, Sun, BrainCircuit } from 'lucide-react';
import { cookies } from 'next/headers';

export const revalidate = 0;

// --- YARDIMCI: BURÇ HESAPLAMA ---
function burcHesapla(tarih: string) {
  const d = new Date(tarih);
  const gun = d.getDate();
  const ay = d.getMonth() + 1;

  if ((ay == 1 && gun <= 20) || (ay == 12 && gun >= 22)) return "Oğlak";
  if ((ay == 1 && gun >= 21) || (ay == 2 && gun <= 18)) return "Kova";
  if ((ay == 2 && gun >= 19) || (ay == 3 && gun <= 20)) return "Balık";
  if ((ay == 3 && gun >= 21) || (ay == 4 && gun <= 20)) return "Koç";
  if ((ay == 4 && gun >= 21) || (ay == 5 && gun <= 20)) return "Boğa";
  if ((ay == 5 && gun >= 21) || (ay == 6 && gun <= 21)) return "İkizler";
  if ((ay == 6 && gun >= 22) || (ay == 7 && gun <= 22)) return "Yengeç";
  if ((ay == 7 && gun >= 23) || (ay == 8 && gun <= 22)) return "Aslan";
  if ((ay == 8 && gun >= 23) || (ay == 9 && gun <= 22)) return "Başak";
  if ((ay == 9 && gun >= 23) || (ay == 10 && gun <= 22)) return "Terazi";
  if ((ay == 10 && gun >= 23) || (ay == 11 && gun <= 21)) return "Akrep";
  if ((ay == 11 && gun >= 22) || (ay == 12 && gun <= 21)) return "Yay";
  return "Bilinmiyor";
}

// --- YARDIMCI: GÜNLÜK "AI" MESAJI ÜRETİCİ ---
function gunlukYorumUret(burc: string, bebekAdi: string) {
  const girisler = [
    `Bugün ${burc} burcu enerjisi ${bebekAdi} üzerinde çok belirgin.`,
    `Yıldızlar bugün ${bebekAdi} için hareketli bir gün fısıldıyor.`,
    `Sevgili anne, bugün ${bebekAdi} biraz daha duygusal olabilir çünkü Ay'ın konumu onu etkiliyor.`,
    `${burc} burcunun meraklı yapısı bugün ${bebekAdi}'de zirve yapacak.`,
  ];
  
  const gelismeler = [
    "Yeni bir ses veya hareket keşfedebilir, onu dikkatle izle.",
    "Uykusunda biraz mızmızlanabilir ama kucağında hemen sakinleşecek.",
    "İştahı bugün biraz değişken olabilir, zorlama, akışına bırak.",
    "Bugün oyun halısında geçireceği vakit, motor becerilerine seviye atlatacak.",
    "Sana gülücükler saçarak enerjini tazeleyecek."
  ];

  const tavsiyeler = [
    "Ona bol bol şarkı söyle, bugün işitsel algısı çok açık.",
    "Banyo saatini biraz uzat, suyla oynamak onu çok rahatlatacak.",
    "Bugün sarılma günü! Ten teması ikinize de iyi gelecek.",
    "Eğer huzursuzsa, klasik müzik veya doğa sesleri açmayı dene.",
    "Odasını havalandır ve bugünü sakin geçirmeye çalış."
  ];

  // Rastgele seçim yap (Her gün değişmesi için tarih bazlı da yapılabilir ama şimdilik random)
  const r1 = girisler[Math.floor(Math.random() * girisler.length)];
  const r2 = gelismeler[Math.floor(Math.random() * gelismeler.length)];
  const r3 = tavsiyeler[Math.floor(Math.random() * tavsiyeler.length)];

  return `${r1} ${r2} ${r3}`;
}

export default async function AstrolojiPage() {
  // 1. Seçili Bebeği Bul
  const cookieStore = await cookies();
  const seciliId = Number(cookieStore.get('secili_bebek')?.value) || 0;
  
  // Eğer cookie yoksa ilk bebeği al (Auth sistemine göre güncellemek gerekir ileride)
  let { data: bebek } = await supabase.from('bebekler').select('*').eq('id', seciliId).single();
  
  // Eğer bebek bulunamazsa (ilk açılış) rastgele birini al veya placeholder yap
  if (!bebek) {
     const { data: ilkBebek } = await supabase.from('bebekler').select('*').limit(1).single();
     bebek = ilkBebek;
  }

  if (!bebek) return <div className="p-10 text-center">Önce bir bebek eklemelisin.</div>;

  const burc = burcHesapla(bebek.dogum_tarihi);
  const yorum = gunlukYorumUret(burc, bebek.ad);

  return (
    <main className="min-h-screen bg-indigo-950 text-white pb-32 relative overflow-hidden">
        
        {/* Arka Plan Efektleri */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-10 left-10 w-2 bg-white h-2 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-1 bg-white h-1 rounded-full animate-pulse delay-75"></div>
            <div className="absolute bottom-20 left-1/3 w-1.5 bg-white h-1.5 rounded-full animate-pulse delay-150"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-40"></div>
            <div className="absolute top-1/3 -left-20 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-30"></div>
        </div>

        <div className="relative z-10 p-6">
            
            {/* Header */}
            <header className="text-center mb-8 mt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                </div>
                <h1 className="text-2xl font-bold tracking-wide">Yıldız Rehberi</h1>
                <p className="text-indigo-200 text-xs uppercase tracking-widest mt-1">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </header>

            {/* Burç Kartı */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl group-hover:bg-yellow-400/40 transition-all"></div>
                
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-indigo-300 text-xs font-bold uppercase">Bebeğin Burcu</p>
                        <h2 className="text-3xl font-bold text-white mt-1">{burc}</h2>
                    </div>
                    <Moon className="w-10 h-10 text-indigo-200" />
                </div>
                
                <div className="flex gap-2 text-xs font-medium text-indigo-100">
                    <span className="px-3 py-1 bg-indigo-800/50 rounded-full border border-indigo-500/30">Duygusal</span>
                    <span className="px-3 py-1 bg-indigo-800/50 rounded-full border border-indigo-500/30">Sezgisel</span>
                    <span className="px-3 py-1 bg-indigo-800/50 rounded-full border border-indigo-500/30">Enerjik</span>
                </div>
            </div>

            {/* AI Yorum Alanı */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 border border-indigo-700/50 shadow-2xl relative">
                <div className="flex items-center gap-2 mb-4">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-sm text-purple-200">AI Günlük Analiz</h3>
                </div>
                
                <p className="text-sm leading-7 text-indigo-50 font-light tracking-wide">
                    {yorum}
                </p>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] text-indigo-400">Ezel Bebek AI v1.0</span>
                    <button className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors">
                        Paylaş
                    </button>
                </div>
            </div>

        </div>
    </main>
  );
}