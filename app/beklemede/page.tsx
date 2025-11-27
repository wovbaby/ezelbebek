import { LogOut, Clock } from 'lucide-react';
import Link from 'next/link';

export default function BeklemedePage() {
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Clock className="w-10 h-10 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Hesabınız İnceleniyor</h1>
        <p className="text-gray-600 text-sm mb-8">
            Güvenliğimiz için yeni üyelikleri yönetici onayından geçiriyoruz. 
            Hesabınız onaylandığında giriş yapabileceksiniz.
        </p>
        
        <Link href="/login" className="text-orange-600 font-bold text-sm flex items-center gap-2 hover:underline">
            <LogOut className="w-4 h-4" /> Giriş Ekranına Dön
        </Link>
    </div>
  );
}