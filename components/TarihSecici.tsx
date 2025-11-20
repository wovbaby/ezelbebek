"use client";

import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { useRef } from 'react';

export default function TarihSecici({ tarih }: { tarih: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const bugun = new Date().toISOString().split('T')[0];

  // Tarih değişince çalışır
  const tarihDegistir = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yeniTarih = e.target.value;
    if (yeniTarih) {
       router.push(`/gelisim?tarih=${yeniTarih}`);
    }
  };

  // Yazıya tıklayınca Takvimi Zorla Aç (Sihirli Dokunuş)
  const takvimiAc = () => {
    try {
        // Modern tarayıcılar için:
        if (inputRef.current && 'showPicker' in HTMLInputElement.prototype) {
            inputRef.current.showPicker();
        } else {
            // Eski yöntem (yedek):
            inputRef.current?.click();
        }
    } catch (error) {
        console.log("Takvim açma hatası:", error);
    }
  };

  return (
    <div 
        onClick={takvimiAc} 
        className="relative flex flex-col items-center justify-center cursor-pointer group p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors select-none"
    >
      
      {/* GÖRÜNEN KISIM */}
      <div className="flex items-center gap-2 text-lg font-bold text-gray-800 group-active:scale-95 transition-transform">
        <Calendar className="w-4 h-4 text-blue-500" />
        <span>
            {new Date(tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-0.5">
          {tarih === bugun ? "Bugün (Değiştirmek için dokun)" : new Date(tarih).toLocaleDateString('tr-TR', { weekday: 'long' })}
      </p>

      {/* GİZLİ INPUT (Ref ile bağlı) */}
      <input 
        ref={inputRef}
        type="date" 
        value={tarih}
        onChange={tarihDegistir}
        className="absolute w-0 h-0 opacity-0 top-0 left-0" // Tamamen gizledik ama DOM'da var
      />
      
    </div>
  );
}