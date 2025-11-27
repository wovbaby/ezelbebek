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
    const sonuc = await yorumEkle(konuId, yorum);
    setYukleniyor(false);

    if (sonuc) {
      setYorum(''); // Formu temizle
      // Yorum listesi sunucu tarafında yenilendiği için (revalidatePath) 
      // ek bir şey yapmaya gerek yok, ama router.refresh() de eklenebilir.
    } else {
      alert("Yorum gönderilemedi.");
    }
  };

  return (
    <form onSubmit={gonder} className="relative mt-4">
      <input 
        type="text" 
        value={yorum}
        onChange={(e) => setYorum(e.target.value)}
        placeholder="Bir yorum yaz..." 
        className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
        disabled={yukleniyor}
      />
      <button 
        type="submit" 
        disabled={yukleniyor || !yorum.trim()}
        className="absolute right-2 top-2 p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {yukleniyor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </form>
  );
}