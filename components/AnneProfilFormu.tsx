'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { anneGuncelle } from '@/app/actions'; // Action'ın burada olduğundan emin ol
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner'; // Eğer toast kullanıyorsan, yoksa alert kullanabilirsin

export default function AnneProfilFormu({ anne }: { anne: any }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [secilenResim, setSecilenResim] = useState<File | null>(null);
  const [onizleme, setOnizleme] = useState(anne?.resim_url || null);

  const handleResimSecimi = async (event: any) => {
    const imageFile = event.target.files[0];
    if (!imageFile) return;

    // Hemen önizlemeyi göster (Kullanıcı beklemesin)
    setOnizleme(URL.createObjectURL(imageFile));

    const options = {
      maxSizeMB: 0.5, // Hedef: 0.5 MB
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: "image/jpeg"
    };

    try {
      // Resmi tarayıcıda sıkıştırıyoruz
      const compressedFile = await imageCompression(imageFile, options);
      setSecilenResim(compressedFile); // Sıkışmış dosyayı state'e at
      console.log(`Resim sıkıştırıldı: ${(compressedFile.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.log('Sıkıştırma hatası:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setYukleniyor(true);

    const formData = new FormData(event.currentTarget);

    // Eğer yeni bir resim seçildiyse ve sıkıştırıldıysa, formdaki orijinal dosya yerine bunu koy
    if (secilenResim) {
      formData.set('resim', secilenResim, 'profil.jpg');
    }

    try {
      await anneGuncelle(formData);
      // Başarılı olursa sayfayı yenilemek iyi olabilir veya toast mesajı
      // window.location.reload(); // İstersen açabilirsin
    } catch (error) {
      console.error(error);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Profil Resmi Gösterimi */}
      <div className="flex flex-col items-center justify-center bg-pink-50 w-24 h-24 rounded-full border-4 border-pink-200 shrink-0 overflow-hidden relative group">
        {onizleme ? (
          <img src={onizleme} alt="Profil" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">👩</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[9px] text-gray-400 uppercase font-bold block mb-1">İsim</label>
            <input 
              type="text" 
              name="ad" 
              defaultValue={anne?.ad || 'Anne'} 
              className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs" 
              placeholder="İsminiz" 
            />
          </div>
          <div>
            <label className="text-[9px] text-gray-400 uppercase font-bold block mb-1 text-center">Foto</label>
            <label className={`w-[34px] h-[34px] flex items-center justify-center bg-pink-100 text-pink-500 rounded-lg cursor-pointer hover:bg-pink-200 transition-colors ${yukleniyor ? 'opacity-50 cursor-wait' : ''}`}>
              <Camera className="w-4 h-4" />
              <input 
                type="file" 
                name="resim_input_dummy" // İsmi değiştirdik ki otomatik gitmesin
                accept="image/*" 
                className="hidden" 
                onChange={handleResimSecimi}
                disabled={yukleniyor}
              />
            </label>
          </div>
        </div>

        <div>
          <label className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Son Adet Tarihi</label>
          <input 
            type="date" 
            name="son_adet_tarihi" 
            defaultValue={anne?.son_adet_tarihi} 
            className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-pink-400 outline-none" 
          />
        </div>
        
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Döngü (Gün)</label>
            <input 
              type="number" 
              name="dongu_suresi" 
              defaultValue={anne?.dongu_suresi || 28} 
              className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-center" 
            />
          </div>
          <button 
            type="submit" 
            disabled={yukleniyor}
            className="h-[34px] px-4 bg-pink-500 text-white text-xs rounded-lg font-bold shadow-md active:scale-95 transition-transform disabled:bg-gray-400"
          >
            {yukleniyor ? '...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}