'use client'

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { kullaniciOnayla } from '@/app/actions';

export default function OnayButonu({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const onayla = async () => {
    if (!confirm("Bu kullanıcıyı onaylıyor musun?")) return;
    setLoading(true);
    await kullaniciOnayla(userId);
    setLoading(false);
  };

  return (
    <button 
        onClick={onayla} 
        disabled={loading}
        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
    >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        Onayla
    </button>
  );
}