'use client'

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus, User, Baby } from 'lucide-react';
import { bebekSec } from '@/app/actions';
import Link from 'next/link';

export default function BebekSecici({ bebekler, seciliId }: { bebekler: any[], seciliId: number }) {
  const [acik, setAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [konum, setKonum] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const seciliBebek = bebekler?.find(b => b.id === seciliId);

  // Portal için client kontrolü
  useEffect(() => {
    setMounted(true);
  }, []);

  // Menü açılırken konumunu hesapla
  const menuyuAc = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setKonum({
        top: rect.bottom + 8 + window.scrollY, // Butonun hemen altı
        left: rect.left + window.scrollX // Butonla aynı hiza
      });
    }
    setAcik(!acik);
  };

  const degistir = async (id: number) => {
    if (id === seciliId) {
      setAcik(false);
      return;
    }
    setYukleniyor(true);
    await bebekSec(id);
    setYukleniyor(false);
    setAcik(false);
  };

  // --- PORTAL İÇERİĞİ (Sayfanın en dışına render edilir) ---
  const dropdownMenu = (
    <>
      {/* Şeffaf Arka Plan (Tıklayınca kapatmak için) */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={() => setAcik(false)} 
      />

      {/* Menü Kutusu */}
      <div 
        className="absolute w-64 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-200"
        style={{ top: konum.top, left: konum.left }}
      >
          {/* Kaydırılabilir Bebek Listesi */}
          <div className="max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            <div className="p-2 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase">Bebeklerim</p>
              
              {bebekler?.map((b) => (
                <button
                  key={b.id}
                  onClick={() => degistir(b.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left ${b.id === seciliId ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                    {b.resim_url ? (
                      <img src={b.resim_url} alt={b.ad} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">👶</span>
                    )}
                  </div>
                  <span className={`text-sm font-bold truncate ${b.id === seciliId ? 'text-blue-600' : 'text-gray-700'}`}>
                    {b.ad}
                  </span>
                  {b.id === seciliId && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                </button>
              ))}

              {(!bebekler || bebekler.length === 0) && (
                 <p className="text-xs text-gray-400 px-3 py-2">Kayıtlı bebek yok.</p>
              )}
              
              <Link 
                href="/profil/ekle" 
                onClick={() => setAcik(false)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 text-blue-600 transition-colors"
              >
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Yeni Bebek Ekle</span>
              </Link>
            </div>
          </div>

          {/* Sabit Alt Alan (Anne Profili) */}
          <div className="border-t border-gray-100 bg-gray-50 p-2">
             <Link 
                href="/anne" 
                onClick={() => setAcik(false)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-pink-100 group"
              >
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center border border-pink-200 group-hover:scale-110 transition-transform shrink-0">
                    <User className="w-4 h-4 text-pink-500" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-700 block group-hover:text-pink-600">Anne Profili</span>
                    <span className="text-[10px] text-gray-400 block">Kendinle ilgilen</span>
                  </div>
              </Link>
          </div>
      </div>
    </>
  );

  return (
    <>
      {/* Tetikleyici Buton */}
      <button 
        ref={buttonRef}
        onClick={menuyuAc} 
        className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 pr-4 rounded-full transition-all border border-white/10"
      >
        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center overflow-hidden border-2 border-white/50 shadow-sm shrink-0">
           {yukleniyor ? (
             <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
           ) : seciliBebek?.resim_url ? (
             <img src={seciliBebek.resim_url} alt={seciliBebek.ad} className="w-full h-full object-cover" />
           ) : (
             <Baby className="w-6 h-6 text-blue-400" />
           )}
        </div>
        
        <div className="text-left">
          <p className="text-[10px] text-blue-100 font-medium uppercase tracking-wider leading-none mb-0.5">Seçili Bebek</p>
          <p className="text-sm font-bold text-white leading-none flex items-center gap-1 truncate max-w-[100px]">
            {seciliBebek?.ad || "Bebek Seç"} <ChevronDown className={`w-3 h-3 transition-transform ${acik ? 'rotate-180' : ''}`} />
          </p>
        </div>
      </button>

      {/* Menüyü Body'ye Işınla (Portal) */}
      {mounted && acik && createPortal(dropdownMenu, document.body)}
    </>
  );
}