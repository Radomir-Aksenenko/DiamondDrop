import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="relative">
      <div className="h-[82px] px-6 py-4 flex items-center justify-between">
        {/* Логотип */}
        
        
        {/* Навигация (пока пустая) */}
        <nav>
          {/* Здесь будут пункты меню */}
        </nav>
      </div>
      {/* Разделительная полоска */}
      <div className="h-[2px] w-full bg-[#151519]"></div>
    </header>
  );
}