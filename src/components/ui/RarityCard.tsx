'use client';

import React from 'react';
import Image from 'next/image';

// Типы редкости карточек
export type RarityType = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

// Типы ориентации карточки
export type OrientationType = 'vertical' | 'horizontal';

// Интерфейс пропсов карточки
interface RarityCardProps {
  rarity: RarityType;
  percentage: string;
  itemImage: string;
  itemName?: string;
  apValue: number;
  amount?: number;
  orientation?: OrientationType;
  className?: string;
}

// Конфигурация цветов и стилей для каждого типа редкости с новыми градиентами
const rarityConfig = {
  Common: {
    background: 'rgba(249, 248, 252, 0.05)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
    textColor: 'text-gray-300'
  },
  Uncommon: {
    background: 'radial-gradient(174.65% 116.67% at 50% 52.63%, rgba(119, 110, 239, 0.00) 0%, rgba(89, 78, 235, 0.20) 100%)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
    textColor: 'text-purple-300'
  },
  Rare: {
    background: 'radial-gradient(181.89% 122.27% at 50% 52.63%, rgba(178, 255, 158, 0.00) 0%, rgba(71, 173, 45, 0.30) 100%)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
    textColor: 'text-green-300'
  },
  Epic: {
    background: 'radial-gradient(166.28% 111.64% at 50% 52.63%, rgba(203, 50, 209, 0.00) 0%, rgba(172, 33, 146, 0.60) 100%)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
    textColor: 'text-purple-300'
  },
  Legendary: {
    background: 'radial-gradient(202.89% 144.9% at 50% 52.63%, rgba(255, 219, 18, 0.00) 0%, rgba(255, 183, 50, 0.80) 100%)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
    textColor: 'text-yellow-300'
  }
};

export default function RarityCard({ 
  rarity, 
  percentage, 
  itemImage, 
  itemName, 
  apValue, 
  amount = 1,
  orientation = 'vertical',
  className = '' 
}: RarityCardProps) {
  const config = rarityConfig[rarity];
  const isHorizontal = orientation === 'horizontal';

  // Единые стили для всех карт согласно требованиям
  const cardStyles = {
    display: 'flex',
    width: '138px',
    padding: '8px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '8px'
  };

  const imageSize = 'w-12 h-12'; // 48px для всех ориентаций

  // Форматируем стоимость с дробными значениями
  const formatPrice = (price: number): string => {
    return price % 1 === 0 ? price.toString() : price.toFixed(1);
  };

  if (isHorizontal) {
    return (
      <div 
        className={className}
        style={{
          background: config.background,
          border: config.border,
          ...cardStyles,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        {/* Левая часть - иконка предмета */}
        <div className={`relative ${imageSize} flex items-center justify-center flex-shrink-0`}>
          <Image
            src={itemImage}
            alt={itemName || `${rarity} предмет`}
            fill
            style={{ objectFit: 'contain' }}
            className="drop-shadow-lg"
          />
          {/* Количество поверх изображения */}
          <div className="absolute -bottom-1 -right-1">
            <span 
              style={{
                color: '#F9F8FC',
                fontFamily: 'Actay Wide',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: 'normal',
                opacity: 0.5
              }}
            >
              x{amount}
            </span>
          </div>
        </div>

        {/* Правая часть - процент и стоимость */}
        <div className="flex flex-col items-end justify-center flex-1">
          {/* Процент */}
          <span 
            style={{
              color: '#F9F8FC',
              fontFamily: 'Actay Wide',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal',
              opacity: 0.5
            }}
          >
            {percentage}
          </span>
          {/* Стоимость */}
          <div className="flex items-baseline">
            <span 
              style={{
                color: '#F9F8FC',
                textAlign: 'center',
                fontFamily: 'Actay Wide',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: 'normal'
              }}
            >
              {formatPrice(apValue)}
            </span>
            <span 
              style={{
                color: 'rgba(249, 248, 252, 0.50)',
                fontFamily: 'Actay Wide',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: 'normal',
                marginLeft: '2px'
              }}
            >
              AP
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Вертикальная ориентация (по умолчанию)
  return (
    <div 
      className={className}
      style={{
        background: config.background,
        border: config.border,
        ...cardStyles,
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Верхняя часть - процент и стоимость */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Процент */}
        <span 
          style={{
            color: '#F9F8FC',
            fontFamily: 'Actay Wide',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: 'normal',
            opacity: 0.5
          }}
        >
          {percentage}
        </span>
        {/* Стоимость */}
        <div className="flex items-baseline">
          <span 
            style={{
              color: '#F9F8FC',
              textAlign: 'center',
              fontFamily: 'Actay Wide',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal'
            }}
          >
            {formatPrice(apValue)}
          </span>
          <span 
            style={{
              color: 'rgba(249, 248, 252, 0.50)',
              fontFamily: 'Actay Wide',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal',
              marginLeft: '2px'
            }}
          >
            AP
          </span>
        </div>
      </div>

      {/* Нижняя часть - иконка предмета */}
      <div className={`relative ${imageSize} flex items-center justify-center`}>
        <Image
          src={itemImage}
          alt={itemName || `${rarity} предмет`}
          fill
          style={{ objectFit: 'contain' }}
          className="drop-shadow-lg"
        />
        {/* Количество поверх изображения */}
        <div className="absolute -bottom-1 -right-1">
          <span 
            style={{
              color: '#F9F8FC',
              fontFamily: 'Actay Wide',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal',
              opacity: 0.5
            }}
          >
            x{amount}
          </span>
        </div>
      </div>
    </div>
  );
}