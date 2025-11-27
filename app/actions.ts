'use server'

import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from 'cloudinary'; 
import { cookies } from 'next/headers';

// --- 1. CLOUDINARY AYARLARI ---
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, // .env.local içindeki server-side key
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// --- 2. YARDIMCI: SUPABASE CLIENT ---
async function getSupabaseClient() {
    const cookieStore = await cookies();
    return createServerClient(
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
    );
}

// --- 3. YARDIMCI: SEÇİLİ BEBEK ID ---
async function getSeciliBebekId() {
  const cookieStore = await cookies();
  const seciliId = cookieStore.get('secili_bebek')?.value;
  return seciliId ? parseInt(seciliId) : 0; 
}

// ==========================================
//              BEBEK İŞLEMLERİ
// ==========================================

export async function bebekSec(bebekId: number) {
  const cookieStore = await cookies();
  cookieStore.set('secili_bebek', bebekId.toString());
  revalidatePath('/'); 
}

export async function yeniBebekEkle(formData: FormData) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false; 

  const ad = formData.get('ad') as string;
  const dogum_tarihi = formData.get('dogum_tarihi') as string;
  const cinsiyet = formData.get('cinsiyet') as string;
  const boy = parseFloat(formData.get('boy') as string) || 0;
  const kilo = parseFloat(formData.get('kilo') as string) || 0;
  const resimDosyasi = formData.get('resim') as File;
  
  let resimUrl = null;
  // Küçük resimler için sunucu tarafı yükleme
  if (resimDosyasi && resimDosyasi.size > 0) {
    try {
      const arrayBuffer = await resimDosyasi.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'bebek-profil', transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }] },
          (error, result) => { if (error) reject(error); else resolve(result); }
        ).end(buffer);
      });
      resimUrl = uploadResult.secure_url;
    } catch (error) { console.error("Bebek resim hatası:", error); }
  }

  const { error } = await supabase.from('bebekler').insert([{ 
      ad, dogum_tarihi, cinsiyet, 
      boy, kilo, 
      resim_url: resimUrl, 
      user_id: user.id 
  }]);

  if (error) return false;
  revalidatePath('/profil'); revalidatePath('/');
  return true;
}

export async function profilGuncelle(formData: FormData) {
  const supabase = await getSupabaseClient();
  const bebekId = await getSeciliBebekId();
  if (!bebekId) return false;

  const ad = formData.get('ad') as string;
  const dogum_tarihi = formData.get('dogum_tarihi') as string;
  const cinsiyet = formData.get('cinsiyet') as string;
  const boy = parseFloat(formData.get('boy') as string) || 0;
  const kilo = parseFloat(formData.get('kilo') as string) || 0;
  const resimDosyasi = formData.get('resim') as File;
  
  let resimUrl = null;
  if (resimDosyasi && resimDosyasi.size > 0) {
    try {
      const arrayBuffer = await resimDosyasi.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'bebek-profil', transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }, { quality: "auto" }] },
          (error, result) => { if (error) reject(error); else resolve(result); }
        ).end(buffer);
      });
      resimUrl = uploadResult.secure_url;
    } catch (error) { console.error("Profil resim hatası:", error); }
  }

  const guncellenecekVeri: any = { ad, dogum_tarihi, cinsiyet, boy, kilo };
  if (resimUrl) guncellenecekVeri.resim_url = resimUrl;

  const { error } = await supabase.from('bebekler').update(guncellenecekVeri).eq('id', bebekId);
  if (error) return false;
  revalidatePath('/profil'); revalidatePath('/');
  return true;
}

// ==========================================
//            GÜNLÜK TAKİP & SAĞLIK
// ==========================================

export async function aktiviteEkle(tip: string, detay: string) {
  const supabase = await getSupabaseClient();
  const bebekId = await getSeciliBebekId();
  if (!bebekId) return false;
  const { error } = await supabase.from('aktiviteler').insert([{ bebek_id: bebekId, tip, detay }]);
  if (error) return false;
  revalidatePath('/');
  return true;
}

export async function notKaydet(tarih: string, icerik: string) {
  const supabase = await getSupabaseClient();
  const bebekId = await getSeciliBebekId();
  if (!bebekId) return false;
  const { error } = await supabase.from('gunluk_notlar').upsert({ bebek_id: bebekId, tarih, icerik }, { onConflict: 'bebek_id, tarih' });
  if (error) return false;
  revalidatePath('/gelisim');
  return true;
}

export async function asiIsaretle(asiId: number, yapildi: boolean) {
  const supabase = await getSupabaseClient();
  const bebekId = await getSeciliBebekId();
  if (!bebekId) return false;
  if (yapildi) {
    await supabase.from('asi_durumu').insert([{ bebek_id: bebekId, asi_id: asiId, yapildi_mi: true, yapilma_tarihi: new Date().toISOString() }]);
  } else {
    await supabase.from('asi_durumu').delete().match({ bebek_id: bebekId, asi_id: asiId });
  }
  revalidatePath('/asi-takvimi');
  return true;
}

export async function atesEkle(formData: FormData) {
  const supabase = await getSupabaseClient();
  const bebekId = await getSeciliBebekId();
  if (!bebekId) return false;
  const derece = parseFloat(formData.get('derece') as string) || 0;
  const olcum_yeri = formData.get('olcum_yeri') as string;
  const ilac = formData.get('ilac') as string;
  const notlar = formData.get('notlar') as string;
  const { error } = await supabase.from('ates_takibi').insert([{ 
      bebek_id: bebekId, derece, olcum_yeri, ilac, notlar 
  }]);
  if (error) return false;
  revalidatePath('/saglik/ates');
  return true;
}

