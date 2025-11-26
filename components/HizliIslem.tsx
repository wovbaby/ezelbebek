'use client'

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Utensils, Moon, Wind, Check, X } from 'lucide-react';
import { aktiviteEkle } from '@/app/actions';

export default function HizliIslem() {
  const [loading, setLoading] = useState(false);
  const [acikIslem, setAcikIslem] = useState<string | null>(null);
  const [detay, setDetay] = useState('');
  const [mounted, setMounted] = useState(false);

  // Portal için client-side kontrolü (Sayfa yüklendikten sonra çalışsın)
  useEffect(() => {
    setMounted(true);
  }, []);

  const kaydet = async () => {
    if (!acikIslem) return;
    setLoading(true);
    const islemDetay = detay || (acikIslem === 'mama' ? '120cc' : acikIslem === 'bez' ? 'Çişli' : '1 saat');
    await aktiviteEkle(acikIslem, islemDetay);
    setLoading(false);
    setAcikIslem(null);
    setDetay('');
  };

  // Menü İçeriği (Portal ile taşınacak kısım)
  const modalContent = (
    <>
      {/* Karartma */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] animate-in fade-in duration-300"
        onClick={() => setAcikIslem(null)}
      />

      {/* Bottom Sheet (En Üstte) */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-6 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-[99999] animate-in slide-in-from-bottom duration-300 pb-10 border-t border-gray-100">
        
        {/* Tutamaç */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 opacity-50"></div>

        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-3 capitalize text-gray-800">
              <span className={`p-2.5 rounded-2xl ${acikIslem === 'mama' ? 'bg-orange-100 text-orange-600' : acikIslem === 'bez' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {acikIslem === 'mama' && <Utensils className="w-6 h-6" />}
                {acikIslem === 'bez' && <Wind className="w-6 h-6" />}
                {acikIslem === 'uyku' && <Moon className="w-6 h-6" />}
              </span>
              {acikIslem} Ekle
            </h3>
            <button 
              onClick={() => setAcikIslem(null)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
        </div>

        <div className="space-y-5">
          {/* Seçenekler */}
          {acikIslem === 'mama' && (
            <div className="grid grid-cols-3 gap-3">
              {['90cc', '120cc', '150cc', '180cc', 'Emzirme', 'Ek Gıda'].map((opt) => (
                <button key={opt} onClick={() => setDetay(opt)} className={`py-3 px-2 text-sm font-bold rounded-2xl border transition-all active:scale-95 ${detay === opt ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-200'}`}>{opt}</button>
              ))}
            </div>
          )}

          {acikIslem === 'bez' && (
            <div className="flex gap-3">
              {['Çişli', 'Kakalı', 'Dolu'].map((opt) => (
                <button key={opt} onClick={() => setDetay(opt)} className={`flex-1 py-4 text-base font-bold rounded-2xl border transition-all active:scale-95 ${detay === opt ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>{opt}</button>
              ))}
            </div>
          )}

          {acikIslem === 'uyku' && (
            <div className="grid grid-cols-2 gap-3">
                {['30 dk', '1 saat', '2 saat', 'Gece Uykusu'].map((opt) => (
                <button key={opt} onClick={() => setDetay(opt)} className={`py-4 text-sm font-bold rounded-2xl border transition-all active:scale-95 ${detay === opt ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>{opt}</button>
              ))}
            </div>
          )}

          {/* Manuel Giriş */}
          <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-2 block">Veya Not Yaz</label>
              <input type="text" value={detay} onChange={(e) => setDetay(e.target.value)} placeholder="Not ekle..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-base outline-none focus:ring-2 focus:ring-blue-400 text-gray-800" />
          </div>

          <button onClick={kaydet} disabled={loading} className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 ${acikIslem === 'mama' ? 'bg-orange-500' : acikIslem === 'bez' ? 'bg-blue-500' : 'bg-indigo-500'}`}>
            {loading ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-6 h-6" /> Kaydet</>}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Butonlar (Olduğu yerde kalır) */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setAcikIslem('mama')} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-95 shadow-sm border ${acikIslem === 'mama' ? 'bg-orange-500 text-white border-orange-600 ring-2 ring-orange-200' : 'bg-white text-gray-600 border-gray-100'}`}>
          <Utensils className="w-6 h-6" /><span className="text-xs font-bold">Mama</span>
        </button>
        <button onClick={() => setAcikIslem('bez')} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-95 shadow-sm border ${acikIslem === 'bez' ? 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-200' : 'bg-white text-gray-600 border-gray-100'}`}>
          <Wind className="w-6 h-6" /><span className="text-xs font-bold">Bez</span>
        </button>
        <button onClick={() => setAcikIslem('uyku')} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-95 shadow-sm border ${acikIslem === 'uyku' ? 'bg-indigo-500 text-white border-indigo-600 ring-2 ring-indigo-200' : 'bg-white text-gray-600 border-gray-100'}`}>
          <Moon className="w-6 h-6" /><span className="text-xs font-bold">Uyku</span>
        </button>
      </div>

      {/* Menü (DOM'un en dışına ışınlanır) */}
      {mounted && acikIslem && createPortal(modalContent, document.body)}
    </>
  );
}