'use client'

import { useState } from 'react';
import { Utensils, Moon, Wind, Check, X } from 'lucide-react';
import { aktiviteEkle } from '@/app/actions';

export default function HizliIslem() {
  const [loading, setLoading] = useState(false);
  const [acikIslem, setAcikIslem] = useState<string | null>(null); // 'mama', 'uyku', 'bez'
  const [detay, setDetay] = useState('');

  // Form Gönderme
  const kaydet = async () => {
    if (!acikIslem) return;
    setLoading(true);
    
    // Detay metnini oluştur (Örn: "120cc Mama" veya "Çişli Bez")
    // Eğer kullanıcı detay girmediyse varsayılan bir değer ata
    const islemDetay = detay || (acikIslem === 'mama' ? '120cc' : acikIslem === 'bez' ? 'Çişli' : '1 saat');
    
    await aktiviteEkle(acikIslem, islemDetay);
    
    setLoading(false);
    setAcikIslem(null); // Formu kapat
    setDetay('');
  };

  return (
    <>
      {/* --- 1. SABİT BUTONLAR (STICKY BAR) --- */}
      <div className="grid grid-cols-3 gap-3">
        {/* MAMA BUTONU */}
        <button 
          onClick={() => setAcikIslem('mama')}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-95 shadow-sm border ${acikIslem === 'mama' ? 'bg-orange-500 text-white border-orange-600 ring-2 ring-orange-200' : 'bg-white text-gray-600 border-gray-100'}`}
        >
          <Utensils className="w-6 h-6" />
          <span className="text-xs font-bold">Mama</span>
        </button>

        {/* BEZ BUTONU */}
        <button 
          onClick={() => setAcikIslem('bez')}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-95 shadow-sm border ${acikIslem === 'bez' ? 'bg-blue-500 text-white border-blue-600 ring-2 ring-blue-200' : 'bg-white text-gray-600 border-gray-100'}`}
        >
          <Wind className="w-6 h-6" />
          <span className="text-xs font-bold">Bez</span>
        </button>

        {/* UYKU BUTONU */}
        <button 
          onClick={() => setAcikIslem('uyku')}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-95 shadow-sm border ${acikIslem === 'uyku' ? 'bg-indigo-500 text-white border-indigo-600 ring-2 ring-indigo-200' : 'bg-white text-gray-600 border-gray-100'}`}
        >
          <Moon className="w-6 h-6" />
          <span className="text-xs font-bold">Uyku</span>
        </button>
      </div>

      {/* --- 2. AÇILAN POP-UP FORM (MODAL) --- */}
      {/* DÜZELTME: z-index değerleri 9999'a çekildi. Artık Header'ın üzerinde duracak. */}
      
      {acikIslem && (
        <>
          {/* Arka Plan Karartma (Backdrop) */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
            onClick={() => setAcikIslem(null)}
          />

          {/* Form Kartı (Ekranın Ortasında) */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white p-5 rounded-3xl shadow-2xl z-[9999] animate-in zoom-in-95 duration-200 border border-gray-100">
            
            {/* Başlık ve Kapat Butonu */}
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold flex items-center gap-2 capitalize text-gray-800">
                  {acikIslem === 'mama' && <Utensils className="w-5 h-5 text-orange-500" />}
                  {acikIslem === 'bez' && <Wind className="w-5 h-5 text-blue-500" />}
                  {acikIslem === 'uyku' && <Moon className="w-5 h-5 text-indigo-500" />}
                  {acikIslem} Ekle
               </h3>
               <button 
                 onClick={() => setAcikIslem(null)}
                 className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>

            {/* İçerik Seçenekleri */}
            <div className="space-y-4">
              
              {/* MAMA SEÇENEKLERİ */}
              {acikIslem === 'mama' && (
                <div className="grid grid-cols-3 gap-2">
                  {['90cc', '120cc', '150cc', '180cc', 'Emzirme', 'Ek Gıda'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setDetay(opt)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-colors ${detay === opt ? 'bg-orange-500 text-white border-orange-600' : 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* BEZ SEÇENEKLERİ */}
              {acikIslem === 'bez' && (
                <div className="flex gap-2">
                  {['Çişli', 'Kakalı', 'Dolu'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setDetay(opt)}
                      className={`flex-1 py-3 text-sm font-bold rounded-xl border transition-colors ${detay === opt ? 'bg-blue-500 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* UYKU SEÇENEKLERİ */}
              {acikIslem === 'uyku' && (
                <div className="grid grid-cols-2 gap-2">
                   {['30 dk', '1 saat', '2 saat', 'Gece Uykusu'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setDetay(opt)}
                      className={`py-3 text-xs font-bold rounded-xl border transition-colors ${detay === opt ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Manuel Giriş */}
              <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Veya Not Yaz</label>
                 <input 
                   type="text" 
                   value={detay}
                   onChange={(e) => setDetay(e.target.value)}
                   placeholder={acikIslem === 'mama' ? 'Örn: Çorba yedi...' : 'Not ekle...'}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder:text-gray-400"
                 />
              </div>

              {/* Kaydet Butonu */}
              <button 
                onClick={kaydet}
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2
                  ${acikIslem === 'mama' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 
                    acikIslem === 'bez' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' : 
                    'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200'
                  }`}
              >
                {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                       <Check className="w-5 h-5" /> Kaydet
                    </>
                )}
              </button>
            </div>

          </div>
        </>
      )}
    </>
  );
}