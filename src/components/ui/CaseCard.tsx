'use client';

import React from 'react';
import Image from 'next/image';
import { CaseData } from '@/hooks/useCasesAPI';

interface CaseCardProps {
  case: CaseData;
  onClick?: (caseData: CaseData) => void;
}

/**
 * Компонент карточки кейса с адаптивным дизайном
 */
export default function CaseCard({ case: caseData, onClick }: CaseCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(caseData);
    }
  };

  // Функция для определения размера шрифта в зависимости от длины текста
  const getTextSizeClass = (text: string) => {
    const length = text.length;
    if (length <= 15) {
      return 'text-lg sm:text-xl md:text-2xl'; // Большой текст для коротких названий
    } else if (length <= 25) {
      return 'text-base sm:text-lg md:text-xl'; // Средний текст
    } else if (length <= 35) {
      return 'text-sm sm:text-base md:text-lg'; // Маленький текст
    } else {
      return 'text-xs sm:text-sm md:text-base'; // Очень маленький текст для длинных названий
    }
  };

  return (
    <div className='relative flex flex-col items-center gap-2 flex-1 p-3 rounded-xl bg-[#151519] hover:bg-[#1a1a1e] transition-all duration-300 cursor-pointer group overflow-hidden' onClick={handleClick}>
      {/* Название кейса с отступами и адаптивным размером */}
      <div className='w-full px-2 min-h-[3rem] flex items-center'>
        <p className={`text-center text-[#F9F8FC] font-actay font-bold line-clamp-2 leading-tight w-full ${getTextSizeClass(caseData.name)}`}>
          {caseData.name}
        </p>
      </div>
      
      {/* Цена в AP */}
      <div className='flex px-3 sm:px-4 py-1.5 sm:py-2 justify-center items-center gap-2 sm:gap-2.5 rounded-[100px] bg-[#6563EE]/10'>
        <span className='text-[#5C5ADC] font-actay text-xs sm:text-sm font-bold'>{caseData.price}</span>
        <span className='text-[#5C5ADC] font-actay text-xs sm:text-sm font-bold'>АР</span>
      </div>
      
      {/* Изображение кейса */}
      <div className='flex-1 flex items-center justify-center w-full min-h-0'>
        {caseData.imageUrl ? (
          <Image 
            src={caseData.imageUrl} 
            alt={caseData.name} 
            width={150} 
            height={150} 
            className="object-contain w-full h-full max-w-[100px] max-h-[100px] sm:max-w-[120px] sm:max-h-[120px] md:max-w-[140px] md:max-h-[140px] group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full max-w-[100px] max-h-[100px] sm:max-w-[120px] sm:max-h-[120px] md:max-w-[140px] md:max-h-[140px] flex items-center justify-center bg-gradient-to-br from-[#2A2A3A] to-[#1A1A24] rounded-lg">
            <div className="flex flex-col items-center justify-center text-[#5C5ADC]">
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="mb-1 sm:w-12 sm:h-12"
              >
                <path 
                  d="M3 10V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V10M3 10V8C3 6.89543 3.89543 6 5 6H19C20.1046 6 21 6.89543 21 8V10M3 10H21M12 14V16" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs opacity-60">Изображение</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Кнопка открыть */}
      <div className='w-full'>
        <div className='flex px-4 py-2 justify-center items-center gap-2.5 rounded-lg bg-[#5C5ADC] hover:bg-[#4947b3] transition-colors duration-300 group-hover:shadow-lg group-hover:shadow-[#5C5ADC]/20'>
          <p className='text-[#F9F8FC] font-unbounded text-xs sm:text-sm font-medium'>Открыть</p>
        </div>
      </div>
      
      {/* Эффект свечения при наведении */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-[#5C5ADC]/0 via-[#5C5ADC]/5 to-[#5C5ADC]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}