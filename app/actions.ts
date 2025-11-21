'use server'

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from 'cloudinary'; 
import { cookies } from 'next/headers'; // Çoklu çocuk için gerekli

// Cloudinary Ayarlarını Yapılandır
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// --- YARDIMCI: SEÇİLİ BEBEK ID'SİNİ BUL ---
// Cookie'den hangi bebeğin seçili olduğunu okur
async function getSeciliBebekId() {
  const cookieStore = await cookies();
  const seciliId = cookieStore.get('secili_bebek')?.value;
  
  // Eğer cookie yoksa varsayılan olarak 1. bebeği (veya veritabanındaki ilkini) döndürürüz
  // Şimdilik basit tutmak için 1 dönüyoruz, gerçekte auth user'ın ilk bebeği olmalı
  return seciliId ? parseInt(seciliId) : 1; 
}

// --- YENİ: BEBEK DEĞİŞTİRME ---
// Kullanıcı menüden bebek seçince bu çalışır
export async function bebekSec(bebekId: number) {
  const cookieStore = await cookies();
  cookieStore.set('secili_bebek', bebekId.toString());
  revalidatePath('/'); // Tüm siteyi yenile ki veriler değişsin
}

// 1. Aktivite (Hızlı İşlem) Ekleme - DİNAMİK
export async function aktiviteEkle(tip: string, detay: string) {
  const bebekId = await getSeciliBebekId(); // Seçili bebeği al

  const { error } = await supabase
    .from('aktiviteler')
    .insert([
      { 
        bebek_id: bebekId, // Dinamik ID
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

// 2. Günlük Not Ekleme / Güncelleme - DİNAMİK
export async function notKaydet(tarih: string, icerik: string) {
  const bebekId = await getSeciliBebekId(); // Seçili bebeği al

  const { error } = await supabase
    .from('gunluk_notlar')
    .upsert(
      { 
        bebek_id: bebekId, 
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

// 3. Forum Konusu Ekle (Herkese Açık)
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

// 4. Takas İlanı Ekle (Herkese Açık)
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
        baslik, fiyat, kategori, sehir, ilce, durum,
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

// 5. Profil Güncelle (DİNAMİK - SEÇİLİ BEBEĞİ GÜNCELLER)
export async function profilGuncelle(formData: FormData) {
  const bebekId = await getSeciliBebekId(); // Hangi bebeği düzenliyoruz?

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
          {
            folder: 'bebek-profil',
            transformation: [
               { width: 400, height: 400, crop: "fill", gravity: "face" },
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

  const guncellenecekVeri: any = { 
    ad, dogum_tarihi, cinsiyet,
    boy: parseFloat(boy), kilo: parseFloat(kilo)
  };

  if (resimUrl) {
    guncellenecekVeri.resim_url = resimUrl;
  }

  const { error } = await supabase
    .from('bebekler')
    .update(guncellenecekVeri)
    .eq('id', bebekId); // ARTIK SABİT DEĞİL, DİNAMİK

  if (error) {
    console.error('Profil güncelleme hatası:', error);
    return false;
  }

  revalidatePath('/profil');
  revalidatePath('/'); 
  return true;
}

// 6. YENİ BEBEK EKLEME (YENİ FONKSİYON)
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
          {
            folder: 'bebek-profil',
            transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }] 
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      resimUrl = uploadResult.secure_url;
    } catch (error) {
      console.error("Yeni bebek resim hatası:", error);
    }
  }

  const { error } = await supabase
    .from('bebekler')
    .insert([{ 
      ad, 
      dogum_tarihi, 
      cinsiyet,
      boy: parseFloat(boy) || 0,
      kilo: parseFloat(kilo) || 0,
      resim_url: resimUrl,
      // parent_id: '...' // İleride Auth gelince eklenecek
    }]);

  if (error) {
    console.error('Bebek ekleme hatası:', error);
    return false;
  }

  revalidatePath('/profil');
  return true;
}
// 7. Aşı İşaretleme / Kaldırma
export async function asiIsaretle(asiId: number, yapildi: boolean) {
  const bebekId = await getSeciliBebekId(); // Hangi bebek seçiliyse ona işlem yap

  if (yapildi) {
    // Yapıldıysa ekle
    const { error } = await supabase
      .from('asi_durumu')
      .insert([
        { 
          bebek_id: bebekId, 
          asi_id: asiId, 
          yapildi_mi: true, 
          yapilma_tarihi: new Date().toISOString() // Şu anki tarih
        }
      ]);
    if (error) console.error('Aşı ekleme hatası:', error);
  } else {
    // İşaret kaldırıldıysa sil
    const { error } = await supabase
      .from('asi_durumu')
      .delete()
      .match({ bebek_id: bebekId, asi_id: asiId });
    if (error) console.error('Aşı silme hatası:', error);
  }

  revalidatePath('/asi-takvimi'); // Sayfayı yenile
  return true;
}