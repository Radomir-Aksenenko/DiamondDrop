'use client';

import React from 'react';
import { CaseItem } from '@/hooks/useCasesAPI';
import { handleItemImageError, getItemImageUrl } from '@/utils/imageUtils';
// Заменено на обычный img тег

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

// Интерфейс пропсов для ItemCard
interface ItemCardProps {
  item: CaseItem;
  amount: number; // Количество штук, которое выпадает за раз
  orientation?: OrientationType;
  className?: string;
  onClick?: () => void;
  hoverIcon?: 'plus' | 'magnifier'; // Тип иконки при наведении
  fullWidth?: boolean; // Растягивать по ширине контейнера (для апгрейда)
  showPercentage?: boolean; // Показывать проценты вместо количества штук
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
    width: isHorizontal ? '138px' : '138px',
    ...(isHorizontal ? { height: '76px' } : {}),
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
          <img
            src={itemImage}
            alt={itemName || `${rarity} предмет`}
            className="w-full h-full object-contain drop-shadow-lg"
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
            АР
          </span>
        </div>
      </div>

      {/* Нижняя часть - иконка предмета */}
      <div className={`relative ${imageSize} flex items-center justify-center`}>
        <img
          src={itemImage}
          alt={itemName || `${rarity} предмет`}
          className="w-full h-full object-contain drop-shadow-lg"
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

// Новый компонент ItemCard на основе архитектуры RarityCard
export function ItemCard({ 
  item, 
  amount,
  orientation = 'horizontal',
  className = '',
  onClick,
  hoverIcon = 'plus',
  fullWidth = false,
  showPercentage = false
}: ItemCardProps) {
  const config = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig.Common;
  const isHorizontal = orientation === 'horizontal';

  // Единые стили для всех карт согласно требованиям
  const cardStyles = {
    display: 'flex',
    width: isHorizontal ? (fullWidth ? '100%' : '138px') : '138px',
    ...(isHorizontal ? { height: '76px' } : {}),
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
        className={`relative ${className} ${onClick ? 'group cursor-pointer hover:brightness-110 transition-all duration-200' : ''}`}
        style={{
          background: config.background,
          border: config.border,
          ...cardStyles,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
        onClick={onClick}
      >
        {/* Иконка при наведении на всю карточку */}
        {onClick && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg z-10"
            style={fullWidth ? {
              background: 'rgba(13, 13, 17, 0.70)',
              backdropFilter: 'blur(2px)'
            } : {
              background: 'rgba(0, 0, 0, 0.5)'
            }}
          >
            {hoverIcon === 'plus' ? (
              <div className="w-8 h-8 bg-[#5C5ADC] rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            ) : (
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
            )}
          </div>
        )}
        
        {/* Левая часть - иконка предмета */}
        <div className={`relative ${imageSize} flex items-center justify-center flex-shrink-0`}>
          <img
            src={getItemImageUrl(item.imageUrl)}
            alt={item.name}
            className="w-full h-full object-contain drop-shadow-lg"
            onError={handleItemImageError}
          />
          
          {/* Количество единиц в предмете поверх изображения */}
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

        {/* Правая часть - цена и количество штук */}
        <div className="flex flex-col items-end justify-center flex-1">
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
          {/* Количество штук или проценты */}
          <div className="flex items-baseline">
            <span 
              style={{
                color: '#F9F8FC',
                fontFamily: 'Actay Wide',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: 'normal'
              }}
            >
              {showPercentage ? `${amount}%` : amount}
            </span>
            {!showPercentage && (
              <span 
                style={{
                  color: 'rgba(249, 248, 252, 0.50)',
                  fontFamily: 'Actay Wide',
                  fontSize: '12px',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: 'normal',
                  marginLeft: '4px'
                }}
              >
                ШТ.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Вертикальная ориентация
  return (
    <div 
      className={`relative ${className} ${onClick ? 'group cursor-pointer hover:brightness-110 transition-all duration-200' : ''}`}
      style={{
        background: config.background,
        border: config.border,
        ...cardStyles,
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onClick={onClick}
    >
      {/* Иконка при наведении на всю карточку */}
       {onClick && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg bg-black/20 z-10">
            {hoverIcon === 'plus' ? (
              <div className="w-8 h-8 bg-[#5C5ADC] rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            ) : (
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
            )}
        </div>
      )}
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
        <div className="flex items-baseline">
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
            {amount} ШТ.
          </span>
        </div>
      </div>

      {/* Нижняя часть - иконка предмета */}
      <div className={`relative ${imageSize} flex items-center justify-center`}>
        <img
          src={getItemImageUrl(item.imageUrl)}
          alt={item.name}
          className="w-full h-full object-contain drop-shadow-lg"
          onError={handleItemImageError}
        />
        {/* Количество единиц в предмете поверх изображения */}
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
    </div>
  );
}