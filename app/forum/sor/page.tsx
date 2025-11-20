"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { konuEkle } from '@/app/actions';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

const KATEGORILER = ["Genel", "Beslenme", "Uyku", "Sağlık", "Oyun & Aktivite", "Alışveriş"];

export default function SoruSorPage() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setYukleniyor(true);

    const form = new FormData(e.currentTarget);
    const baslik = form.get('baslik') as string;
    const icerik = form.get('icerik') as string;
    const kategori = form.get('kategori') as string;

    const basarili = await konuEkle(baslik, icerik, kategori);

    if (basarili) {
        router.push('/forum'); // Başarılıysa listeye dön
    } else {
        alert("Bir hata oluştu.");
        setYukleniyor(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      
      {/* Header */}
      <header className="p-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white z-10">
        <Link href="/forum" className="p-2 bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-bold text-gray-800 text-lg">Yeni Soru Sor</h1>
      </header>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Kategori Seçimi */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                <div className="flex flex-wrap gap-2">
                    {KATEGORILER.map((kat) => (
                        <label key={kat} className="cursor-pointer">
                            <input type="radio" name="kategori" value={kat} className="peer sr-only" defaultChecked={kat === "Genel"} />
                            <div className="px-3 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200 peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 transition-all">
                                {kat}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Başlık */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Konu Başlığı</label>
                <input 
                    name="baslik" 
                    required
                    placeholder="Örn: 2 aylık bebekte gaz sancısı" 
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            {/* İçerik */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Detaylı Açıklama</label>
                <textarea 
                    name="icerik" 
                    required
                    rows={5}
                    placeholder="Sorunuzu detaylıca anlatın..." 
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
            </div>

            {/* Gönder Butonu */}
            <button 
                type="submit" 
                disabled={yukleniyor}
                className="w-full bg-green-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {yukleniyor ? 'Gönderiliyor...' : (
                    <>
                        <Send className="w-5 h-5" />
                        Soruyu Yayınla
                    </>
                )}
            </button>

        </form>
      </div>

    </main>
  );
}