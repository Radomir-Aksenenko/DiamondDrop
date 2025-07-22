'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Импортируем SVG-иконки как React-компоненты
import AboutIcon from '../icons/AboutIcon';
import CaseIcon from '../icons/CaseIcon';
import UpdateIcon from '../icons/UpdateIcon';

interface NavButtonProps {
  icon: 'About' | 'Case' | 'Update' ; // Название иконки
  href: string; // Путь для навигации
  label?: string; // Опциональная подпись (если нужна)
}

/**
 * Компонент кнопки навигации для хедера
 * @param icon - Путь к SVG иконке (из папки /public/icons/)
 * @param href - Путь для навигации
 * @param label - Опциональная подпись
 */
export default function NavButton({ icon, href, label }: NavButtonProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  // Функция для выбора нужного SVG-компонента
  const getIconComponent = () => {
    switch (icon) {
      case 'About':
        return <AboutIcon className={`w-[14px] h-[12px]`} />;
      case 'Case':
        return <CaseIcon className={`w-[14px] h-[12px]`} />;
      case 'Update':
        return <UpdateIcon className={`w-[14px] h-[12px]`} />;
      default:
        return null;
    }
  };
  
  return (
    <Link 
      href={href}
      className={`inline-flex items-center gap-2 p-2 rounded-full ${isActive ? 'text-[#F9F8FC] bg-[#19191D]' : 'text-[#F9F8FC]/70 hover:bg-[#19191D] hover:text-[#F9F8FC]'}`}
    >
      <div className={`flex flex-col justify-center items-center w-[30px] h-[30px] gap-[10px] aspect-square rounded-[42px] ${isActive ? 'bg-[#5C5ADC]' : 'bg-[#F9F8FC]/5 hover:bg-[#F9F8FC]/5'}`}>
        <div className={isActive ? 'text-[#F9F8FC]' : 'text-[#89898D]'}>
          {getIconComponent()}
        </div>
      </div>
      {label && (
        <span className={`text-16 font-bold text-[#838286] ${isActive ? 'text-[#F9F8FC]' : ''}`}>
          {label}
        </span>
      )}
    </Link>
  );
}