"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ilanEkle } from '@/app/actions';
import { ArrowLeft, Check, MapPin, Camera } from 'lucide-react'; // Camera ikonunu ekledik
import Link from 'next/link';
import { TURKIYE_VERISI, TUM_ILLER } from '@/lib/il-ilce';

const POPULER_SEHIRLER = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Diğer"];
const KATEGORILER = ["Giyim", "Araç-Gereç", "Oyuncak", "Mobilya", "Bakım"];

export default function IlanVerPage() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  
  // Resim Önizleme State'i (Seçilen resmi ekranda göstermek için)
  const [onizleme, setOnizleme] = useState<string | null>(null);

  // Şehir/İlçe State'leri
  const [secimTipi, setSecimTipi] = useState("İstanbul");
  const [listeSehir, setListeSehir] = useState("Adana");
  const [secilenIlce, setSecilenIlce] = useState("");

  const aktifSehir = secimTipi === "Diğer" ? listeSehir : secimTipi;
  const ilceler = useMemo(() => TURKIYE_VERISI[aktifSehir] || ["Merkez", "Diğer"], [aktifSehir]);

  // Fotoğraf seçilince çalışır
  const resimSecildi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0];
    if (dosya) {
      const url = URL.createObjectURL(dosya);
      setOnizleme(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setYukleniyor(true);
    const formData = new FormData(e.currentTarget);
    
    // Şehir bilgisini manuel eklemiyoruz, hidden input ile gidiyor zaten
    const basarili = await ilanEkle(formData);

    if (basarili) {
        router.push('/takas');
    } else {
        alert("Hata oluştu. Lütfen tekrar deneyin.");
        setYukleniyor(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <header className="p-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white z-10">
        <Link href="/takas" className="p-2 bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="font-bold text-gray-800 text-lg">İlan Ver</h1>
      </header>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* --- FOTOĞRAF YÜKLEME ALANI (BURASI EKSİKTİ) --- */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Fotoğrafı</label>
                
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden">
                    
                    {onizleme ? (
                        // Resim seçildiyse bunu göster
                        <img src={onizleme} alt="Önizleme" className="w-full h-full object-cover" />
                    ) : (
                        // Resim yoksa ikon ve yazı göster
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                                <Camera className="w-6 h-6 text-purple-600" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Fotoğraf Yüklemek İçin Dokun</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB)</p>
                        </div>
                    )}
                    
                    {/* Gizli Input (Tıklamayı bu yakalar) */}
                    <input 
                        name="resim" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={resimSecildi}
                    />
                </label>
            </div>

            {/* Başlık */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Adı</label>
                <input name="baslik" required placeholder="Örn: Kraft Bebek Arabası" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>

            {/* Fiyat ve Durum */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Fiyat</label>
                    <input name="fiyat" required placeholder="1500 TL" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Durum</label>
                    <select name="durum" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none">
                        <option>Az Kullanılmış</option>
                        <option>Yeni Gibi</option>
                        <option>Sıfır</option>
                        <option>Tamirlik</option>
                    </select>
                </div>
            </div>

            {/* ŞEHİR VE İLÇE SEÇİMİ */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                
                {/* Şehir */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        Şehir
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {POPULER_SEHIRLER.map(sehir => (
                            <button
                                key={sehir}
                                type="button"
                                onClick={() => setSecimTipi(sehir)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border
                                    ${secimTipi === sehir 
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300'
                                    }`}
                            >
                                {sehir}
                            </button>
                        ))}
                    </div>
                    {secimTipi === "Diğer" && (
                        <select 
                            value={listeSehir}
                            onChange={(e) => setListeSehir(e.target.value)}
                            className="w-full p-3 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-gray-700 font-medium animate-in fade-in"
                        >
                            {TUM_ILLER.filter(il => !POPULER_SEHIRLER.includes(il)).map(il => (
                                <option key={il} value={il}>{il}</option>
                            ))}
                        </select>
                    )}
                    <input type="hidden" name="sehir" value={aktifSehir} />
                </div>

                {/* İlçe */}
                <div className="animate-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">İlçe</label>
                    <select 
                        name="ilce"
                        required
                        className="w-full p-3 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-gray-700 font-medium"
                        onChange={(e) => setSecilenIlce(e.target.value)}
                    >
                        <option value="">İlçe Seçiniz...</option>
                        {ilceler.map((ilce) => (
                            <option key={ilce} value={ilce}>{ilce}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Kategori */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                <select name="kategori" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none">
                    {KATEGORILER.map(k => <option key={k}>{k}</option>)}
                </select>
            </div>

            <button type="submit" disabled={yukleniyor} className="w-full bg-purple-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                {yukleniyor ? 'Yükleniyor...' : <> <Check className="w-5 h-5" /> İlanı Yayınla </>}
            </button>

        </form>
      </div>
    </main>
  );
}