'use client';

import React from 'react';

interface DeliveryLoaderProps {
  count?: number;
}

export default function DeliveryLoader({ count = 3 }: DeliveryLoaderProps): React.JSX.Element {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(249,248,252,0.03)] animate-pulse">
          {/* Иконка предмета */}
          <div className="w-12 h-12 rounded-lg bg-[rgba(249,248,252,0.1)]" />
          
          {/* Информация о заказе */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Название предмета */}
            <div className="h-4 bg-[rgba(249,248,252,0.1)] rounded w-3/4" />
            
            {/* Статус и филиал */}
            <div className="flex items-center gap-2">
              <div className="h-3 bg-[rgba(249,248,252,0.1)] rounded w-16" />
              <div className="h-3 bg-[rgba(249,248,252,0.1)] rounded w-20" />
            </div>
          </div>
          
          {/* Количество */}
          <div className="h-6 w-8 bg-[rgba(249,248,252,0.1)] rounded" />
        </div>
      ))}
    </>
  );
}

// Компонент для отображения загрузчика в виде кружочков
export function DeliveryCircleLoader(): React.JSX.Element {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="w-3 h-3 bg-[#5C5ADC] rounded-full animate-bounce"
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
}