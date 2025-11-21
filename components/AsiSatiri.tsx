"use client";

import { useState } from 'react';
import { asiIsaretle } from '@/app/actions';
import { Check, Circle, Syringe } from 'lucide-react';

export default function AsiSatiri({ asi, yapildiMi }: { asi: any, yapildiMi: boolean }) {
  const [durum, setDurum] = useState(yapildiMi);
  const [yukleniyor, setYukleniyor] = useState(false);

  const toggleAsi = async () => {
    const yeniDurum = !durum;
    setDurum(yeniDurum); // Optiimistik güncelleme (Hemen değişsin)
    setYukleniyor(true);
    
    await asiIsaretle(asi.id, yeniDurum);
    
    setYukleniyor(false);
  };

  return (
    <div 
      onClick={toggleAsi}
      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all select-none
        ${durum 
          ? 'bg-green-50 border-green-200 shadow-sm' 
          : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50'
        }`}
    >
      {/* İkon Kutusu */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors
        ${durum ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
        {durum ? <Check className="w-5 h-5" /> : <Syringe className="w-5 h-5" />}
      </div>

      {/* Yazılar */}
      <div className="flex-1">
        <h4 className={`text-sm font-bold ${durum ? 'text-green-800 line-through opacity-70' : 'text-gray-800'}`}>
            {asi.ad}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">{asi.aciklama}</p>
      </div>

      {/* Checkbox Görünümü */}
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
        ${durum ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
        {durum && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
  );
}