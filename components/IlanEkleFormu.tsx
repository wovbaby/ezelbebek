'use client'

import { useState } from 'react';
import { Upload, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { getCloudinarySignature, ilanEkle } from '@/app/actions';

export default function IlanEkleFormu() {
  const [loading, setLoading] = useState(false);
  const [resimYukleniyor, setResimYukleniyor] = useState(false);
  const [resimUrl, setResimUrl] = useState('');

  // --- RESİM YÜKLEME (DIRECT UPLOAD) ---
  const resimSecildi = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setResimYukleniyor(true);

      // 1. İmza Al
      const { timestamp, signature } = await getCloudinarySignature();
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

      if (!apiKey || !cloudName) {
        alert("API anahtarları eksik!");
        setResimYukleniyor(false);
        return;
      }

      // 2. Cloudinary'ye Gönder
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', 'bebek-pwa-urunler');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.secure_url) {
        setResimUrl(data.secure_url); // URL'i kaydet
      } else {
        throw new Error('Yükleme başarısız');
      }

    } catch (error) {
      console.error(error);
      alert("Resim yüklenirken hata oluştu.");
    } finally {
      setResimYukleniyor(false);
    }
  };

  // --- İLAN KAYDETME ---
  const formuGonder = async (formData: FormData) => {
    setLoading(true);
    // Resim URL'ini form verisine ekle (eğer yüklendiyse)
    if (resimUrl) {
      formData.append('resim_url', resimUrl);
    }
    
    const sonuc = await ilanEkle(formData);
    if (sonuc) {
      // Başarılı (Sayfa yenilenir veya modal kapanır)
      // window.location.reload(); // Gerekirse
      alert("İlan eklendi!");
    } else {
      alert("Bir hata oluştu.");
    }
    setLoading(false);
  };

  return (
    <form action={formuGonder} className="space-y-4">
      
      {/* Resim Alanı */}
      <div className="flex justify-center">
        <label className="w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden">
          {resimUrl ? (
            <img src={resimUrl} alt="İlan Resmi" className="w-full h-full object-cover" />
          ) : (
            <>
              {resimYukleniyor ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Ürün Fotoğrafı Ekle</span>
                </>
              )}
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={resimSecildi} disabled={resimYukleniyor} />
        </label>
      </div>

      <div className="space-y-3">
        <input name="baslik" required placeholder="Ürün Başlığı (Örn: Bebek Arabası)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        
        <div className="flex gap-3">
          <input name="fiyat" required type="number" placeholder="Fiyat (TL)" className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          <select name="durum" className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
            <option value="yeni">Yeni</option>
            <option value="az_kullanilmis">Az Kullanılmış</option>
            <option value="kullanilmis">Kullanılmış</option>
          </select>
        </div>

        <select name="kategori" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
          <option value="giyim">Giyim</option>
          <option value="oyuncak">Oyuncak</option>
          <option value="mobilya">Mobilya</option>
          <option value="arac_gerec">Araç Gereç</option>
          <option value="diger">Diğer</option>
        </select>

        <div className="flex gap-3">
          <input name="sehir" required placeholder="Şehir" className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
          <input name="ilce" required placeholder="İlçe" className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading || resimYukleniyor}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> İlanı Yayınla</>}
      </button>
    </form>
  );
}