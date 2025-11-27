'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { konuEkle } from '@/app/actions';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SoruSorPage() {
  const [baslik, setBaslik] = useState('');
  const [icerik, setIcerik] = useState('');
  const [kategori, setKategori] = useState('Gelişim');
  const [yukleniyor, setYukleniyor] = useState(false);
  const router = useRouter();

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!baslik.trim() || !icerik.trim()) {
        alert("Lütfen başlık ve içerik giriniz.");
        return;
    }

    setYukleniyor(true);
    
    try {
        const sonuc = await konuEkle(baslik, icerik, kategori);
        
        if (sonuc) {
            router.push('/forum');
            router.refresh();
        } else {
            alert('Bir hata oluştu, tekrar deneyin.');
        }
    } catch (error) {
        console.error(error);
        alert('Bağlantı hatası oluştu.');
    } finally {
        setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <Link href="/forum" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800">Soru Sor</h1>
            </div>

            <form onSubmit={gonder} className="space-y-5">
                <div>
                    <label htmlFor="baslik" className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Başlık</label>
                    <input 
                        type="text"
                        name="baslik" // EKLENDİ
                        id="baslik"   // EKLENDİ
                        value={baslik}
                        onChange={(e) => setBaslik(e.target.value)}
                        placeholder="Örn: Diş çıkarma dönemi ne zaman başlar?" 
                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-gray-800"
                        required
                        maxLength={100}
                    />
                </div>

                <div>
                    <label htmlFor="kategori" className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Kategori</label>
                    <div className="relative">
                        <select 
                            name="kategori" // EKLENDİ
                            id="kategori"   // EKLENDİ
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition-all text-gray-700 cursor-pointer"
                        >
                            <option>Gelişim</option>
                            <option>Beslenme</option>
                            <option>Uyku</option>
                            <option>Sağlık</option>
                            <option>Oyun & Aktivite</option>
                            <option>Anneler Konuşuyor</option>
                            <option>Diğer</option>
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none text-gray-400">▼</div>
                    </div>
                </div>

                <div>
                    <label htmlFor="icerik" className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Detaylar</label>
                    <textarea 
                        name="icerik" // EKLENDİ
                        id="icerik"   // EKLENDİ
                        value={icerik}
                        onChange={(e) => setIcerik(e.target.value)}
                        placeholder="Sorunuzu buraya detaylıca yazabilirsiniz..." 
                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl h-40 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all text-gray-800"
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={yukleniyor}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                    {yukleniyor ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Gönderiliyor...</>
                    ) : (
                        <><Send className="w-5 h-5" /> Paylaş</>
                    )}
                </button>
            </form>
        </div>
    </div>
  );
}