"use client";

import { useState } from 'react';
import { bebekSec } from '@/app/actions';
import { ChevronDown, Check, Plus, Heart } from 'lucide-react'; // Heart ikonunu ekledik
import Link from 'next/link';

export default function BebekSecici({ bebekler, seciliId }: { bebekler: any[], seciliId: number }) {
  const [acik, setAcik] = useState(false);
  
  // Eğer bebek listesi boşsa veya hata varsa güvenli bir varsayılan oluştur
  const seciliBebek = bebekler.find(b => b.id === seciliId) || bebekler[0] || { ad: "Bebek" };

  const degistir = async (id: number) => {
    await bebekSec(id); // Cookie'yi güncelle
    setAcik(false);
    // Sayfa server action ile yenilenecek
  };

  return (
    <div className="relative z-50">
      {/* Seçili Olan (Buton) */}
      <button 
        onClick={() => setAcik(!acik)} 
        className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 text-white font-bold text-sm shadow-sm active:scale-95 transition-transform"
      >
        {seciliBebek.ad}
        <ChevronDown className={`w-4 h-4 transition-transform ${acik ? 'rotate-180' : ''}`} />
      </button>

      {/* Açılır Menü */}
      {acik && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
          
          {/* Bebek Listesi */}
          {bebekler.map((b) => (
            <button
              key={b.id}
              onClick={() => degistir(b.id)}
              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 flex items-center justify-between border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-2">
                {/* Resim varsa göster, yoksa placeholder */}
                <img 
                  src={b.resim_url || "https://via.placeholder.com/40"} 
                  className="w-6 h-6 rounded-full object-cover border border-gray-200" 
                  alt={b.ad}
                />
                {b.ad}
              </div>
              {b.id === seciliId && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
          
          {/* Yeni Bebek Ekle Linki */}
          <Link 
            href="/profil/ekle" 
            className="w-full text-left px-4 py-3 text-xs font-bold text-blue-600 bg-gray-50 hover:bg-gray-100 flex items-center gap-2 border-t border-gray-100"
          >
            <Plus className="w-4 h-4" />
            Yeni Bebek Ekle
          </Link>

          {/* YENİ: Anne Profili Linki (Pembe) */}
          <Link 
            href="/anne" 
            className="w-full text-left px-4 py-3 text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 flex items-center gap-2 border-t border-pink-100"
          >
            <Heart className="w-4 h-4" />
            Anne Profili
          </Link>

        </div>
      )}
    </div>
  );
}