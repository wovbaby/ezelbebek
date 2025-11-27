'use client'

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { yorumEkle } from '@/app/actions';

export default function YorumFormu({ konuId }: { konuId: number }) {
  const [yorum, setYorum] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Kontrol: Butona basıldı mı?
    console.log("Butona basıldı. Yorum:", yorum);

    if (!yorum.trim()) {
        alert("Boş yorum gönderilemez.");
        return;
    }

    setYukleniyor(true);
    try {
        // 2. Server Action çağrılıyor
        console.log("Sunucuya gönderiliyor...");
        const sonuc = await yorumEkle(konuId, yorum);
        
        if (sonuc) {
            console.log("Başarılı!");
            setYorum(''); // Kutuyu temizle
            // Sayfa action içindeki revalidatePath ile yenilenecek
        } else {
            console.error("Sunucu false döndürdü.");
            alert("Yorum kaydedilemedi. Giriş yaptığınızdan emin olun.");
        }
    } catch (err) {
        console.error("Hata oluştu:", err);
        alert("Beklenmedik bir hata oluştu.");
    } finally {
        setYukleniyor(false);
    }
  };

  return (
    <div className="mt-4">
        <form 
            onSubmit={gonder} 
            className="relative flex items-center gap-2"
        >
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
          
          {/* Type="submit" olduğundan emin ol ve disabled şartını kaldırdım */}
          <button 
            type="submit" 
            className="absolute right-2 top-2 bottom-2 aspect-square bg-purple-600 text-white rounded-xl hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Gönder"
          >
            {yukleniyor ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </form>
        {/* Kullanıcıya not: Giriş yapmadıysa uyarı ver */}
        <p className="text-[10px] text-gray-400 mt-2 ml-2">
            Yorum yapmak için giriş yapmış olmalısınız.
        </p>
    </div>
  );
}