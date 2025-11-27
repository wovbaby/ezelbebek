import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShieldCheck, ArrowLeft, UserX } from 'lucide-react';
import Link from 'next/link';
import OnayButonu from '@/components/OnayButonu';

export const revalidate = 0;

export default async function YonetimPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll() { return cookieStore.getAll() } }
    }
  );

  // 1. Giriş Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Admin Yetki Kontrolü
  // Sadece rolü 'admin' olanlar bu sayfayı görebilir.
  const { data: profil } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (profil?.rol !== 'admin') {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-red-50">
            <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-red-700">Yetkisiz Erişim</h1>
            <p className="text-red-600 mt-2">Bu sayfayı görüntülemek için yönetici olmalısınız.</p>
            <Link href="/" className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">Ana Sayfaya Dön</Link>
        </div>
    );
  }

  // 3. Onay Bekleyen Kullanıcıları Getir
  const { data: bekleyenler } = await supabase
    .from('profiles')
    .select('*')
    .eq('onayli_mi', false) // Sadece onaysızları çek
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
       
       {/* Header */}
       <header className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center gap-3">
           <Link href="/profil" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
             <ArrowLeft className="w-5 h-5 text-gray-600" />
           </Link>
           <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <ShieldCheck className="w-6 h-6 text-blue-600" /> Yönetim Paneli
           </h1>
       </header>

       <div className="p-4">
           <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider ml-1">
               Onay Bekleyen Üyeler ({bekleyenler?.length || 0})
           </h2>
           
           <div className="space-y-3">
               {bekleyenler?.map((uye) => (
                   <div key={uye.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div>
                           <p className="font-bold text-gray-800 text-sm break-all">{uye.email || "E-posta Yok"}</p>
                           <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                               Kayıt Tarihi: <span className="font-medium text-gray-600">{new Date(uye.created_at).toLocaleDateString('tr-TR')}</span>
                           </p>
                           <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded mt-2 font-bold">
                               <UserX className="w-3 h-3" /> İnceleme Bekliyor
                           </span>
                       </div>
                       
                       <div className="flex gap-2 self-end sm:self-auto">
                           {/* Onay Butonu Bileşeni */}
                           <OnayButonu userId={uye.id} />
                       </div>
                   </div>
               ))}

               {(!bekleyenler || bekleyenler.length === 0) && (
                   <div className="text-center py-16 flex flex-col items-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                       <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                           <ShieldCheck className="w-8 h-8 text-green-600" />
                       </div>
                       <p className="text-gray-800 font-bold text-sm">Her şey yolunda!</p>
                       <p className="text-xs text-gray-500 mt-1">Şu an onay bekleyen yeni üye yok.</p>
                   </div>
               )}
           </div>
       </div>
    </main>
  );
}