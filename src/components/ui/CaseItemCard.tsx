'use client';

import React from 'react';
// Заменено на обычный img тег
import { CaseItem } from '@/hooks/useCasesAPI';
import { handleItemImageError, getItemImageUrl } from '@/utils/imageUtils';

// Интерфейс пропсов компонента
interface CaseItemCardProps {
  item: CaseItem;
  className?: string;
  onClick?: () => void;
  hideChance?: boolean; // Скрыть отображение шанса выпадения
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
 * Компонент карточки предмета кейса
 */
export default function CaseItemCard({ 
  item, 
  className = '',
  onClick,
  hideChance = false
}: CaseItemCardProps) {
  const config = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig.Common;
  
  // Используем цену предмета из API
  const itemValue = item.price;

  // Стили карточки - адаптивные для мобильных
  const cardStyles = {
    display: 'flex',
    width: 'clamp(64px, 80px, 80px)', // Немного меньше на очень маленьких экранах
    height: hideChance ? 'clamp(85px, 100px, 100px)' : 'clamp(105px, 122px, 122px)',
    padding: '6px',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '8px',
    flexDirection: 'column' as const,
    justifyContent: hideChance ? 'center' : 'space-between' as const
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
      className={`relative ${className} ${onClick ? 'cursor-pointer hover:brightness-75 transition-all duration-200 group' : ''}`}
      style={{
        background: config.background,
        border: config.border,
        ...cardStyles
      }}
      onClick={onClick}
    >
      {/* Иконка лупы при наведении на всю карточку */}
      {onClick && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg bg-black/20 z-10">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-white/80 drop-shadow-lg"
          >
            <path 
              d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      {hideChance ? (
        // Версия без шанса - только иконка и цена
        <>
          {/* Иконка предмета */}
          <div className="relative w-12 h-12 flex items-center justify-center mb-2">
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

          {/* Цена */}
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
              АР
            </span>
          </div>
        </>
      ) : (
        // Обычная версия с шансом
        <>
          {/* Верхняя часть - процент шанса */}
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

          {/* Нижняя часть - цена */}
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
              АР
            </span>
          </div>
        </>
      )}
    </div>
  );
}