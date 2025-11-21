"use client";

import { useState } from 'react';
import { login, signup } from './actions'; // Birazdan oluşturacağız
import { Baby, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mod, setMod] = useState<'giris' | 'kayit'>('giris'); // Giriş mi Kayıt mı?

  const islemYap = async (formData: FormData) => {
    setYukleniyor(true);
    if (mod === 'giris') {
        await login(formData);
    } else {
        await signup(formData);
    }
    setYukleniyor(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-500 to-blue-700">
      
      {/* Logo Alanı */}
      <div className="bg-white p-4 rounded-full shadow-xl mb-6 animate-bounce">
        <Baby className="w-12 h-12 text-blue-600" />
      </div>

      <div className="text-center text-white mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Ezel Bebek</h1>
        <p className="text-blue-100 text-sm mt-2">Akıllı Ebeveyn Asistanı</p>
      </div>

      {/* Form Kartı */}
      <div className="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl">
        
        <div className="flex gap-4 mb-6 border-b border-gray-100 pb-4">
            <button 
                onClick={() => setMod('giris')} 
                className={`flex-1 pb-2 text-sm font-bold transition-colors ${mod === 'giris' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
            >
                Giriş Yap
            </button>
            <button 
                onClick={() => setMod('kayit')} 
                className={`flex-1 pb-2 text-sm font-bold transition-colors ${mod === 'kayit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
            >
                Kayıt Ol
            </button>
        </div>

        <form action={islemYap} className="space-y-4">
            
            <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="E-posta Adresi" 
                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                />
            </div>

            <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="Şifre" 
                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                />
            </div>

            <button 
                type="submit" 
                disabled={yukleniyor} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
                {yukleniyor ? 'İşlem Yapılıyor...' : (
                    <>
                        {mod === 'giris' ? 'Giriş Yap' : 'Hesap Oluştur'}
                        <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>

        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
            {mod === 'giris' ? 'Hesabın yok mu?' : 'Zaten üye misin?'} 
            <button onClick={() => setMod(mod === 'giris' ? 'kayit' : 'giris')} className="text-blue-600 font-bold ml-1 hover:underline">
                {mod === 'giris' ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
        </p>

      </div>
    </main>
  );
}