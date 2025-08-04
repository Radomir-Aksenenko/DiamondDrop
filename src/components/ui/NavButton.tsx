'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Импортируем SVG-иконки как React-компоненты
import AboutIcon from '../icons/AboutIcon';
import CaseIcon from '../icons/CaseIcon';
import UpdateIcon from '../icons/UpdateIcon';

interface NavButtonProps {
  icon: 'About' | 'Case' | 'Update'; // Название иконки
  href?: string; // Путь для навигации (опциональный)
  label?: string; // Опциональная подпись (если нужна)
  onClick?: () => void; // Опциональный обработчик клика
}

/**
 * Компонент кнопки навигации для хедера
 * @param icon - Название иконки ('About', 'Case', 'Update')
 * @param href - Путь для навигации (опциональный)
 * @param label - Опциональная подпись
 * @param onClick - Опциональный обработчик клика
 */
export default function NavButton({ icon, href, label, onClick }: NavButtonProps) {
  const pathname = usePathname();
  const isActive = href ? pathname === href : false;
  
  // Функция для выбора нужного SVG-компонента
  const getIconComponent = () => {
    switch (icon) {
      case 'About':
        return <AboutIcon className="w-[14px] h-[12px]" />;
      case 'Case':
        return <CaseIcon className="w-[14px] h-[12px]" />;
      case 'Update':
        return <UpdateIcon className="w-[14px] h-[12px]" />;
      default:
        return null;
    }
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const content = (
    <div
      className={`inline-flex items-center gap-2 p-2 rounded-full transition-all duration-300 ease-out ${
        isActive 
          ? 'text-[#F9F8FC] bg-[#19191D]' 
          : 'text-[#F9F8FC]/70 hover:text-[#F9F8FC] hover:bg-[#19191D]'
      }`}
    >
      <div 
        className={`flex flex-col justify-center items-center w-[30px] h-[30px] gap-[10px] aspect-square rounded-[42px] transition-all duration-300 ease-out ${
          isActive 
            ? 'bg-[#5C5ADC]' 
            : 'bg-[#F9F8FC]/5'
        }`}
      >
        <div 
          className={`transition-colors duration-300 ease-out ${isActive ? 'text-[#F9F8FC]' : 'text-[#89898D]'}`}
        >
          {getIconComponent()}
        </div>
      </div>
      
      {label && (
        <span 
          className={`flex items-center text-base font-bold pr-1 transition-all duration-300 ease-out ${
            isActive ? 'text-[#F9F8FC]' : 'text-[#838286]'
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <div onClick={handleClick} className="inline-block cursor-pointer transition-all duration-300 ease-out">
        {content}
      </div>
    );
  }

  return (
    <Link href={href || '#'} className="inline-block cursor-pointer transition-all duration-300 ease-out">
      {content}
    </Link>
  );
}