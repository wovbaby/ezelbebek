'use client'

import { useState, useRef } from 'react';
import { Play, Pause, Mic, Upload, Trash2, X, StopCircle, Loader2 } from 'lucide-react';
import { getCloudinarySignature, medyaKaydet, medyaSil } from '@/app/actions';

export default function KullaniciMedyasi({ baslangicListesi }: { baslangicListesi: any[] }) {
  const [liste, setListe] = useState(baslangicListesi);
  const [calanId, setCalanId] = useState<number | null>(null);
  const [mod, setMod] = useState<'liste' | 'kayit' | 'yukle'>('liste');
  
  // Kayıt ve Yükleme Durumları
  const [kayitYapiliyor, setKayitYapiliyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [yuklemeYuzdesi, setYuklemeYuzdesi] = useState(0);

  // Audio Referansları
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // --- OYNATMA ---
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

  // --- SİLME ---
  const sil = async (id: number) => {
    if(!confirm('Silmek istediğine emin misin?')) return;
    setListe(prev => prev.filter(m => m.id !== id));
    await medyaSil(id);
  };

  // --- YÜKLEME (DIRECT UPLOAD) ---
  const bulutaYukle = async (file: File, baslik: string, tip: string) => {
    try {
        setYukleniyor(true);
        setYuklemeYuzdesi(10);

        // 1. İmza Al
        const { timestamp, signature } = await getCloudinarySignature();
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

        if (!apiKey || !cloudName) {
            alert("API anahtarları eksik! .env.local kontrol edilmeli.");
            setYukleniyor(false);
            return;
        }

        // 2. Form Hazırla
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey); 
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', 'bebek-medya');
        formData.append('resource_type', 'video'); // Ses dosyaları 'video' tipiyle yüklenir

        setYuklemeYuzdesi(40);

        // 3. Cloudinary'ye Gönder
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'Yükleme başarısız');
        }
        
        const data = await response.json();
        setYuklemeYuzdesi(90);

        // 4. Süre Hesapla
        let sureStr = "00:00";
        if (data.duration) {
            const totalSeconds = Math.round(data.duration);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            sureStr = `${minutes}:${seconds < 10 ? '0'+seconds : seconds}`;
        }

        // 5. Veritabanına Yaz
        await medyaKaydet(baslik, data.secure_url, sureStr, tip);
        
        setYuklemeYuzdesi(100);
        window.location.reload();

    } catch (error: any) {
        console.error(error);
        alert("Hata: " + error.message);
        setYukleniyor(false);
    }
  };

  // --- KAYIT ---
  const kaydiBaslat = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        chunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
            const file = new File([blob], "ses-kaydi.mp3", { type: 'audio/mp3' });
            await bulutaYukle(file, `Ses Kaydım ${new Date().toLocaleDateString()}`, 'kayit');
        };

        mediaRecorderRef.current.start();
        setKayitYapiliyor(true);
    } catch (err) {
        alert("Mikrofona izin vermen gerekiyor.");
    }
  };

  const kaydiBitir = () => {
    mediaRecorderRef.current?.stop();
    setKayitYapiliyor(false);
  };

  // --- DOSYA YÜKLEME HANDLER ---
  const dosyaYukleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('dosya') as File;
    const baslik = formData.get('baslik') as string;
    
    if (file && file.size > 0) {
        await bulutaYukle(file, baslik, 'ninni');
    }
  };

  const modalAcik = mod !== 'liste';

  return (
    <div>
       <audio ref={audioRef} onEnded={() => setCalanId(null)} className="hidden" />

       {/* Üst Butonlar */}
       <div className="flex gap-2 mb-4">
          <button onClick={() => setMod('kayit')} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors">
             <Mic className="w-4 h-4 text-red-400" /> Kaydet
          </button>
          <button onClick={() => setMod('yukle')} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors">
             <Upload className="w-4 h-4 text-blue-400" /> Yükle
          </button>
       </div>

       {/* Liste Görünümü */}
       <div className="space-y-2">
          {liste.map((m) => (
             <div key={m.id} className={`bg-slate-800/50 p-3 rounded-xl flex items-center gap-3 border transition-colors ${calanId === m.id ? 'border-purple-500 bg-slate-800' : 'border-transparent'}`}>
                <button 
                  onClick={() => oynat(m)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${calanId === m.id ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                    {calanId === m.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-200 truncate">{m.baslik}</h4>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{m.tip} • {m.süre}</span>
                </div>
                <button onClick={() => sil(m.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
             </div>
          ))}
          {liste.length === 0 && <div className="text-center text-slate-500 text-xs py-4 border border-dashed border-slate-700 rounded-xl">Henüz kayıt yok.</div>}
       </div>

       {/* MODAL PENCERELER */}
       {modalAcik && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
               
               {!yukleniyor && (
                   <button onClick={() => setMod('liste')} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-700/50 p-1 rounded-full">
                      <X className="w-5 h-5" />
                   </button>
               )}

               {/* KAYIT MODU */}
               {mod === 'kayit' && (
                  <div className="text-center py-6">
                     <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${kayitYapiliyor ? 'bg-red-500/20 ring-4 ring-red-500/10 scale-110' : 'bg-slate-700'}`}>
                        <Mic className={`w-10 h-10 ${kayitYapiliyor ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                     </div>
                     
                     <h3 className="text-lg font-bold text-white mb-2">
                        {yukleniyor ? 'Buluta Yükleniyor...' : kayitYapiliyor ? 'Kaydediliyor...' : 'Ses Kaydet'}
                     </h3>
                     
                     {/* Progress Bar */}
                     {yukleniyor && (
                         <div className="w-full bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
                            <div className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${yuklemeYuzdesi}%` }}></div>
                         </div>
                     )}

                     {!yukleniyor && (
                         !kayitYapiliyor ? (
                            <button onClick={kaydiBaslat} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95">
                                Kaydı Başlat
                            </button>
                         ) : (
                            <button onClick={kaydiBitir} className="w-full py-3 bg-slate-100 hover:bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                                <StopCircle className="w-5 h-5 text-red-600 fill-red-600" /> Bitir ve Kaydet
                            </button>
                         )
                     )}
                  </div>
               )}

               {/* YÜKLEME MODU */}
               {mod === 'yukle' && (
                  <form onSubmit={dosyaYukleSubmit} className="space-y-5">
                     <div className="text-center">
                        <h3 className="text-lg font-bold text-white">Dosya Yükle</h3>
                        <p className="text-xs text-slate-400 mt-1">Telefonundaki MP3 ninnileri yükle</p>
                     </div>

                     <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1.5 ml-1">Başlık</label>
                        <input name="baslik" required placeholder="Örn: Dandini Dastana" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-blue-500 transition-all placeholder:text-slate-600" />
                     </div>
                     
                     {!yukleniyor && (
                        <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center relative hover:border-blue-500 hover:bg-slate-700/30 transition-all cursor-pointer group">
                            <input type="file" name="dosya" accept="audio/*" required className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20" />
                            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
                            <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">MP3 Dosyası Seç</p>
                        </div>
                     )}

                     <button disabled={yukleniyor} type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold relative overflow-hidden shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-80">
                        {yukleniyor ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor %{yuklemeYuzdesi}
                            </div>
                        ) : 'Kütüphaneye Ekle'}
                     </button>
                  </form>
               )}
            </div>
         </div>
       )}
    </div>
  );
}