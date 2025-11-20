"use client";

import { useState } from 'react';
import { profilGuncelle } from '@/app/actions';
import { Save, Edit2, Ruler, Weight, Calendar, Baby, Camera } from 'lucide-react';

export default function ProfilForm({ bebek }: { bebek: any }) {
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  
  // Resim Önizleme
  const [onizleme, setOnizleme] = useState<string | null>(bebek.resim_url);

  const yasHesapla = (tarih: string) => {
    const dogum = new Date(tarih);
    const bugun = new Date();
    let ay = (bugun.getFullYear() - dogum.getFullYear()) * 12;
    ay -= dogum.getMonth();
    ay += bugun.getMonth();
    const gunFarki = Math.floor((bugun.getTime() - dogum.getTime()) / (1000 * 3600 * 24));
    return `${ay} Aylık (${gunFarki} Gün)`;
  };

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
    await profilGuncelle(formData);
    setYukleniyor(false);
    setDuzenlemeModu(false);
  };

  // --- DÜZENLEME MODU ---
  if (duzenlemeModu) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
        
        {/* FOTOĞRAF DEĞİŞTİRME ALANI */}
        <div className="flex justify-center mb-4">
            <label className="relative cursor-pointer group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-100 shadow-inner">
                    {onizleme ? (
                        <img src={onizleme} alt="Bebek" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                            <Baby className="w-12 h-12 text-blue-300" />
                        </div>
                    )}
                </div>
                {/* Kamera İkonu Overlay */}
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                </div>
                <input type="file" name="resim" accept="image/*" className="hidden" onChange={resimSecildi} />
            </label>
        </div>

        {/* Form Alanları */}
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bebek İsmi</label>
            <input name="ad" defaultValue={bebek.ad} className="w-full p-3 bg-gray-50 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Doğum Tarihi</label>
                <input type="date" name="dogum_tarihi" defaultValue={bebek.dogum_tarihi} className="w-full p-3 bg-gray-50 rounded-xl border border-blue-200" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cinsiyet</label>
                <select name="cinsiyet" defaultValue={bebek.cinsiyet} className="w-full p-3 bg-gray-50 rounded-xl border border-blue-200">
                    <option>Erkek</option>
                    <option>Kız</option>
                </select>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Boy (cm)</label>
                <input type="number" step="0.1" name="boy" defaultValue={bebek.boy} className="w-full p-3 bg-gray-50 rounded-xl border border-blue-200" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kilo (kg)</label>
                <input type="number" step="0.1" name="kilo" defaultValue={bebek.kilo} className="w-full p-3 bg-gray-50 rounded-xl border border-blue-200" />
            </div>
        </div>

        <div className="flex gap-2">
            <button type="button" onClick={() => setDuzenlemeModu(false)} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold text-gray-600">İptal</button>
            <button type="submit" disabled={yukleniyor} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Kaydet
            </button>
        </div>
      </form>
    );
  }

  // --- GÖRÜNTÜLEME MODU ---
  return (
    <div className="relative">
      <button onClick={() => setDuzenlemeModu(true)} className="absolute top-0 right-0 p-2 bg-gray-100 rounded-full hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors z-10">
        <Edit2 className="w-4 h-4" />
      </button>

      <div className="text-center mb-6">
        {/* Profil Resmi */}
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-3 bg-blue-50 flex items-center justify-center">
            {bebek.resim_url ? (
                <img src={bebek.resim_url} alt={bebek.ad} className="w-full h-full object-cover" />
            ) : (
                <Baby className="w-12 h-12 text-blue-300" />
            )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800">{bebek.ad}</h2>
        <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mt-1">
            {yasHesapla(bebek.dogum_tarihi)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
            <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400 uppercase font-bold">Doğum</p>
            <p className="font-bold text-gray-700 text-sm">{new Date(bebek.dogum_tarihi).toLocaleDateString('tr-TR')}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
            <Ruler className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400 uppercase font-bold">Boy</p>
            <p className="font-bold text-gray-700 text-sm">{bebek.boy} cm</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
            <Weight className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400 uppercase font-bold">Kilo</p>
            <p className="font-bold text-gray-700 text-sm">{bebek.kilo} kg</p>
        </div>
      </div>
    </div>
  );
}