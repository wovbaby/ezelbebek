"use client";

import { MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function KonumFiltre() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mevcutSehir = searchParams.get('sehir');
  const [konumAliniyor, setKonumAliniyor] = useState(false);

  // GPS İzni İste ve Şehri Bul (Simülasyon)
  const konumuBul = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    setKonumAliniyor(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Normalde burada Google Maps API ile koordinattan şehri buluruz.
        // Şimdilik GPS çalıştıysa "İstanbul" varsayıyoruz (Demo olduğu için)
        setTimeout(() => {
            setKonumAliniyor(false);
            router.push('/takas?sehir=İstanbul'); // Filtreyi uygula
            alert("Konumunuz bulundu: İstanbul (Yakınındakiler listeleniyor)");
        }, 1000);
      },
      (error) => {
        setKonumAliniyor(false);
        alert("Konum alınamadı. Lütfen elle şehir seçin.");
      }
    );
  };

  const filtreyiTemizle = () => {
    router.push('/takas');
  };

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
      
      {/* Konumumu Bul Butonu */}
      <button 
        onClick={konumuBul}
        className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
        ${mevcutSehir === 'İstanbul' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 border border-blue-100'}`}
      >
        {konumAliniyor ? (
            <span className="animate-pulse">Konum aranıyor...</span>
        ) : (
            <>
                <Navigation className="w-3 h-3" />
                Yakınımdakiler
            </>
        )}
      </button>

      {/* Diğer Şehirler (Örnek) */}
      <button onClick={() => router.push('/takas?sehir=Ankara')} className="px-3 py-2 bg-white border border-gray-200 rounded-full text-xs text-gray-600 whitespace-nowrap">Ankara</button>
      <button onClick={() => router.push('/takas?sehir=İzmir')} className="px-3 py-2 bg-white border border-gray-200 rounded-full text-xs text-gray-600 whitespace-nowrap">İzmir</button>
      
      {mevcutSehir && (
          <button onClick={filtreyiTemizle} className="px-3 py-2 bg-gray-200 rounded-full text-xs text-gray-600 font-bold">
              X Temizle
          </button>
      )}
    </div>
  );
}