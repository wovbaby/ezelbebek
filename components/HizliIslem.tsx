"use client";

import { Utensils, Moon, Wind, X, Check } from 'lucide-react';
import { aktiviteEkle } from '@/app/actions';
import { useState } from 'react';

// ... (SECENEKLER listesi aynı kalsın) ...
const SECENEKLER: Record<string, string[]> = {
  mama: ['Anne Sütü', 'Formül Mama', 'Ek Gıda', 'Su', 'Meyve'],
  bez: ['Sadece Çiş', 'Sadece Kaka', 'Çiş & Kaka', 'İshal', 'Koyu Renk Kaka', 'Bez Sızdırmış'],
  uyku: ['Gece Uykusu', 'Şekerleme', 'Emerek Uyuma', 'Sallayarak Uyuma']
};

export default function HizliIslem() {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [secilenTip, setSecilenTip] = useState<string | null>(null);

  const butonTikla = (tip: string) => { setSecilenTip(tip); };

  const detaySecVeKaydet = async (detay: string) => {
    if (!secilenTip) return;
    setYukleniyor(true);
    await aktiviteEkle(secilenTip, detay);
    setYukleniyor(false);
    setSecilenTip(null);
  };

  return (
    <>
      {/* --- ANA BUTONLAR (KÜÇÜLTÜLDÜ) --- */}
      <div className="bg-white rounded-2xl shadow-sm p-3 mb-4 border border-gray-100">
        <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-3 ml-1">
            {yukleniyor ? 'Kaydediliyor...' : 'Hızlı Ekle'}
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
            <ButtonAna icon={Utensils} label="Mama" color="orange" onClick={() => butonTikla('mama')} />
            <ButtonAna icon={Wind} label="Bez" color="blue" onClick={() => butonTikla('bez')} />
            <ButtonAna icon={Moon} label="Uyku" color="indigo" onClick={() => butonTikla('uyku')} />
        </div>
      </div>

      {/* ... Popup kısmı aynı kalsın ... */}
      {secilenTip && (
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold capitalize text-gray-800">{secilenTip} Detayı</h3>
              <button onClick={() => setSecilenTip(null)} className="p-1.5 bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SECENEKLER[secilenTip].map((detay) => (
                <button key={detay} onClick={() => detaySecVeKaydet(detay)} disabled={yukleniyor} className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 text-left text-xs font-bold text-gray-700 active:scale-95 transition-all">
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

function ButtonAna({ icon: Icon, label, color, onClick }: any) {
  const colorClasses: any = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group active:scale-90 transition-transform">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-bold text-gray-500">{label}</span>
    </button>
  );
}

//