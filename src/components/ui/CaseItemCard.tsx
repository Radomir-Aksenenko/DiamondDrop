'use client';

import React from 'react';
import Image from 'next/image';
import { CaseItem } from '@/hooks/useCasesAPI';

// Интерфейс пропсов компонента
interface CaseItemCardProps {
  item: CaseItem;
  casePrice: number; // Цена кейса для расчета стоимости предмета
  className?: string;
}

// Конфигурация цветов и стилей для каждого типа редкости
const rarityConfig = {
  Common: {
    background: 'rgba(249, 248, 252, 0.05)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
    textColor: 'text-gray-300'
  },
  Uncommon: {
    background: 'rgba(249, 248, 252, 0.05)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
    textColor: 'text-gray-300'
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

/**
 * Компонент карточки предмета кейса
 */
export default function CaseItemCard({ 
  item, 
  casePrice, 
  className = '' 
}: CaseItemCardProps) {
  const config = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig.Common;
  
  // Используем цену предмета из API
  const itemValue = item.price;

  // Стили карточки
  const cardStyles = {
    display: 'flex',
    width: '80px',
    height: '122px',
    padding: '8px',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '8px',
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const
  };

  // Форматируем процент шанса
  const formatChance = (chance: number): string => {
    if (chance >= 10) {
      return `${chance.toFixed(1)}%`;
    } else if (chance >= 1) {
      return `${chance.toFixed(2)}%`;
    } else {
      return `${chance.toFixed(3)}%`;
    }
  };

  // Форматируем стоимость
  const formatPrice = (price: number): string => {
    return price % 1 === 0 ? price.toString() : price.toFixed(1);
  };

  return (
    <div 
      className={className}
      style={{
        background: config.background,
        border: config.border,
        ...cardStyles
      }}
    >
      {/* Верхняя часть - только процент шанса */}
      <div className="flex items-center justify-center text-center">
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
          {formatChance(item.percentChance)}
        </span>
      </div>

      {/* Средняя часть - иконка предмета */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <Image
          src={item.imageUrl || '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png'}
          alt={item.name}
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
            x{item.amount}
          </span>
        </div>
      </div>

      {/* Нижняя часть - цена после иконки */}
      <div className="flex items-baseline justify-center">
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
          {formatPrice(itemValue)}
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
  );
}