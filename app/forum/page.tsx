import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Plus, Search, User } from 'lucide-react';

export const revalidate = 0;

export default async function ForumPage() {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: konular, error } = await supabase
    .from('forum_konulari')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Forum hatası:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white p-4 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-6 h-6 text-green-500" />
                <h1 className="text-xl font-bold text-gray-800">Yardımlaşma</h1>
            </div>
            <div className="relative">
                <input type="text" placeholder="Konu ara..." className="w-full bg-gray-100 p-3 pl-10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-200" />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>
        </div>

        <div className="p-4 space-y-4">
            <Link href="/forum/sor" className="block">
                <div className="bg-green-500 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                    <Plus className="w-5 h-5" /> Yeni Soru Sor
                </div>
            </Link>

            <div className="space-y-3">
                {konular?.map((konu) => (
                    <div key={konu.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold uppercase">{konu.kategori}</span>
                            <span className="text-[10px] text-gray-400">{new Date(konu.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm mb-1">{konu.baslik}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{konu.icerik}</p>
                        
                        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center"><User className="w-3 h-3" /></div>
                                {konu.yazar_ad || 'Anonim'}
                            </div>
                            {/* Tıklanan Link: /forum/123 */}
                            <Link href={`/forum/${konu.id}`} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline p-2">
                                Yorum Yap &rarr;
                            </Link>
                        </div>
                    </div>
                ))}
                {(!konular || konular.length === 0) && <div className="text-center py-10 text-gray-400 text-sm">Henüz konu yok.</div>}
            </div>
        </div>
    </main>
  );
}