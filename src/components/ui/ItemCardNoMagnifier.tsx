import React from 'react';
import { CaseItem } from '@/hooks/useCasesAPI';
import { getItemImageUrl, handleItemImageError } from '@/utils/imageUtils';

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

interface ItemCardNoMagnifierProps {
  item: CaseItem;
  amount: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Компонент карточки предмета без лупы для страницы апгрейда
 */
export function ItemCardNoMagnifier({ 
  item, 
  amount,
  className = '',
  onClick
}: ItemCardNoMagnifierProps) {
  const config = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig.Common;

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

  return (
    <div 
      className={`relative group cursor-pointer hover:brightness-110 transition-all duration-200 ${className}`}
      style={{
        background: config.background,
        border: config.border,
        ...cardStyles,
        flexDirection: 'column',
        height: '76px',
        justifyContent: 'space-between'
      }}
      onClick={onClick}
    >
      {/* Верхняя часть - цена и количество штук */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Цена */}
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
            {formatPrice(item.price)}
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
        
        {/* Количество штук */}
        <span 
          style={{
            color: 'rgba(249, 248, 252, 0.50)',
            textAlign: 'center',
            fontFamily: 'Actay Wide',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: 'normal'
          }}
        >
          {amount} шт.
        </span>
      </div>

      {/* Центральная часть - изображение предмета */}
      <div className="relative flex items-center justify-center">
        <img
          src={getItemImageUrl(item.imageUrl)}
          alt={item.name}
          className={`${imageSize} object-contain drop-shadow-lg`}
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

      {/* Нижняя часть - название предмета */}
      <div className="text-center">
        <span 
          style={{
            color: 'rgba(249, 248, 252, 0.50)',
            textAlign: 'center',
            fontFamily: 'Actay Wide',
            fontSize: '10px',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: 'normal',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {item.name}
        </span>
      </div>
    </div>
  );
}