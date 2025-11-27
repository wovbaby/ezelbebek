'use client'

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { yorumEkle } from '@/app/actions';

export default function YorumFormu({ konuId }: { konuId: number }) {
  const [yorum, setYorum] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!yorum.trim()) {
        alert("Lütfen bir şeyler yazın.");
        return;
    }

    setYukleniyor(true);
    try {
        const sonuc = await yorumEkle(konuId, yorum);
        
        // Sonuç kontrolü (actions.ts'deki yeni yapıya uygun)
        if (sonuc && typeof sonuc === 'object' && 'success' in sonuc && sonuc.success) {
            setYorum(''); // Başarılı
        } else {
            // Hata mesajını göster
            const hataMesaji = (sonuc && typeof sonuc === 'object' && 'error' in sonuc) ? sonuc.error : "Bir hata oluştu.";
            alert("HATA: " + hataMesaji);
        }
    } catch (err) {
        console.error(err);
        alert("Bağlantı hatası oluştu.");
    } finally {
        setYukleniyor(false);
    }
  };

  return (
    <div className="mt-4">
        <form onSubmit={gonder} className="relative flex items-center gap-2">
          <label htmlFor="yorum" className="sr-only">Yorum Yap</label>
          <input 
            type="text" 
            name="yorum"
            id="yorum"
            value={yorum}
            onChange={(e) => setYorum(e.target.value)}
            placeholder="Bir yorum yaz..." 
            className="flex-1 p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm text-gray-800 placeholder:text-gray-400"
            disabled={yukleniyor}
            autoComplete="off"
          />
          
          <button 
            type="submit" 
            disabled={yukleniyor || !yorum.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            aria-label="Gönder"
          >
            {yukleniyor ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </form>
        <p className="text-[10px] text-gray-400 mt-2 ml-2">
            Yorum yapmak için giriş yapmış olmalısınız.
        </p>
    </div>
  );
}