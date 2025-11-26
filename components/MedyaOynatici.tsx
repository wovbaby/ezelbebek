'use client'

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic, Square, Upload, Trash2, MoreVertical, Disc } from 'lucide-react';
import { medyaYukle, medyaSil } from '@/app/actions';

export default function MedyaOynatici({ baslangicListesi }: { baslangicListesi: any[] }) {
  const [liste, setListe] = useState(baslangicListesi);
  const [calanId, setCalanId] = useState<number | null>(null);
  const [kayitYapiliyor, setKayitYapiliyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mod, setMod] = useState<'liste' | 'kayit' | 'yukle'>('liste');

  // Audio Referansı
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Oynat / Duraklat
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

  // Ses Kaydını Başlat
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
            formData.append('baslik', `Ses Kaydı ${new Date().toLocaleDateString()}`);
            formData.append('tip', 'kayit');

            await medyaYukle(formData);
            window.location.reload(); // Listeyi yenilemek için basit yol
        };

        mediaRecorderRef.current.start();
        setKayitYapiliyor(true);
    } catch (err) {
        alert("Mikrofon izni gerekli!");
    }
  };

  // Kaydı Durdur ve Yükle
  const kaydiBitir = () => {
    mediaRecorderRef.current?.stop();
    setKayitYapiliyor(false);
  };

  // Dosya Yükleme (Ninni MP3)
  const dosyaYukle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setYukleniyor(true);
    const formData = new FormData(e.currentTarget);
    await medyaYukle(formData);
    setYukleniyor(false);
    setMod('liste');
    window.location.reload();
  };

  // Silme
  const sil = async (id: number) => {
    if(!confirm('Silmek istiyor musun?')) return;
    await medyaSil(id);
    setListe(liste.filter(m => m.id !== id));
  };

  return (
    <div>
        {/* Görünmez Audio Elementi */}
        <audio ref={audioRef} onEnded={() => setCalanId(null)} />

        {/* ÜST MENÜ BUTONLARI */}
        <div className="flex gap-2 mb-6">
            <button onClick={() => setMod('liste')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${mod === 'liste' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>Listem</button>
            <button onClick={() => setMod('kayit')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${mod === 'kayit' ? 'bg-red-500 text-white' : 'bg-white text-gray-600'}`}>Ses Kaydet</button>
            <button onClick={() => setMod('yukle')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${mod === 'yukle' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}>Ninni Yükle</button>
        </div>

        {/* --- MOD: LİSTE --- */}
        {mod === 'liste' && (
            <div className="space-y-3">
                {liste.map((m) => (
                    <div key={m.id} className={`bg-white p-3 rounded-xl shadow-sm border flex items-center gap-3 ${calanId === m.id ? 'border-indigo-400 ring-1 ring-indigo-200' : 'border-gray-100'}`}>
                        <button 
                          onClick={() => oynat(m)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${calanId === m.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'}`}
                        >
                            {calanId === m.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm truncate">{m.baslik}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                <span className="uppercase font-bold">{m.tip}</span>
                                <span>•</span>
                                <span>{m.süre || '00:00'}</span>
                            </div>
                        </div>

                        <button onClick={() => sil(m.id)} className="p-2 text-gray-300 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {liste.length === 0 && <div className="text-center text-gray-400 text-sm py-10">Henüz kayıt yok.</div>}
            </div>
        )}

        {/* --- MOD: SES KAYIT --- */}
        {mod === 'kayit' && (
            <div className="bg-white p-8 rounded-3xl shadow-md text-center">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 transition-all ${kayitYapiliyor ? 'bg-red-100 animate-pulse' : 'bg-gray-100'}`}>
                    <Mic className={`w-10 h-10 ${kayitYapiliyor ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                
                <h3 className="font-bold text-lg mb-2">{kayitYapiliyor ? 'Kaydediliyor...' : 'Kayıt Bekleniyor'}</h3>
                <p className="text-xs text-gray-400 mb-6">Bebeğinin sesini veya kendi ninnini kaydet.</p>

                {!kayitYapiliyor ? (
                    <button onClick={kaydiBaslat} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200">
                        Kaydı Başlat
                    </button>
                ) : (
                    <button onClick={kaydiBitir} className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold">
                        <Square className="w-4 h-4 inline mr-2" /> Bitir ve Kaydet
                    </button>
                )}
                {yukleniyor && <p className="text-xs text-blue-500 mt-2 font-bold animate-pulse">Yükleniyor, lütfen bekle...</p>}
            </div>
        )}

        {/* --- MOD: DOSYA YÜKLE --- */}
        {mod === 'yukle' && (
            <div className="bg-white p-6 rounded-3xl shadow-md">
                <form onSubmit={dosyaYukle} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-1">Başlık</label>
                        <input name="baslik" required placeholder="Örn: Dandini Dastana" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
                    </div>
                    <input type="hidden" name="tip" value="ninni" />
                    
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input type="file" name="dosya" accept="audio/*" required className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-600">Ses Dosyası Seç (MP3)</p>
                        <p className="text-[10px] text-gray-400 mt-1">Maksimum 10MB</p>
                    </div>

                    <button disabled={yukleniyor} type="submit" className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-200">
                        {yukleniyor ? 'Yükleniyor...' : 'Kütüphaneye Ekle'}
                    </button>
                </form>
            </div>
        )}
    </div>
  );
}