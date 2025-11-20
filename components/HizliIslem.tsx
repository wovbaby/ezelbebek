"use client";

import { Utensils, Moon, Wind, X, Check } from 'lucide-react';
import { aktiviteEkle } from '@/app/actions';
import { useState } from 'react';

// Seçenek listeleri
const SECENEKLER: Record<string, string[]> = {
  mama: ['Anne Sütü', 'Formül Mama', 'Ek Gıda', 'Su', 'Meyve'],
  bez: ['Sadece Çiş', 'Sadece Kaka', 'Çiş & Kaka', 'İshal', 'Koyu Renk Kaka', 'Bez Sızdırmış'],
  uyku: ['Gece Uykusu', 'Şekerleme', 'Emerek Uyuma', 'Sallayarak Uyuma']
};

export default function HizliIslem() {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [secilenTip, setSecilenTip] = useState<string | null>(null); // Hangi butona basıldı?

  // 1. Ana butona basınca popup aç
  const butonTikla = (tip: string) => {
    setSecilenTip(tip);
  };

  // 2. Detay seçince kaydet
  const detaySecVeKaydet = async (detay: string) => {
    if (!secilenTip) return;
    
    setYukleniyor(true);
    await aktiviteEkle(secilenTip, detay); // Veritabanına gönder
    setYukleniyor(false);
    setSecilenTip(null); // Popup'ı kapat
  };

  return (
    <>
      {/* --- ANA BUTONLAR --- */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
            {yukleniyor ? 'Kaydediliyor...' : 'Hızlı Ekle'}
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
            <ButtonAna icon={Utensils} label="Mama" color="orange" onClick={() => butonTikla('mama')} />
            <ButtonAna icon={Wind} label="Bez" color="blue" onClick={() => butonTikla('bez')} />
            <ButtonAna icon={Moon} label="Uyku" color="indigo" onClick={() => butonTikla('uyku')} />
        </div>
      </div>

      {/* --- POPUP (MODAL) --- */}
      {secilenTip && (
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            
            {/* Başlık ve Kapat */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold capitalize text-gray-800">
                {secilenTip} Detayı
              </h3>
              <button onClick={() => setSecilenTip(null)} className="p-2 bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Seçenekler Listesi */}
            <div className="grid grid-cols-2 gap-3">
              {SECENEKLER[secilenTip].map((detay) => (
                <button
                  key={detay}
                  onClick={() => detaySecVeKaydet(detay)}
                  disabled={yukleniyor}
                  className="p-4 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-left text-sm font-medium text-gray-700 active:scale-95 transition-all"
                >
                  {detay}
                </button>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

// Kod tekrarını önlemek için minik alt bileşen
function ButtonAna({ icon: Icon, label, color, onClick }: any) {
  const colorClasses: any = {
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  };

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </button>
  );
}