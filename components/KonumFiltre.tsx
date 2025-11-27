'use client'

import { useRouter, useSearchParams } from 'next/navigation';

const SEHIRLER = ["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Adana", "Gaziantep", "Konya"];

export default function KonumFiltre() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const aktifSehir = searchParams.get('sehir');

  const filtrele = (sehir: string) => {
    if (sehir === aktifSehir) {
      router.push('/takas'); // Filtreyi kaldır
    } else {
      router.push(`/takas?sehir=${sehir}`);
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {SEHIRLER.map(sehir => (
        <button
          key={sehir}
          onClick={() => filtrele(sehir)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${aktifSehir === sehir ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          {sehir}
        </button>
      ))}
    </div>
  );
}