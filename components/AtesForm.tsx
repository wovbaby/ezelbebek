"use client";

import { useState } from 'react';
import { atesEkle } from '@/app/actions';
import { Save, Thermometer, Pill } from 'lucide-react';

const OLCUM_YERLERI = ["Koltuk Altı", "Kulak", "Alın", "Popo"];
const ILACLAR = ["İlaçsız", "Calpol", "Dolven", "Fitil", "Antibiyotik"];

export default function AtesForm() {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [derece, setDerece] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setYukleniyor(true);
    
    const formData = new FormData(e.currentTarget);
    await atesEkle(formData);
    
    setYukleniyor(false);
    setDerece(""); // Formu temizle
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-5">
      
      {/* 1. Derece Girişi (Kocaman) */}
      <div className="flex items-center justify-center">
        <div className="relative w-full max-w-[150px]">
            <input 
                type="number" 
                step="0.1" 
                name="derece" 
                placeholder="36.5" 
                required
                value={derece}
                onChange={(e) => setDerece(e.target.value)}
                className="w-full text-center text-4xl font-bold text-gray-800 border-b-2 border-gray-200 focus:border-blue-500 outline-none py-2"
            />
            <span className="absolute right-2 top-4 text-gray-400 font-medium">°C</span>
        </div>
      </div>

      {/* 2. Ölçüm Yeri */}
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Ölçüm Yeri</label>
        <div className="flex flex-wrap gap-2">
            {OLCUM_YERLERI.map((yer) => (
                <label key={yer} className="cursor-pointer">
                    <input type="radio" name="olcum_yeri" value={yer} className="peer sr-only" defaultChecked={yer === "Koltuk Altı"} />
                    <div className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100 peer-checked:bg-blue-100 peer-checked:text-blue-600 peer-checked:border-blue-200 transition-all">
                        {yer}
                    </div>
                </label>
            ))}
        </div>
      </div>

      {/* 3. İlaç Durumu */}
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-1">
            <Pill className="w-3 h-3" /> İlaç Verildi mi?
        </label>
        <div className="flex flex-wrap gap-2">
            {ILACLAR.map((ilac) => (
                <label key={ilac} className="cursor-pointer">
                    <input type="radio" name="ilac" value={ilac} className="peer sr-only" defaultChecked={ilac === "İlaçsız"} />
                    <div className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100 peer-checked:bg-purple-100 peer-checked:text-purple-600 peer-checked:border-purple-200 transition-all">
                        {ilac}
                    </div>
                </label>
            ))}
        </div>
      </div>

      {/* 4. Notlar */}
      <input name="notlar" placeholder="Ek not (Örn: Titreme var...)" className="w-full p-3 bg-gray-50 rounded-xl text-sm border border-gray-100" />

      <button type="submit" disabled={yukleniyor} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2">
        {yukleniyor ? 'Kaydediliyor...' : <> <Save className="w-5 h-5" /> Kaydet </>}
      </button>

    </form>
  );
}