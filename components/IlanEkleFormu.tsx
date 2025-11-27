'use client'

import { useState } from 'react';
import { Upload, Check, Loader2, Image as ImageIcon, MapPin, ChevronDown } from 'lucide-react';
import { getCloudinarySignature, ilanEkle } from '@/app/actions';

// Örnek İl Listesi (Tamamını JSON dosyasından da çekebilirsin ama pratik olsun diye buraya koydum)
const ILLER_VE_ILCELER: Record<string, string[]> = {
  "İstanbul": ["Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"],
  "Ankara": ["Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana", "Kalecik", "Kahramankazan", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan", "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"],
  "İzmir": ["Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova", "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe", "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz", "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar", "Selçuk", "Tire", "Torbalı", "Urla"],
  "Adana": ["Seyhan", "Çukurova", "Yüreğir", "Sarıçam", "Ceyhan", "Kozan", "İmamoğlu", "Karataş", "Karaisalı", "Pozantı", "Yumurtalık", "Tufanbeyli", "Feke", "Saimbeyli", "Aladağ"],
  "Antalya": ["Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"],
  "Bursa": ["Osmangazi", "Yıldırım", "Nilüfer", "İnegöl", "Gemlik", "Mustafakemalpaşa", "Karacabey", "Orhangazi", "Kestel", "Gürsu", "Mudanya", "Yenişehir", "İznik", "Orhaneli", "Keles", "Büyükorhan", "Harmancık"],
  // ... Diğer iller eklenebilir
  "Diğer": []
};

export default function IlanEkleFormu() {
  const [loading, setLoading] = useState(false);
  const [resimYukleniyor, setResimYukleniyor] = useState(false);
  const [resimUrl, setResimUrl] = useState('');
  const [secilenIl, setSecilenIl] = useState('');
  const [secilenIlce, setSecilenIlce] = useState('');

  // --- RESİM YÜKLEME (DIRECT UPLOAD) ---
  const resimSecildi = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setResimYukleniyor(true);

      // 1. İmza Al (Sunucudan)
      const { timestamp, signature } = await getCloudinarySignature();
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

      if (!apiKey || !cloudName) {
        alert("Sistem Hatası: API anahtarları eksik.");
        setResimYukleniyor(false);
        return;
      }

      // 2. Cloudinary'ye Gönder (Vercel'i atlayarak)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', 'bebek-pwa-urunler'); // Market klasörü

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Yükleme başarısız');

      const data = await response.json();
      setResimUrl(data.secure_url); // Resmin linkini kaydet

    } catch (error: any) {
      console.error(error);
      alert("Resim yükleme hatası: " + error.message);
    } finally {
      setResimYukleniyor(false);
    }
  };

  // --- İLAN KAYDETME ---
  const formuGonder = async (formData: FormData) => {
    setLoading(true);
    
    // Eğer resim yüklendiyse, linki forma ekle
    if (resimUrl) {
      formData.append('resim_url', resimUrl);
    }

    // İl ve İlçe dropdown'dan gelen veriyi ekle
    if(secilenIl) formData.set('sehir', secilenIl);
    if(secilenIlce) formData.set('ilce', secilenIlce);

    const sonuc = await ilanEkle(formData);
    
    if (sonuc?.success) {
      alert("İlan başarıyla yayınlandı! 🎉");
      window.location.href = '/takas'; // Sayfayı yenile
    } else {
      alert(`Hata: ${sonuc?.error || "Bilinmeyen bir hata oluştu."}`);
    }
    setLoading(false);
  };

  return (
    <form action={formuGonder} className="space-y-4">
      
      {/* Resim Alanı */}
      <div className="flex justify-center">
        <label className={`w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${resimUrl ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}>
          {resimUrl ? (
            <img src={resimUrl} alt="İlan Resmi" className="w-full h-full object-cover" />
          ) : (
            <>
              {resimYukleniyor ? (
                <div className="flex flex-col items-center text-blue-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-xs font-medium">Yükleniyor...</span>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Fotoğraf Yükle</span>
                </>
              )}
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={resimSecildi} disabled={resimYukleniyor} />
        </label>
      </div>

      <div className="space-y-3">
        <input name="baslik" required placeholder="Ürün Başlığı (Örn: Bebek Arabası)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
        
        <div className="flex gap-3">
          <div className="flex-1 relative">
             <input name="fiyat" required type="number" placeholder="Fiyat" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
             <span className="absolute right-3 top-3 text-gray-400 text-sm">₺</span>
          </div>
          <select name="durum" className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-600 appearance-none">
            <option value="yeni">Yeni</option>
            <option value="az_kullanilmis">Az Kullanılmış</option>
            <option value="kullanilmis">Kullanılmış</option>
          </select>
        </div>

        <select name="kategori" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-600 appearance-none">
          <option value="giyim">Giyim</option>
          <option value="oyuncak">Oyuncak</option>
          <option value="mobilya">Mobilya</option>
          <option value="arac_gerec">Araç Gereç</option>
          <option value="diger">Diğer</option>
        </select>

        {/* İl ve İlçe Seçimi */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
             <select 
               name="sehir" 
               required 
               className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-600 appearance-none"
               onChange={(e) => {
                 setSecilenIl(e.target.value);
                 setSecilenIlce(''); 
               }}
               value={secilenIl}
             >
               <option value="">İl Seçiniz</option>
               {Object.keys(ILLER_VE_ILCELER).sort().map(il => (
                 <option key={il} value={il}>{il}</option>
               ))}
             </select>
             <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          <div className="flex-1 relative">
             {secilenIl && ILLER_VE_ILCELER[secilenIl] ? (
               <div className="relative">
                 <select 
                   name="ilce" 
                   required 
                   className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-600 appearance-none"
                   onChange={(e) => setSecilenIlce(e.target.value)}
                   value={secilenIlce}
                 >
                   <option value="">İlçe Seç</option>
                   {ILLER_VE_ILCELER[secilenIl].sort().map(ilce => (
                     <option key={ilce} value={ilce}>{ilce}</option>
                   ))}
                 </select>
                 <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
               </div>
             ) : (
               <input 
                  name="ilce" 
                  required 
                  placeholder="İlçe" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" 
                  disabled={!secilenIl}
               />
             )}
          </div>
        </div>

        <input name="iletisim" placeholder="İletişim (Tel/Email)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
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