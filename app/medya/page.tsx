import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Music, BookOpen, Zap, Mic } from 'lucide-react';
import SesOynatici from '@/components/SesOynatici'; // Genel sesler için (Eski bileşen)
import KullaniciMedyasi from '@/components/KullaniciMedyasi'; // YENİ: Kayıt ve Yükleme için

export const revalidate = 0;

export default async function MedyaPage() {
  const cookieStore = await cookies();

  // 1. Güvenli Supabase Client Oluştur
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
           try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  );

  // 2. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 3. Genel Medyaları Çek (Yönetici tarafından eklenenler)
  // Not: 'medya' tablosu yoksa hata verebilir, bu tablonun var olduğundan emin ol.
  const { data: medyalar } = await supabase
    .from('medya')
    .select('*')
    .order('kategori', { ascending: true });

  // 4. Kullanıcının Kendi Medyalarını Çek (Kayıtlar ve Yüklemeler)
  const { data: kullaniciMedyasi } = await supabase
    .from('medya_kutusu')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Kategorilere Ayır (Genel Medyalar için)
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
            
            {/* 1. ÖZEL BÖLÜM: BENİM KAYITLARIM (YENİ) */}
            <section className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                 <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-red-400" /> Benim Seslerim
                 </h2>
                 {/* Yeni Bileşeni Buraya Koyduk - Listeyi prop olarak gönderiyoruz */}
                 <KullaniciMedyasi baslangicListesi={kullaniciMedyasi || []} />
            </section>

            {/* 2. KOLİK SESLERİ (Yatay Kaydırma) */}
            {kolikSesleri.length > 0 && (
                <section>
                    <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" /> Beyaz Gürültü (Kolik)
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {kolikSesleri.map((ses) => (
                            <div key={ses.id} className="shrink-0 w-32">
                            <SesOynatici veri={ses} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 3. NİNNİLER (Liste) */}
            {ninniler.length > 0 && (
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
            )}

            {/* 4. MASALLAR (Kartlar) */}
            {masallar.length > 0 && (
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
            )}

        </div>
    </main>
  );
}