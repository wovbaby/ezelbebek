"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, Flame, Timer } from 'lucide-react';
import { kaloriEkle } from '@/app/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Egzersiz Listesi (Statik)
const EGZERSIZLER = [
  { id: 1, ad: "Squat (Çömelme)", sure: 30, kalori: 15, resim: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&q=80" },
  { id: 2, ad: "Plank", sure: 20, kalori: 10, resim: "https://images.unsplash.com/photo-1515890497928-02382949dd32?w=500&q=80" },
  { id: 3, ad: "Köprü Hareketi", sure: 45, kalori: 20, resim: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&q=80" },
  { id: 4, ad: "Kobra Esnemesi", sure: 60, kalori: 5, resim: "https://images.unsplash.com/photo-1544367563-12123d8965cd?w=500&q=80" },
  { id: 5, ad: "Yüksek Diz Çekme", sure: 30, kalori: 25, resim: "https://images.unsplash.com/photo-1434608519344-49d77a699ded?w=500&q=80" },
];

export default function SporPage() {
  const router = useRouter();
  const [aktifEgzersiz, setAktifEgzersiz] = useState<any>(null);
  const [sayac, setSayac] = useState(0);
  const [tamamlandi, setTamamlandi] = useState(false);

  // Sayaç Mantığı
  useEffect(() => {
    let interval: any;
    if (aktifEgzersiz && sayac > 0) {
      interval = setInterval(() => {
        setSayac((prev) => prev - 1);
      }, 1000);
    } else if (sayac === 0 && aktifEgzersiz) {
      // Süre bitti
      bitir();
    }
    return () => clearInterval(interval);
  }, [aktifEgzersiz, sayac]);

  const baslat = (egzersiz: any) => {
    setAktifEgzersiz(egzersiz);
    setSayac(egzersiz.sure);
    setTamamlandi(false);
  };

  const bitir = async () => {
    if (!aktifEgzersiz) return;
    await kaloriEkle(aktifEgzersiz.kalori); // Veritabanına yaz
    setTamamlandi(true);
    setAktifEgzersiz(null); // Moddan çık
    // 2 saniye sonra başarı mesajını kapat
    setTimeout(() => setTamamlandi(false), 3000);
  };

  return (
    <main className="min-h-screen bg-white pb-24">
      
      {/* Header */}
      <header className="p-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white z-10">
        <Link href="/anne" className="p-2 bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-bold text-gray-800 text-lg">Fit Anne</h1>
      </header>

      {/* --- AKTİF EGZERSİZ MODU (TAM EKRAN) --- */}
      {aktifEgzersiz && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white p-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">{aktifEgzersiz.ad}</h2>
                <p className="text-gray-300 animate-pulse">Hareket Zamanı!</p>
            </div>
            
            <div className="w-48 h-48 rounded-full border-8 border-orange-500 flex items-center justify-center text-6xl font-bold mb-8 bg-white/10 backdrop-blur-sm">
                {sayac}
            </div>

            <button onClick={() => setAktifEgzersiz(null)} className="text-gray-400 text-sm underline">
                İptal Et
            </button>
        </div>
      )}

      {/* --- BAŞARI MESAJI --- */}
      {tamamlandi && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-5">
            <CheckCircle className="w-5 h-5" />
            <span>Harika! Kaloriler eklendi.</span>
        </div>
      )}

      {/* LİSTE */}
      <div className="p-4 space-y-4">
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4">
            <p className="text-sm text-orange-800">
                <b>İpucu:</b> Bebek uyurken veya oyun halısındayken bu kısa hareketlerle enerjini topla.
            </p>
        </div>

        {EGZERSIZLER.map((egz) => (
            <div key={egz.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex h-28">
                {/* Resim */}
                <div className="w-28 relative bg-gray-200">
                    <img src={egz.resim} className="w-full h-full object-cover" />
                </div>
                
                {/* Bilgi */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-800">{egz.ad}</h3>
                        <div className="flex gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Timer className="w-3 h-3" /> {egz.sure} sn
                            </span>
                            <span className="text-xs text-orange-500 flex items-center gap-1 font-bold">
                                <Flame className="w-3 h-3" /> {egz.kalori} cal
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => baslat(egz)}
                        className="w-full bg-gray-900 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        <Play className="w-3 h-3 fill-white" /> BAŞLA
                    </button>
                </div>
            </div>
        ))}
      </div>

    </main>
  );
}