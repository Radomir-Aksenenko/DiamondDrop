'use client';

import React from 'react';
import { CaseData } from '@/hooks/useCasesAPI';

interface CaseCardProps {
  case: CaseData;
  onClick?: (caseData: CaseData) => void;
}

/**
 * Компонент карточки кейса
 */
export default function CaseCard({ case: caseData, onClick }: CaseCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(caseData);
    }
  };

  return (
    <div 
      className="bg-gradient-to-b from-[#1A1A24] to-[#0F0F16] rounded-2xl p-4 border border-[#2A2A3A] hover:border-[#5C5ADC] transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-lg hover:shadow-[#5C5ADC]/20"
      onClick={handleClick}
    >
      {/* Изображение кейса */}
      <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-[#2A2A3A] to-[#1A1A24] flex items-center justify-center">
        {caseData.imageUrl ? (
          <img 
            src={caseData.imageUrl} 
            alt={caseData.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          // Заглушка для изображения с иконкой сундука
          <div className="flex flex-col items-center justify-center text-[#5C5ADC] group-hover:scale-110 transition-transform duration-300">
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="mb-2"
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
            <span className="text-sm opacity-60">Изображение</span>
          </div>
        )}
        
        {/* Эффект свечения при наведении */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#5C5ADC]/0 to-[#5C5ADC]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Информация о кейсе */}
      <div className="space-y-3">
        {/* Название кейса */}
        <h3 className="text-white font-bold text-lg leading-tight group-hover:text-[#5C5ADC] transition-colors duration-300">
          {caseData.name}
        </h3>

        {/* Описание кейса */}
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
          {caseData.description}
        </p>

        {/* Цена и кнопка */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <span className="text-[#5C5ADC] font-bold text-xl">
              {caseData.price}
            </span>
            <span className="text-[#5C5ADC] text-sm font-medium">
              AP
            </span>
          </div>
          
          <button className="bg-[#5C5ADC] hover:bg-[#4A48C4] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm">
            Открыть
          </button>
        </div>
      </div>
    </div>
  );
}