// ==========================================
//              ANNE PROFİLİ
// ==========================================

export async function anneGuncelle(formData: FormData) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const son_adet_tarihi = formData.get('son_adet_tarihi') as string;
  const dongu_suresi = parseInt(formData.get('dongu_suresi') as string) || 28;
  const su_hedefi = parseInt(formData.get('su_hedefi') as string) || 2000;
  const ad = formData.get('ad') as string;
  const resimDosyasi = formData.get('resim') as File;
  
  let resimUrl = null;
  if (resimDosyasi && resimDosyasi.size > 0) {
    try {
      const arrayBuffer = await resimDosyasi.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'anne-profil', transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }, { quality: "auto" }] },
          (error, result) => { if (error) reject(error); else resolve(result); }
        ).end(buffer);
      });
      resimUrl = uploadResult.secure_url;
    } catch (error) { console.error("Anne resim hata:", error); }
  }

  const veri: any = { user_id: user.id }; 
  if (ad) veri.ad = ad;
  if (son_adet_tarihi) veri.son_adet_tarihi = son_adet_tarihi;
  if (dongu_suresi) veri.dongu_suresi = dongu_suresi;
  if (su_hedefi) veri.su_hedefi = su_hedefi;
  if (resimUrl) veri.resim_url = resimUrl;
  
  const { error } = await supabase.from('anne_profili').upsert(veri, { onConflict: 'user_id' });
  if (error) return false;
  revalidatePath('/anne'); revalidatePath('/profil');
  return true;
}

export async function suIc() {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from('anne_profili').select('icilen_su').eq('user_id', user.id).single();
  const yeniSayi = (data?.icilen_su || 0) + 1;
  const { error } = await supabase.from('anne_profili').upsert({ user_id: user.id, icilen_su: yeniSayi }, { onConflict: 'user_id' });
  if (error) return false;
  revalidatePath('/anne'); revalidatePath('/profil');
  return true;
}

export async function suSifirla() {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from('anne_profili').update({ icilen_su: 0 }).eq('user_id', user.id);
  revalidatePath('/anne'); revalidatePath('/profil');
  return true;
}

export async function kaloriEkle(miktar: number) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from('anne_profili').select('yakilan_kalori').eq('user_id', user.id).single();
  const yeniKalori = (data?.yakilan_kalori || 0) + miktar;
  const { error } = await supabase.from('anne_profili').upsert({ user_id: user.id, yakilan_kalori: yeniKalori }, { onConflict: 'user_id' });
  if (error) return false;
  revalidatePath('/anne'); revalidatePath('/profil');
  return true;
}

// ==========================================
//            FORUM & MARKET
// ==========================================

// --- FORUM KONUSU EKLE (ARANAN FONKSİYON BU) ---
export async function konuEkle(baslik: string, icerik: string, kategori: string) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) return false;
  
  const yazarAdi = user?.email?.split('@')[0] || 'Anonim Anne';
  
  const { error } = await supabase.from('forum_konulari').insert([{ 
      baslik, 
      icerik, 
      kategori, 
      yazar_ad: yazarAdi, 
      user_id: user.id 
  }]);
  
  if (error) {
      console.error("Konu ekleme hatası:", error);
      return false;
  }
  
  revalidatePath('/forum');
  return true;
}

// --- MARKET İLANI EKLE (Direct Upload Uyumlu) ---
export async function ilanEkle(formData: FormData) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, error: "Oturum açmanız gerekiyor." };

  const baslik = formData.get('baslik') as string;
  const fiyat = parseFloat(formData.get('fiyat') as string);
  const kategori = formData.get('kategori') as string;
  const sehir = formData.get('sehir') as string;
  const ilce = formData.get('ilce') as string;
  const durum = formData.get('durum') as string;
  const iletisim = formData.get('iletisim') as string;
  
  // Direct Upload ile gelen URL'yi alıyoruz
  const resimUrl = (formData.get('resim_url') as string) || 'https://placehold.co/600x400?text=Resim+Yok';

  if (!baslik || isNaN(fiyat) || !sehir) return { success: false, error: "Zorunlu alanlar eksik." };

  const { error } = await supabase.from('urunler').insert([{ 
      baslik, fiyat, kategori, sehir, ilce, durum, 
      resim_url: resimUrl, 
      iletisim: iletisim || 'Belirtilmedi',
      user_id: user.id
  }]);

  if (error) return { success: false, error: error.message };
  revalidatePath('/takas');
  return { success: true };
}

// ==========================================
//        MEDYA (DIRECT UPLOAD)
// ==========================================

// 1. İMZA ALMA (Klasör adı parametresi eklendi!)
export async function getCloudinarySignature(folderName: string = 'bebek-medya') {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapmalısın");

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: folderName, // Dinamik klasör
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return { timestamp, signature };
}

// 2. MEDYA KAYIT
export async function medyaKaydet(baslik: string, dosyaUrl: string, sure: string, tip: string) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from('medya_kutusu').insert([{ user_id: user.id, baslik, dosya_url: dosyaUrl, tip, süre: sure }]);
  if (error) return false;
  revalidatePath('/medya');
  return true;
}

// 3. MEDYA SİLME
export async function medyaSil(id: number) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  await supabase.from('medya_kutusu').delete().match({ id, user_id: user.id });
  revalidatePath('/medya');
  return true;
}