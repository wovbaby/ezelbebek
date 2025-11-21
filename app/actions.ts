'use server'

import { supabase } from "@/lib/supabaseClient";
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

// --- YARDIMCI: SEÇİLİ BEBEK ID'SİNİ BUL ---
async function getSeciliBebekId() {
  const cookieStore = await cookies();
  const seciliId = cookieStore.get('secili_bebek')?.value;
  return seciliId ? parseInt(seciliId) : 1; 
}

// --- BEBEK DEĞİŞTİRME ---
export async function bebekSec(bebekId: number) {
  const cookieStore = await cookies();
  cookieStore.set('secili_bebek', bebekId.toString());
  revalidatePath('/'); 
}

// 1. AKTİVİTE EKLEME
export async function aktiviteEkle(tip: string, detay: string) {
  const bebekId = await getSeciliBebekId();
  const { error } = await supabase.from('aktiviteler').insert([{ bebek_id: bebekId, tip, detay }]);
  if (error) return false;
  revalidatePath('/');
  return true;
}

// 2. GÜNLÜK NOT
export async function notKaydet(tarih: string, icerik: string) {
  const bebekId = await getSeciliBebekId();
  const { error } = await supabase.from('gunluk_notlar').upsert({ bebek_id: bebekId, tarih, icerik }, { onConflict: 'bebek_id, tarih' });
  if (error) return false;
  revalidatePath('/gelisim');
  return true;
}

// 3. FORUM KONUSU
export async function konuEkle(baslik: string, icerik: string, kategori: string) {
  const { error } = await supabase.from('forum_konulari').insert([{ baslik, icerik, kategori, yazar_ad: 'Anonim Anne' }]);
  if (error) return false;
  revalidatePath('/forum');
  return true;
}

// 4. TAKAS İLANI (Resimli + İlçeli)
export async function ilanEkle(formData: FormData) {
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

  const { error } = await supabase.from('urunler').insert([{ baslik, fiyat, kategori, sehir, ilce, durum, resim_url: resimUrl, iletisim: '0555-XXX-XX-XX' }]);
  if (error) return false;
  revalidatePath('/takas');
  return true;
}

// 5. BEBEK PROFİL GÜNCELLEME (Resimli)
export async function profilGuncelle(formData: FormData) {
  const bebekId = await getSeciliBebekId();
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

  const { error } = await supabase.from('bebekler').insert([{ ad, dogum_tarihi, cinsiyet, boy: parseFloat(boy)||0, kilo: parseFloat(kilo)||0, resim_url: resimUrl }]);
  if (error) return false;
  revalidatePath('/profil');
  return true;
}

// 7. AŞI İŞARETLEME
export async function asiIsaretle(asiId: number, yapildi: boolean) {
  const bebekId = await getSeciliBebekId();
  if (yapildi) {
    const { error } = await supabase.from('asi_durumu').insert([{ bebek_id: bebekId, asi_id: asiId, yapildi_mi: true, yapilma_tarihi: new Date().toISOString() }]);
    if (error) console.error('Aşı hata:', error);
  } else {
    const { error } = await supabase.from('asi_durumu').delete().match({ bebek_id: bebekId, asi_id: asiId });
    if (error) console.error('Aşı silme hata:', error);
  }
  revalidatePath('/asi-takvimi');
  return true;
}

// 8. ANNE - SU İÇME
export async function suIc() {
  const { data } = await supabase.from('anne_profili').select('icilen_su').single();
  const yeniSayi = (data?.icilen_su || 0) + 1;
  const { error } = await supabase.from('anne_profili').update({ icilen_su: yeniSayi }).eq('id', 1);
  if (error) return false;
  revalidatePath('/anne');
  return true;
}

// 9. ANNE - SU SIFIRLA
export async function suSifirla() {
  const { error } = await supabase.from('anne_profili').update({ icilen_su: 0 }).eq('id', 1);
  revalidatePath('/anne');
  return true;
}

// 10. ANNE - GÜNCELLEME (Resimli)
export async function anneGuncelle(formData: FormData) {
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

  const veri: any = { id: 1 };
  if (ad) veri.ad = ad;
  if (son_adet_tarihi) veri.son_adet_tarihi = son_adet_tarihi;
  if (dongu_suresi) veri.dongu_suresi = parseInt(dongu_suresi);
  if (su_hedefi) veri.su_hedefi = parseInt(su_hedefi);
  if (resimUrl) veri.resim_url = resimUrl;
  
  const { error } = await supabase.from('anne_profili').upsert(veri, { onConflict: 'id' });
  if (error) return false;
  revalidatePath('/anne');
  return true;
}