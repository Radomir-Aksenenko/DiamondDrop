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
  common: {
    background: 'rgba(249, 248, 252, 0.05)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
    textColor: 'text-gray-300'
  },
  rare: {
    background: 'radial-gradient(181.89% 122.27% at 50% 52.63%, rgba(178, 255, 158, 0.00) 0%, rgba(71, 173, 45, 0.30) 100%)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
    textColor: 'text-green-300'
  },
  epic: {
    background: 'radial-gradient(166.28% 111.64% at 50% 52.63%, rgba(203, 50, 209, 0.00) 0%, rgba(172, 33, 146, 0.60) 100%)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
    textColor: 'text-purple-300'
  },
  legendary: {
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
  const config = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig.common;
  
  // Рассчитываем стоимость предмета на основе шанса выпадения и цены кейса
  const itemValue = Math.round((casePrice * item.chance) / 100);

  // Стили карточки
  const cardStyles = {
    display: 'flex',
    width: '138px',
    height: '138px',
    padding: '8px',
    alignItems: 'center',
    gap: '8px',
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
      {/* Верхняя часть - процент шанса и стоимость */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Процент шанса */}
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
          {formatChance(item.chance)}
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

      {/* Нижняя часть - иконка предмета */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <Image
          src={item.imageUrl || '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png'}
          alt={item.name}
          fill
          style={{ objectFit: 'contain' }}
          className="drop-shadow-lg"
        />
        {/* Количество поверх изображения (всегда x1 для предметов кейса) */}
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
            x1
          </span>
        </div>
      </div>
    </div>
  );
}