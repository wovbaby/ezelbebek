'use client'

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { kullaniciOnayla } from '@/app/actions';

export default function OnayButonu({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const onayla = async () => {
    if (!confirm("Bu kullanıcıyı onaylayıp sisteme almak istiyor musun?")) return;
    
    setLoading(true);
    const basarili = await kullaniciOnayla(userId);
    
    if (!basarili) {
        alert("İşlem başarısız oldu. Yetkinizi kontrol edin.");
        setLoading(false);
    }
    // Başarılı olursa sayfa sunucu tarafında yenilenir (revalidatePath)
  };

  return (
    <button 
        onClick={onayla} 
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
    >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        {loading ? 'Onaylanıyor...' : 'Kullanıcıyı Onayla'}
    </button>
  );
}