'use client'

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { yorumEkle } from '@/app/actions';

export default function YorumFormu({ konuId }: { konuId: number }) {
  const [yorum, setYorum] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!yorum.trim()) return;

    setYukleniyor(true);
    try {
        const sonuc = await yorumEkle(konuId, yorum);
        if (sonuc) {
            setYorum(''); 
        } else {
            alert("Yorum gönderilemedi.");
        }
    } catch (err) {
        console.error(err);
        alert("Bir hata oluştu.");
    } finally {
        setYukleniyor(false);
    }
  };

  return (
    <form onSubmit={gonder} className="relative mt-4 flex items-center gap-2">
      <label htmlFor="yorum" className="sr-only">Yorumunuz</label>
      <input 
        type="text" 
        name="yorum"  // EKLENDİ
        id="yorum"    // EKLENDİ
        value={yorum}
        onChange={(e) => setYorum(e.target.value)}
        placeholder="Bir yorum yaz..." 
        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm text-gray-800"
        disabled={yukleniyor}
        autoComplete="off"
      />
      
      <button 
        type="submit" 
        disabled={yukleniyor || !yorum.trim()}
        className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        aria-label="Yorumu Gönder"
      >
        {yukleniyor ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
      </button>
    </form>
  );
}