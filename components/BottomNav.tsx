"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Activity, Repeat, User, MessageCircle, Music } from 'lucide-react'; // Music ikonunu ekledik

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Ana Sayfa', href: '/', icon: Home },
    { name: 'Gelişim', href: '/gelisim', icon: Activity },
    { name: 'Takas', href: '/takas', icon: Repeat },
    { name: 'Medya', href: '/medya', icon: Music }, // YENİ EKLENEN MODÜL
    { name: 'Forum', href: '/forum', icon: MessageCircle },
    { name: 'Profil', href: '/profil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* DİKKAT: 6 butonu sığdırmak için grid-cols-6 yaptık */}
      <div className="grid h-full max-w-lg grid-cols-6 mx-auto font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-1 group transition-colors duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              <Icon 
                className={`w-5 h-5 mb-1 ${isActive ? 'fill-current' : ''}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              {/* Yazıyı biraz daha küçülttük ki 6 tane sığsın */}
              <span className="text-[9px] font-bold truncate w-full text-center">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}