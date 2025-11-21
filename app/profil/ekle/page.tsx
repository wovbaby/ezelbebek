"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { yeniBebekEkle } from '@/app/actions';
import { ArrowLeft, Baby, Check, Camera } from 'lucide-react';
import Link from 'next/link';

export default function BebekEklePage() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  
  // Resim Önizleme
  const [onizleme, setOnizleme] = useState<string | null>(null);

  // Resim seçilince önizlemeyi göster
  const resimSecildi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0];
    if (dosya) {
      const url = URL.createObjectURL(dosya);
      setOnizleme(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setYukleniyor(true);
    const formData = new FormData(e.currentTarget);
    
    // Server Action'ı çağır
    const basarili = await yeniBebekEkle(formData);

    if (basarili) {
        router.push('/profil'); // Başarılıysa profil sayfasına dön
    } else {
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        setYukleniyor(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      
      {/* HEADER */}
      <header className="p-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white z-10">
        <Link href="/profil" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-bold text-gray-800 text-lg">Yeni Bebek Ekle</h1>
      </header>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* FOTOĞRAF SEÇİMİ */}
            <div className="flex flex-col items-center justify-center mb-4">
                <label className="relative cursor-pointer group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-inner bg-blue-50 flex items-center justify-center">
                        {onizleme ? (
                            <img src={onizleme} alt="Önizleme" className="w-full h-full object-cover" />
                        ) : (
                            <Baby className="w-16 h-16 text-blue-300" />
                        )}
                    </div>
                    
                    {/* Kamera İkonu Overlay */}
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Gizli Input */}
                    <input type="file" name="resim" accept="image/*" className="hidden" onChange={resimSecildi} />
                </label>
                <p className="text-xs text-gray-400 mt-2 font-medium">Fotoğraf eklemek için dokun</p>
            </div>

            {/* İSİM ALANI */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Bebek İsmi</label>
                <input 
                    name="ad" 
                    required 
                    placeholder="Örn: Masal" 
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
            </div>

            {/* DOĞUM VE CİNSİYET */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Doğum Tarihi</label>
                    <input 
                        type="date" 
                        name="dogum_tarihi" 
                        required 
                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cinsiyet</label>
                    <select name="cinsiyet" className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        <option>Erkek</option>
                        <option>Kız</option>
                    </select>
                </div>
            </div>

            {/* BOY VE KİLO */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Boy (cm)</label>
                    <input 
                        type="number" 
                        step="0.1" 
                        name="boy" 
                        placeholder="50" 
                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Kilo (kg)</label>
                    <input 
                        type="number" 
                        step="0.1" 
                        name="kilo" 
                        placeholder="3.5" 
                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    />
                </div>
            </div>

            {/* KAYDET BUTONU */}
            <button 
                type="submit" 
                disabled={yukleniyor} 
                className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {yukleniyor ? 'Kaydediliyor...' : (
                    <> 
                        <Check className="w-6 h-6" /> 
                        Bebeği Kaydet 
                    </>
                )}
            </button>

        </form>
      </div>
    </main>
  );
}