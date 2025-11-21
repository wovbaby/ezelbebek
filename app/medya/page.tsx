import { supabase } from '@/lib/supabaseClient';
import { PlayCircle, Music, BookOpen, Zap, PauseCircle } from 'lucide-react';
import SesOynatici from '@/components/SesOynatici'; // Birazdan yapacağız

export const revalidate = 0;

export default async function MedyaPage() {
  // Tüm medyaları çek
  const { data: medyalar } = await supabase
    .from('medya')
    .select('*')
    .order('kategori', { ascending: true });

  // Kategorilere Ayır
  const kolikSesleri = medyalar?.filter(m => m.kategori === 'Kolik') || [];
  const ninniler = medyalar?.filter(m => m.kategori === 'Ninni') || [];
  const masallar = medyalar?.filter(m => m.kategori === 'Masal') || [];

  return (
    <main className="min-h-screen bg-slate-900 text-white pb-32">
        
        {/* Header */}
        <header className="p-6 sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Music className="w-6 h-6 text-purple-400" />
                Uyku & Masal
            </h1>
            <p className="text-xs text-slate-400">Bebeğiniz için rahatlatıcı sesler</p>
        </header>

        <div className="p-6 space-y-8">
            
            {/* 1. KOLİK SESLERİ (Yatay Kaydırma) */}
            <section>
                <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" /> Beyaz Gürültü (Kolik)
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {kolikSesleri.map((ses) => (
                        <SesOynatici key={ses.id} veri={ses} />
                    ))}
                </div>
            </section>

            {/* 2. NİNNİLER (Liste) */}
            <section>
                <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4 text-blue-400" /> Ninniler
                </h2>
                <div className="space-y-3">
                    {ninniler.map((ses) => (
                        <SesOynatici key={ses.id} veri={ses} tip="liste" />
                    ))}
                </div>
            </section>

            {/* 3. MASALLAR (Kartlar) */}
            <section>
                <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-400" /> Masallar
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {masallar.map((ses) => (
                        <SesOynatici key={ses.id} veri={ses} tip="kart" />
                    ))}
                </div>
            </section>

        </div>
    </main>
  );
}