"use client";

import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

export default function SesOynatici({ veri, tip = 'kutu' }: { veri: any, tip?: 'kutu' | 'liste' | 'kart' }) {
  const [caliyor, setCaliyor] = useState(false);
  const sesRef = useRef<HTMLAudioElement>(null);

  const oynatDurdur = () => {
    if (caliyor) {
      sesRef.current?.pause();
    } else {
      // Diğer tüm sesleri durdur (Opsiyonel ama iyi olur, şimdilik basit tutalım)
      sesRef.current?.play();
    }
    setCaliyor(!caliyor);
  };

  // Ses bittiğinde ikonu düzelt
  const bitti = () => setCaliyor(false);

  // --- TASARIM 1: KUTU (Kolik Sesleri İçin) ---
  if (tip === 'kutu') {
    return (
      <div onClick={oynatDurdur} className={`min-w-[100px] h-28 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all border ${caliyor ? 'bg-yellow-500 text-black border-yellow-400 scale-95' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}>
        <div className="flex justify-between items-start">
            <img src={veri.resim_url} className="w-8 h-8 opacity-80" />
            {caliyor ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </div>
        <p className="text-xs font-bold leading-tight">{veri.baslik}</p>
        <audio ref={sesRef} src={veri.dosya_url} onEnded={bitti} loop={veri.kategori === 'Kolik'} />
      </div>
    );
  }

  // --- TASARIM 2: LİSTE (Ninniler İçin) ---
  if (tip === 'liste') {
    return (
      <div onClick={oynatDurdur} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer border transition-colors ${caliyor ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
        <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center shrink-0">
            {caliyor ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-bold">{veri.baslik}</h4>
            <p className="text-xs opacity-60">{veri.sure}</p>
        </div>
        <audio ref={sesRef} src={veri.dosya_url} onEnded={bitti} />
      </div>
    );
  }

  // --- TASARIM 3: KART (Masallar İçin) ---
  return (
    <div onClick={oynatDurdur} className="relative h-32 rounded-xl overflow-hidden cursor-pointer group">
        {/* Arkaplan Resim */}
        <img src={veri.resim_url || "/placeholder.png"} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
        
        <div className="absolute bottom-3 left-3 right-3">
            <h4 className="text-sm font-bold text-white mb-1">{veri.baslik}</h4>
            <div className="flex items-center gap-2 text-[10px] text-gray-300">
                {caliyor ? <Pause className="w-3 h-3 text-green-400" /> : <Play className="w-3 h-3" />}
                {caliyor ? 'Çalıyor...' : 'Şimdi Dinle'}
            </div>
        </div>
        <audio ref={sesRef} src={veri.dosya_url} onEnded={bitti} />
    </div>
  );
}