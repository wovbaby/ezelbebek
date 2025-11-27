'use client'

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, User, Baby } from 'lucide-react';
import { bebekSec } from '@/app/actions';
import Link from 'next/link';

export default function BebekSecici({ bebekler, seciliId }: { bebekler: any[], seciliId: number }) {
  const [acik, setAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const seciliBebek = bebekler?.find(b => b.id === seciliId);

  // Menü dışına tıklayınca kapatma kontrolü
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAcik(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const degistir = async (id: number) => {
    if (id === seciliId) {
      setAcik(false);
      return;
    }
    setYukleniyor(true);
    await bebekSec(id);
    // Sayfa yenilemesi action içinde revalidatePath ile yapılıyor
    setYukleniyor(false);
    setAcik(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Tetikleyici Buton */}
      <button 
        onClick={() => setAcik(!acik)} 
        className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 pr-4 rounded-full transition-all border border-white/10"
      >
        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center overflow-hidden border-2 border-white/50 shadow-sm">
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
          <p className="text-sm font-bold text-white leading-none flex items-center gap-1">
            {seciliBebek?.ad || "Bebek Seç"} <ChevronDown className={`w-3 h-3 transition-transform ${acik ? 'rotate-180' : ''}`} />
          </p>
        </div>
      </button>

      {/* Açılır Menü */}
      {acik && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden z-50 origin-top-left animate-in fade-in zoom-in-95 duration-200">
          
          {/* --- Kaydırılabilir Alan (Bebek Listesi) --- */}
          {/* max-h-[240px] sayesinde 4-5 bebekten sonra scroll çıkar */}
          <div className="max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            <div className="p-2 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase">Bebeklerim</p>
              
              {bebekler?.map((b) => (
                <button
                  key={b.id}
                  onClick={() => degistir(b.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left ${b.id === seciliId ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    {b.resim_url ? (
                      <img src={b.resim_url} alt={b.ad} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">👶</span>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${b.id === seciliId ? 'text-blue-600' : 'text-gray-700'}`}>
                    {b.ad}
                  </span>
                  {b.id === seciliId && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />}
                </button>
              ))}

              {/* Listede Bebek Yoksa */}
              {(!bebekler || bebekler.length === 0) && (
                 <p className="text-xs text-gray-400 px-3 py-2">Kayıtlı bebek yok.</p>
              )}
              
              {/* Yeni Bebek Ekle (Listenin En Sonunda) */}
              <Link 
                href="/profil/ekle" 
                onClick={() => setAcik(false)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 text-blue-600 transition-colors"
              >
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Yeni Bebek Ekle</span>
              </Link>
            </div>
          </div>

          {/* --- Sabit Alt Alan (Anne Profili) --- */}
          {/* Burası scroll'dan etkilenmez, hep en altta görünür */}
          <div className="border-t border-gray-100 bg-gray-50/80 p-2 backdrop-blur-sm">
             <Link 
                href="/anne" 
                onClick={() => setAcik(false)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-pink-100 group"
              >
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center border border-pink-200 group-hover:scale-110 transition-transform">
                    <User className="w-4 h-4 text-pink-500" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-700 block group-hover:text-pink-600">Anne Profili</span>
                    <span className="text-[10px] text-gray-400 block">Kendinle ilgilen</span>
                  </div>
              </Link>
          </div>

        </div>
      )}
    </div>
  );
}