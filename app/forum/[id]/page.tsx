import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, MessageCircle, Clock } from 'lucide-react';
import YorumFormu from '@/components/YorumFormu'; 

export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>
}

export default async function ForumDetayPage(props: Props) {
  // Next.js 15 params
  const params = await props.params;
  const konuId = parseInt(params.id);

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
      },
    }
  );

  // 1. Konuyu Getir
  const { data: konu, error } = await supabase
    .from('forum_konulari')
    .select('*')
    .eq('id', konuId)
    .single();

  if (error || !konu) {
      return <div className="p-10 text-center">Konu bulunamadı.</div>;
  }

  // 2. Yorumları Getir
  const { data: yorumlar } = await supabase
    .from('forum_yorumlari')
    .select('*')
    .eq('konu_id', konuId)
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
        
        {/* Header */}
        <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3">
            <Link href="/forum" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="font-bold text-gray-800 text-lg truncate">Forum Detayı</h1>
        </div>

        <div className="p-4 space-y-4">
            
            {/* --- KONU KARTI --- */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100">
                <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-1 rounded-md font-bold uppercase mb-2 inline-block">
                    {konu.kategori}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{konu.baslik}</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{konu.icerik}</p>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
                    <User className="w-3 h-3" /> {konu.yazar_ad || 'Anonim'}
                    <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                    <Clock className="w-3 h-3" /> {new Date(konu.created_at).toLocaleDateString('tr-TR')}
                </div>
            </div>

            {/* --- YORUMLAR LİSTESİ --- */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2 ml-1">
                    <MessageCircle className="w-4 h-4" /> Yorumlar ({yorumlar?.length || 0})
                </h3>

                {yorumlar?.map((yorum) => (
                    <div key={yorum.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-xs text-purple-600">{yorum.yazar_ad || 'Anonim'}</span>
                            <span className="text-[10px] text-gray-400">{new Date(yorum.created_at).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm text-gray-700">{yorum.icerik}</p>
                    </div>
                ))}

                {(!yorumlar || yorumlar.length === 0) && (
                    <p className="text-center text-gray-400 text-xs py-4">Henüz yorum yok. İlk yorumu sen yap!</p>
                )}
            </div>
        </div>

        {/* --- YORUM YAPMA ALANI (SABİT ALT BAR) --- */}
        <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 z-20">
            <div className="max-w-md mx-auto">
                {/* Yorum Formunu Buraya Koyuyoruz */}
                <YorumFormu konuId={konuId} />
            </div>
        </div>

    </div>
  );
}