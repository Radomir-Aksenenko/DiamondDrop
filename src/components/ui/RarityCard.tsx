'use client';

import React from 'react';
import Image from 'next/image';

// Типы редкости карточек
export type RarityType = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

// Интерфейс пропсов карточки
interface RarityCardProps {
  rarity: RarityType;
  percentage: string;
  itemImage: string;
  itemName?: string;
  apValue: number;
  className?: string;
}

// Конфигурация цветов и стилей для каждого типа редкости
const rarityConfig = {
  Common: {
    background: 'radial-gradient(174.65% 116.67% at 50% 52.63%, rgba(156, 163, 175, 0.00) 0%, rgba(107, 114, 128, 0.20) 100%)',
    textColor: 'text-gray-300'
  },
  Uncommon: {
    background: 'radial-gradient(174.65% 116.67% at 50% 52.63%, rgba(34, 197, 94, 0.00) 0%, rgba(22, 163, 74, 0.20) 100%)',
    textColor: 'text-green-300'
  },
  Rare: {
    background: 'radial-gradient(174.65% 116.67% at 50% 52.63%, rgba(59, 130, 246, 0.00) 0%, rgba(37, 99, 235, 0.20) 100%)',
    textColor: 'text-blue-300'
  },
  Epic: {
    background: 'radial-gradient(174.65% 116.67% at 50% 52.63%, rgba(119, 110, 239, 0.00) 0%, rgba(89, 78, 235, 0.20) 100%)',
    textColor: 'text-purple-300'
  },
  Legendary: {
    background: 'radial-gradient(174.65% 116.67% at 50% 52.63%, rgba(251, 191, 36, 0.00) 0%, rgba(245, 158, 11, 0.20) 100%)',
    textColor: 'text-yellow-300'
  }
};

export default function RarityCard({ 
  rarity, 
  percentage, 
  itemImage, 
  itemName, 
  apValue, 
  className = '' 
}: RarityCardProps) {
  const config = rarityConfig[rarity];

  return (
    <div 
      className={`
        inline-flex p-2 flex-col items-center gap-1 rounded-lg
        transition-all duration-300 hover:scale-105
        ${className}
      `}
      style={{
        background: config.background
      }}
    >
      {/* Процент в верхней части */}
      <div className="w-full text-center">
        <span className="text-white text-sm font-bold">
          {percentage}
        </span>
      </div>

      {/* Изображение предмета */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <Image
          src={itemImage}
          alt={itemName || `${rarity} предмет`}
          fill
          style={{ objectFit: 'contain' }}
          className="drop-shadow-lg"
        />
      </div>

      {/* Количество */}
      <div className="text-center">
        <span className="text-white text-xs">x1</span>
      </div>

      {/* AP значение */}
      <div className="text-center">
        <span className={`text-xs font-bold ${config.textColor}`}>
          {apValue} AP
        </span>
      </div>
    </div>
  );
}