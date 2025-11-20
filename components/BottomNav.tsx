"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Activity, Repeat, User, MessageCircle } from 'lucide-react'; // MessageCircle eklendi

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Ana Sayfa', href: '/', icon: Home },
    { name: 'Gelişim', href: '/gelisim', icon: Activity },
    { name: 'Takas', href: '/takas', icon: Repeat },
    { name: 'Forum', href: '/forum', icon: MessageCircle }, // YENİ BUTON
    { name: 'Profil', href: '/profil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* DİKKAT: grid-cols-5 yaptık ki 5 tane buton sığsın */}
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-2 group transition-colors duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              <Icon 
                className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}