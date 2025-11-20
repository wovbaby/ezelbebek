"use client";

import { useState } from 'react';
import { notKaydet } from '@/app/actions';
import { Save, PenLine } from 'lucide-react';

export default function GunlukNot({ tarih, mevcutNot }: { tarih: string, mevcutNot: string }) {
  const [not, setNot] = useState(mevcutNot || "");
  const [yukleniyor, setYukleniyor] = useState(false);

  const kaydet = async () => {
    setYukleniyor(true);
    await notKaydet(tarih, not);
    setYukleniyor(false);
    alert("Günlük notu kaydedildi!");
  };

  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-yellow-700 mb-2 flex items-center gap-2">
        <PenLine className="w-4 h-4" />
        Günün Notu
      </h3>
      
      <textarea
        className="w-full bg-white border border-yellow-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
        rows={3}
        placeholder="Örn: Bugün doktora gittik, uykusu biraz düzensizdi..."
        value={not}
        onChange={(e) => setNot(e.target.value)}
      />
      
      <button
        onClick={kaydet}
        disabled={yukleniyor}
        className="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {yukleniyor ? 'Kaydediliyor...' : 'Notu Kaydet'}
      </button>
    </div>
  );
}