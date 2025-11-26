'use client'

import { useState, useRef } from 'react';
import { Play, Pause, Mic, Square, Upload, Trash2, PlusCircle, X } from 'lucide-react';
import { medyaYukle, medyaSil } from '@/app/actions';

export default function KullaniciMedyasi({ baslangicListesi }: { baslangicListesi: any[] }) {
  const [liste, setListe] = useState(baslangicListesi);
  const [calanId, setCalanId] = useState<number | null>(null);
  const [mod, setMod] = useState<'liste' | 'kayit' | 'yukle'>('liste');
  
  // Kayıt Durumları
  const [kayitYapiliyor, setKayitYapiliyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  // Audio Referansları
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // --- OYNATMA MANTIĞI ---
  const oynat = (medya: any) => {
    if (calanId === medya.id) {
        audioRef.current?.pause();
        setCalanId(null);
    } else {
        if (audioRef.current) {
            audioRef.current.src = medya.dosya_url;
            audioRef.current.play();
            setCalanId(medya.id);
        }
    }
  };

  // --- KAYIT MANTIĞI ---
  const kaydiBaslat = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        chunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            setYukleniyor(true);
            const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
            const file = new File([blob], "ses-kaydi.mp3", { type: 'audio/mp3' });
            
            const formData = new FormData();
            formData.append('dosya', file);
            formData.append('baslik', `Ses Kaydım ${new Date().toLocaleDateString()}`);
            formData.append('tip', 'kayit');

            await medyaYukle(formData);
            window.location.reload(); 
        };

        mediaRecorderRef.current.start();
        setKayitYapiliyor(true);
    } catch (err) {
        alert("Mikrofon izni gerekli!");
    }
  };

  const kaydiBitir = () => {
    mediaRecorderRef.current?.stop();
    setKayitYapiliyor(false);
  };

  // --- DOSYA YÜKLEME ---
  const dosyaYukle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setYukleniyor(true);
    const formData = new FormData(e.currentTarget);
    await medyaYukle(formData);
    window.location.reload();
  };

  // --- SİLME ---
  const sil = async (id: number) => {
    if(!confirm('Bu kaydı silmek istiyor musun?')) return;
    await medyaSil(id);
    setListe(liste.filter(m => m.id !== id));
  };

  // Eğer mod 'liste' değilse Modal göster
  const modalAcik = mod !== 'liste';

  return (
    <div>
       <audio ref={audioRef} onEnded={() => setCalanId(null)} className="hidden" />

       {/* Butonlar */}
       <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setMod('kayit')} 
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
             <Mic className="w-4 h-4 text-red-400" /> Kaydet
          </button>
          <button 
            onClick={() => setMod('yukle')} 
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
             <Upload className="w-4 h-4 text-blue-400" /> Yükle
          </button>
       </div>

       {/* Liste Görünümü */}
       <div className="space-y-2">
          {liste.map((m) => (
             <div key={m.id} className={`bg-slate-700/50 p-3 rounded-xl flex items-center gap-3 border ${calanId === m.id ? 'border-purple-500' : 'border-transparent'}`}>
                <button 
                  onClick={() => oynat(m)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${calanId === m.id ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-300'}`}
                >
                    {calanId === m.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-200 truncate">{m.baslik}</h4>
                    <span className="text-[10px] text-slate-400 uppercase">{m.tip}</span>
                </div>
                <button onClick={() => sil(m.id)} className="p-2 text-slate-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                </button>
             </div>
          ))}
          {liste.length === 0 && <div className="text-center text-slate-500 text-xs py-2">Henüz kayıt yok.</div>}
       </div>

       {/* --- MODAL PENCERELER --- */}
       {modalAcik && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl p-6 relative">
               <button onClick={() => setMod('liste')} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
               </button>

               {/* KAYIT MODU */}
               {mod === 'kayit' && (
                  <div className="text-center py-4">
                     <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 transition-all ${kayitYapiliyor ? 'bg-red-500/20 animate-pulse' : 'bg-slate-700'}`}>
                        <Mic className={`w-10 h-10 ${kayitYapiliyor ? 'text-red-500' : 'text-slate-400'}`} />
                     </div>
                     <h3 className="text-lg font-bold text-white mb-6">{kayitYapiliyor ? 'Kaydediliyor...' : 'Ses Kaydet'}</h3>
                     
                     {!kayitYapiliyor ? (
                        <button onClick={kaydiBaslat} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold">Kayıt Başlat</button>
                     ) : (
                        <button onClick={kaydiBitir} className="w-full py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold">Bitir</button>
                     )}
                  </div>
               )}

               {/* YÜKLEME MODU */}
               {mod === 'yukle' && (
                  <form onSubmit={dosyaYukle} className="space-y-4">
                     <h3 className="text-lg font-bold text-white mb-4">Dosya Yükle</h3>
                     <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1">Başlık</label>
                        <input name="baslik" required placeholder="Örn: Ninni" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-purple-500" />
                     </div>
                     <input type="hidden" name="tip" value="ninni" />
                     
                     <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center relative hover:border-slate-400 transition-colors">
                        <input type="file" name="dosya" accept="audio/*" required className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">MP3 Dosyası Seç</p>
                     </div>

                     <button disabled={yukleniyor} type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                        {yukleniyor ? 'Yükleniyor...' : 'Kütüphaneye Ekle'}
                     </button>
                  </form>
               )}
            </div>
         </div>
       )}
    </div>
  );
}