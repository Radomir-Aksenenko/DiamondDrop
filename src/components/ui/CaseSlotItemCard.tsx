'use client';

import React from 'react';
// Убран импорт Image из next/image - заменен на обычные img теги
import { CaseItem } from '@/hooks/useCasesAPI';
import { handleItemImageError, getItemImageUrl } from '@/utils/imageUtils';

// Интерфейс пропсов компонента
interface CaseSlotItemCardProps {
  item: CaseItem;
  className?: string;
  compact?: boolean; // Для уменьшения размера на мобильных или при множественном открытии
}

// Конфигурация цветов и стилей для каждого типа редкости
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

/**
 * Компонент карточки предмета для слотов кейса (без процента выигрыша)
 */
export default function CaseSlotItemCard({
  item,
  className = '',
  compact = false
}: CaseSlotItemCardProps) {
  const config = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig.Common;

  // Используем цену предмета из API
  const itemValue = item.price;

  // Стили карточки - адаптивные размеры
  const cardStyles = {
    display: 'flex',
    width: compact ? '56px' : '76px',
    height: compact ? '74px' : '100px',
    padding: compact ? '6px' : '8px',
    alignItems: 'center',
    gap: compact ? '4px' : '6px',
    borderRadius: '8px',
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const
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
      {/* Верхняя часть - иконка предмета */}
      <div className={`relative flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-12 h-12'}`}>
        <img
          src={getItemImageUrl(item.imageUrl)}
          alt={item.name}
          className="w-full h-full object-contain drop-shadow-lg"
          onError={handleItemImageError}
        />
        {/* Количество поверх изображения */}
        <div className="absolute -bottom-1 -right-1">
          <span
            style={{
              color: '#F9F8FC',
              fontFamily: 'Actay Wide',
              fontSize: compact ? '12px' : '16px',
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

      {/* Нижняя часть - цена */}
      <div className="flex items-baseline justify-center">
        <span
          style={{
            color: '#F9F8FC',
            textAlign: 'center',
            fontFamily: 'Actay Wide',
            fontSize: compact ? '12px' : '16px',
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
            fontSize: compact ? '9px' : '12px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: 'normal',
            marginLeft: '2px'
          }}
        >
          АР
        </span>
      </div>
    </div>
  );
}