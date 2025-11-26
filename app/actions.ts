'use server'

import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from 'cloudinary'; 
import { cookies } from 'next/headers';

// Cloudinary Ayarları
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// --- YARDIMCI: SUPABASE CLIENT ---
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

// --- YARDIMCI: BEBEK ID ---
async function getSeciliBebekId() {
  const cookieStore = await cookies();
  const seciliId = cookieStore.get('secili_bebek')?.value;
  return seciliId ? parseInt(seciliId) : 0; 
}

// --- BEBEK DEĞİŞTİRME ---
export async function bebekSec(bebekId: number) {
  const cookieStore = await cookies();
  cookieStore.set('secili_bebek', bebekId.toString());
  revalidatePath('/'); 
}

// 1. AKTİVİTE EKLEME
export async function aktiviteEkle(tip: string, detay: string) {
  const supabase = await getSupabaseClient();
  const bebekId = await getSeciliBebekId();
  if (!bebekId) return false;
  const { error } = await supabase.from('aktiviteler').insert([{ bebek_id: bebekId, tip, detay }]);
  if (error) return false;
  revalidatePath('/');
  return true;
}

// 2. GÜNLÜK NOT
export async function notKaydet(tarih: string, icerik: string) {
  const supabase = await getSupabaseClient();
  const bebekId = await getSeciliBebekId();
  if (!bebekId) return false;
  const { error } = await supabase.from('gunluk_notlar').upsert({ bebek_id: bebekId, tarih, icerik }, { onConflict: 'bebek_id, tarih' });
  if (error) return false;
  revalidatePath('/gelisim');
  return true;
}

// 3. FORUM KONUSU
export async function konuEkle(baslik: string, icerik: string, kategori: string) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const yazarAdi = user?.email?.split('@')[0] || 'Anonim Anne';
  const { error } = await supabase.from('forum_konulari').insert([{ baslik, icerik, kategori, yazar_ad: yazarAdi, user_id: user?.id }]);
  if (error) return false;
  revalidatePath('/forum');
  return true;
}

// 4. TAKAS İLANI
export async function ilanEkle(formData: FormData) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const baslik = formData.get('baslik') as string;
  const fiyat = formData.get('fiyat') as string;
  const kategori = formData.get('kategori') as string;
  const sehir = formData.get('sehir') as string;
  const ilce = formData.get('ilce') as string;
  const durum = formData.get('durum') as string;
  
  const resimDosyasi = formData.get('resim') as File;
  let resimUrl = 'https://images.unsplash.com/photo-1555252333-9f8e92e65df4?w=500&q=80';

  if (resimDosyasi && resimDosyasi.size > 0) {
    try {
      const arrayBuffer = await resimDosyasi.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'bebek-pwa-urunler', transformation: [{ width: 800, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }] },
          (error, result) => { if (error) reject(error); else resolve(result); }
        ).end(buffer);
      });
      resimUrl = uploadResult.secure_url;
    } catch (error) { console.error("Resim hatası:", error); }
  }

  const { error } = await supabase.from('urunler').insert([{ 
      baslik, fiyat, kategori, sehir, ilce, durum, 
      resim_url: resimUrl, 
      iletisim: '0555-XXX-XX-XX',
      user_id: user?.id
  }]);

  if (error) return false;
  revalidatePath('/takas');
  return true;
}

// 5. BEBEK PROFİL GÜNCELLEME
export async function profilGuncelle(formData: FormData) {
  const supabase = await getSupabaseClient();
  const bebekId = await getSeciliBebekId();
  if (!bebekId) return false;

  const ad = formData.get('ad') as string;
  const dogum_tarihi = formData.get('dogum_tarihi') as string;
  const cinsiyet = formData.get('cinsiyet') as string;
  const boy = formData.get('boy') as string;
  const kilo = formData.get('kilo') as string;
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

  const guncellenecekVeri: any = { ad, dogum_tarihi, cinsiyet, boy: parseFloat(boy), kilo: parseFloat(kilo) };
  if (resimUrl) guncellenecekVeri.resim_url = resimUrl;

  const { error } = await supabase.from('bebekler').update(guncellenecekVeri).eq('id', bebekId);
  if (error) return false;
  revalidatePath('/profil'); revalidatePath('/');
  return true;
}

// 6. YENİ BEBEK EKLEME
export async function yeniBebekEkle(formData: FormData) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false; 

  const ad = formData.get('ad') as string;
  const dogum_tarihi = formData.get('dogum_tarihi') as string;
  const cinsiyet = formData.get('cinsiyet') as string;
  const boy = formData.get('boy') as string;
  const kilo = formData.get('kilo') as string;
  const resimDosyasi = formData.get('resim') as File;
  
  let resimUrl = null;
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
    } catch (error) { console.error("Yeni bebek resim hatası:", error); }
  }

  const { error } = await supabase.from('bebekler').insert([{ 
      ad, dogum_tarihi, cinsiyet, boy: parseFloat(boy)||0, kilo: parseFloat(kilo)||0, resim_url: resimUrl,
      user_id: user.id 
  }]);

  if (error) { console.error("Bebek ekleme db hatası:", error); return false; }
  revalidatePath('/profil'); revalidatePath('/');
  return true;
}

