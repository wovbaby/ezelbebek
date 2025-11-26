'use client'

import { useState, useRef } from 'react';
import { Play, Pause, Disc } from 'lucide-react';

interface SesVerisi {
  id: number;
  baslik: string;
  dosya_url: string;
  süre?: string;
  sure?: string; // Veritabanı sütun adı farklılıklarını tolere etmek için
  kategori?: string;
  resim_url?: string;
}

export default function SesOynatici({ veri, tip = 'kutu' }: { veri: SesVerisi, tip?: 'kutu' | 'liste' | 'kart' }) {
  const [caliyor, setCaliyor] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (caliyor) {
      audioRef.current.pause();
    } else {
      // Sayfadaki diğer tüm sesleri durdur
      document.querySelectorAll('audio').forEach((el) => {
          if(el !== audioRef.current) (el as HTMLAudioElement).pause();
      });
      audioRef.current.play();
    }
    setCaliyor(!caliyor);
  };

  const bitti = () => setCaliyor(false);

  // --- KART GÖRÜNÜMÜ (Masallar İçin) ---
  if (tip === 'kart') {
    return (
        <div onClick={togglePlay} className="relative h-32 rounded-xl overflow-hidden cursor-pointer group border border-white/5">
            {/* Arkaplan Resim */}
            {veri.resim_url && (
                <img src={veri.resim_url} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            
            <div className="absolute bottom-3 left-3 right-3">
                <h4 className="text-sm font-bold text-white mb-1 truncate">{veri.baslik}</h4>
                <div className="flex items-center gap-2 text-[10px] text-gray-300">
                    {caliyor ? <Pause className="w-3 h-3 text-green-400" /> : <Play className="w-3 h-3" />}
                    {caliyor ? 'Çalıyor...' : 'Şimdi Dinle'}
                </div>
            </div>
            <audio ref={audioRef} src={veri.dosya_url} onEnded={bitti} onPause={bitti} onPlay={() => setCaliyor(true)} className="hidden" />
        </div>
    );
  }

  // --- LİSTE GÖRÜNÜMÜ (NİNNİLER İÇİN) ---
  if (tip === 'liste') {
      return (
        <div onClick={togglePlay} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${caliyor ? 'bg-slate-800 border-blue-500/50' : 'bg-slate-800/30 border-transparent hover:bg-slate-800/50'}`}>
            <audio ref={audioRef} src={veri.dosya_url} onEnded={bitti} onPause={bitti} onPlay={() => setCaliyor(true)} className="hidden" />
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${caliyor ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {caliyor ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </div>
            
            <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium truncate ${caliyor ? 'text-blue-300' : 'text-slate-200'}`}>{veri.baslik}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    {/* Kategori varsa göster */}
                    {veri.kategori && <span className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{veri.kategori}</span>}
                    <span>{veri.süre || veri.sure || '03:00'}</span>
                </div>
            </div>
        </div>
      );
  }

  // --- KUTU GÖRÜNÜMÜ (KOLİK SESLERİ İÇİN) ---
  return (
    <div onClick={togglePlay} className={`min-w-[100px] h-28 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all border ${caliyor ? 'bg-yellow-500 text-black border-yellow-400 scale-95' : 'bg-slate-800/50 border-white/10 hover:bg-slate-800'}`}>
        <div className="flex justify-between items-start">
            {/* Dönen Disk İkonu */}
            <Disc className={`w-6 h-6 ${caliyor ? 'animate-spin' : 'text-slate-500'}`} />
            {caliyor ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </div>
        <p className="text-xs font-bold leading-tight line-clamp-2">{veri.baslik}</p>
        <audio ref={audioRef} src={veri.dosya_url} onEnded={bitti} onPause={bitti} onPlay={() => setCaliyor(true)} loop={veri.kategori === 'Kolik'} className="hidden" />
    </div>
  );
}