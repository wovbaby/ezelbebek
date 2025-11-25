import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Baby, Plus, Edit2, Calendar, Weight, Ruler } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0;

export default async function ProfilPage() {
  const cookieStore = await cookies()

  // 1. Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
           try {
             cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
           } catch {}
        },
      },
    }
  )

  // 2. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 3. SADECE BENİM BEBEKLERİMİ GETİR (.eq('user_id', user.id))
  // İŞTE EKSİK OLAN KISIM BURASIYDI 👇
  const { data: bebekler } = await supabase
    .from('bebekler')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // 4. Anne Profilini Getir (Opsiyonel, varsa)
  const { data: anne } = await supabase
    .from('anne_profili')
    .select('*')
    .eq('id', 1) // İlerde bunu da user_id'ye bağlayacağız
    .single()

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Üst Başlık */}
      <div className="bg-white p-6 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800">Profil Yönetimi</h1>
        <p className="text-gray-500 text-sm">Bebeklerini ve kendi profilini düzenle</p>
      </div>

      <div className="p-5 space-y-6">
        
        {/* --- ANNE PROFİL KARTI --- */}
        <section>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-700">Anne Profili</h2>
                <Link href="/anne" className="text-blue-600 text-sm font-medium">Düzenle</Link>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                {anne?.resim_url ? (
                    <img src={anne.resim_url} className="w-16 h-16 rounded-full object-cover border-2 border-pink-100" alt="Anne" />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-pink-400">
                        <Baby className="w-8 h-8" />
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-gray-900">{anne?.ad || "Anne"}</h3>
                    <p className="text-sm text-gray-500">Hedef: {anne?.su_hedefi || 2000}ml su</p>
                </div>
            </div>
        </section>

        {/* --- BEBEK LİSTESİ --- */}
        <section>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-700">Bebeklerim</h2>
                <Link href="/profil/ekle" className="flex items-center gap-1 text-blue-600 text-sm font-medium bg-blue-50 px-3 py-1.5 rounded-full">
                    <Plus className="w-4 h-4" /> Yeni Ekle
                </Link>
            </div>

            <div className="space-y-3">
                {bebekler && bebekler.map((bebek) => (
                    <div key={bebek.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        
                        <div className="flex items-start gap-4">
                            {/* Bebek Resmi */}
                            <div className="shrink-0">
                                {bebek.resim_url ? (
                                    <img src={bebek.resim_url} className="w-20 h-20 rounded-xl object-cover" alt={bebek.ad} />
                                ) : (
                                    <div className="w-20 h-20 rounded-xl bg-blue-50 flex items-center justify-center text-blue-400">
                                        <Baby className="w-10 h-10" />
                                    </div>
                                )}
                            </div>

                            {/* Bilgiler */}
                            <div className="flex-1 min-w-0 pt-1">
                                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{bebek.ad}</h3>
                                
                                <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {bebek.dogum_tarihi}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Weight className="w-3.5 h-3.5" />
                                        {bebek.kilo} kg
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Ruler className="w-3.5 h-3.5" />
                                        {bebek.boy} cm
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Düzenle Butonu (Sağ Alt) */}
                        <Link 
                            href={`/profil/duzenle?id=${bebek.id}`}
                            className="absolute bottom-3 right-3 bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-lg transition"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Link>
                    </div>
                ))}

                {(!bebekler || bebekler.length === 0) && (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-3">Henüz bebek eklenmemiş.</p>
                        <Link href="/profil/ekle" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                            İlk Bebeğini Ekle
                        </Link>
                    </div>
                )}
            </div>
        </section>

      </div>
    </div>
  )
}