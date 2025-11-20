'use server'

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from 'cloudinary'; 

// Cloudinary Ayarlarını Yapılandır
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 1. Aktivite (Hızlı İşlem) Ekleme
export async function aktiviteEkle(tip: string, detay: string) {
  const { error } = await supabase
    .from('aktiviteler')
    .insert([
      { 
        bebek_id: 1, 
        tip: tip,
        detay: detay
      }
    ]);

  if (error) {
    console.error('Aktivite hatası:', error);
    return false;
  }

  revalidatePath('/');
  return true;
}

// 2. Günlük Not Ekleme / Güncelleme
export async function notKaydet(tarih: string, icerik: string) {
  const { error } = await supabase
    .from('gunluk_notlar')
    .upsert(
      { 
        bebek_id: 1, 
        tarih: tarih, 
        icerik: icerik 
      }, 
      { onConflict: 'bebek_id, tarih' }
    );

  if (error) {
    console.error('Not hatası:', error);
    return false;
  }

  revalidatePath('/gelisim');
  return true;
}

// 3. Forum Konusu Ekle
export async function konuEkle(baslik: string, icerik: string, kategori: string) {
  const { error } = await supabase
    .from('forum_konulari')
    .insert([
      { 
        baslik, 
        icerik, 
        kategori, 
        yazar_ad: 'Anonim Anne' 
      }
    ]);

  if (error) {
    console.error('Konu ekleme hatası:', error);
    return false;
  }

  revalidatePath('/forum');
  return true;
}

// 4. Takas İlanı Ekle (CLOUDINARY + İLÇE DESTEKLİ)
export async function ilanEkle(formData: FormData) {
  const baslik = formData.get('baslik') as string;
  const fiyat = formData.get('fiyat') as string;
  const kategori = formData.get('kategori') as string;
  const sehir = formData.get('sehir') as string;
  const ilce = formData.get('ilce') as string;
  const durum = formData.get('durum') as string;
  
  const resimDosyasi = formData.get('resim') as File;
  let resimUrl = 'https://images.unsplash.com/photo-1555252333-9f8e92e65df4?w=500&q=80'; // Varsayılan

  if (resimDosyasi && resimDosyasi.size > 0) {
    try {
      const arrayBuffer = await resimDosyasi.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'bebek-pwa-urunler', 
            transformation: [
               { width: 800, crop: "limit" },
               { quality: "auto" },
               { fetch_format: "auto" }
            ] 
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      resimUrl = uploadResult.secure_url;
    } catch (error) {
      console.error("Cloudinary ürün yükleme hatası:", error);
    }
  }

  const { error } = await supabase
    .from('urunler')
    .insert([
      { 
        baslik, 
        fiyat, 
        kategori, 
        sehir,
        ilce, 
        durum,
        resim_url: resimUrl,
        iletisim: '0555-XXX-XX-XX'
      }
    ]);

  if (error) {
    console.error('İlan ekleme hatası:', error);
    return false;
  }

  revalidatePath('/takas');
  return true;
}

// 5. Profil Güncelle (CLOUDINARY FOTOĞRAF DESTEKLİ)
export async function profilGuncelle(formData: FormData) {
  const ad = formData.get('ad') as string;
  const dogum_tarihi = formData.get('dogum_tarihi') as string;
  const cinsiyet = formData.get('cinsiyet') as string;
  const boy = formData.get('boy') as string;
  const kilo = formData.get('kilo') as string;
  
  const resimDosyasi = formData.get('resim') as File;
  let resimUrl = null;

  // Fotoğraf varsa yükle
  if (resimDosyasi && resimDosyasi.size > 0) {
    try {
      const arrayBuffer = await resimDosyasi.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'bebek-profil', // Profil resimleri buraya
            transformation: [
               { width: 400, height: 400, crop: "fill", gravity: "face" }, // Yüzü ortala
               { quality: "auto" },
               { fetch_format: "auto" }
            ] 
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      resimUrl = uploadResult.secure_url;
    } catch (error) {
      console.error("Profil resmi yükleme hatası:", error);
    }
  }

  // Güncelleme objesi
  const guncellenecekVeri: any = { 
    ad, 
    dogum_tarihi, 
    cinsiyet,
    boy: parseFloat(boy),
    kilo: parseFloat(kilo)
  };

  if (resimUrl) {
    guncellenecekVeri.resim_url = resimUrl;
  }

  const { error } = await supabase
    .from('bebekler')
    .update(guncellenecekVeri)
    .eq('id', 1);

  if (error) {
    console.error('Profil güncelleme hatası:', error);
    return false;
  }

  revalidatePath('/profil');
  revalidatePath('/'); // Ana sayfayı da güncelle
  return true;
}