// 7. AŞI İŞARETLEME
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

// 8. ANNE - SU İÇME (GÜNCELLENDİ: user_id ile)
export async function suIc() {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase.from('anne_profili').select('icilen_su').eq('user_id', user.id).single();
  const yeniSayi = (data?.icilen_su || 0) + 1;
  
  // onConflict: 'user_id' olmalı (Veritabanında unique ise)
  const { error } = await supabase.from('anne_profili').upsert({ user_id: user.id, icilen_su: yeniSayi }, { onConflict: 'user_id' });
  
  if (error) return false;
  revalidatePath('/anne'); revalidatePath('/profil');
  return true;
}

// 9. ANNE - SU SIFIRLA (GÜNCELLENDİ: user_id ile)
export async function suSifirla() {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('anne_profili').update({ icilen_su: 0 }).eq('user_id', user.id);
  revalidatePath('/anne'); revalidatePath('/profil');
  return true;
}

// 10. ANNE - GÜNCELLEME (GÜNCELLENDİ: user_id ile)
export async function anneGuncelle(formData: FormData) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const son_adet_tarihi = formData.get('son_adet_tarihi') as string;
  const dongu_suresi = formData.get('dongu_suresi') as string;
  const su_hedefi = formData.get('su_hedefi') as string;
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

  const veri: any = { user_id: user.id }; // ID yerine user_id
  if (ad) veri.ad = ad;
  if (son_adet_tarihi) veri.son_adet_tarihi = son_adet_tarihi;
  if (dongu_suresi) veri.dongu_suresi = parseInt(dongu_suresi);
  if (su_hedefi) veri.su_hedefi = parseInt(su_hedefi);
  if (resimUrl) veri.resim_url = resimUrl;
  
  const { error } = await supabase.from('anne_profili').upsert(veri, { onConflict: 'user_id' });
  if (error) return false;
  revalidatePath('/anne'); revalidatePath('/profil');
  return true;
}

// 11. ATEŞ KAYDI
export async function atesEkle(formData: FormData) {
  const supabase = await getSupabaseClient();
  const bebekId = await getSeciliBebekId();
  if (!bebekId) return false;
  const derece = formData.get('derece') as string;
  const olcum_yeri = formData.get('olcum_yeri') as string;
  const ilac = formData.get('ilac') as string;
  const notlar = formData.get('notlar') as string;
  const { error } = await supabase.from('ates_takibi').insert([{ 
      bebek_id: bebekId, derece: parseFloat(derece), olcum_yeri, ilac, notlar 
  }]);
  if (error) return false;
  revalidatePath('/saglik/ates');
  return true;
}

// 12. ANNE - SPOR (GÜNCELLENDİ: user_id ile)
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
// --- app/actions.ts DOSYASININ EN ALTINA EKLE ---

// 13. MEDYA YÜKLEME (Ses Dosyası veya Kayıt)
export async function medyaYukle(formData: FormData) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const baslik = formData.get('baslik') as string;
  const tip = formData.get('tip') as string; // 'ninni' veya 'kayit'
  const dosya = formData.get('dosya') as File;

  let dosyaUrl = null;
  let sure = "00:00"; // Süre hesaplama frontend'de yapılabilir veya varsayılan kalır

  if (dosya && dosya.size > 0) {
    try {
      const arrayBuffer = await dosya.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: 'bebek-medya', 
            resource_type: "video", // Ses dosyaları için 'video' veya 'auto' kullanılır
            format: 'mp3' // Formatı zorlayalım
          },
          (error, result) => { if (error) reject(error); else resolve(result); }
        ).end(buffer);
      });
      dosyaUrl = uploadResult.secure_url;
      // Cloudinary süreyi saniye olarak verir, dakikaya çevirebiliriz (uploadResult.duration)
      if (uploadResult.duration) {
         const dk = Math.floor(uploadResult.duration / 60);
         const sn = Math.floor(uploadResult.duration % 60);
         sure = `${dk}:${sn < 10 ? '0'+sn : sn}`;
      }
    } catch (error) { console.error("Medya yükleme hatası:", error); return false; }
  }

  const { error } = await supabase.from('medya_kutusu').insert([{
    user_id: user.id,
    baslik,
    dosya_url: dosyaUrl,
    tip,
    süre: sure
  }]);

  if (error) return false;
  revalidatePath('/medya');
  return true;
}

// 14. MEDYA SİLME
export async function medyaSil(id: number) {
  const supabase = await getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  await supabase.from('medya_kutusu').delete().match({ id, user_id: user.id });
  revalidatePath('/medya');
  return true;
}