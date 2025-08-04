'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CaseItem } from '@/hooks/useCasesAPI';

// Интерфейс пропсов компонента
interface CaseSlotItemCardProps {
  item: CaseItem;
  className?: string;
  isWinning?: boolean; // Новый пропс для определения выигрышного предмета
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
 * Компонент карточки предмета для слотов кейса (без процента выигрыша)
 */
export default function CaseSlotItemCard({ 
  item, 
  className = '',
  isWinning = false
}: CaseSlotItemCardProps) {
  const config = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig.Common;
  
  // Используем цену предмета из API
  const itemValue = item.price;

  // Стили карточки
  const cardStyles = {
    display: 'flex',
    width: '76px',
    height: '100px',
    padding: '8px',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '8px',
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const
  };

  // Форматируем стоимость
  const formatPrice = (price: number): string => {
    return price % 1 === 0 ? price.toString() : price.toFixed(1);
  };

  return (
    <motion.div 
      className={className}
      style={{
        background: config.background,
        border: config.border,
        ...cardStyles
      }}
      animate={isWinning ? {
        scale: [1, 1.3, 1.2],
        boxShadow: [
          '0 0 0 rgba(92, 90, 220, 0)',
          '0 0 30px rgba(92, 90, 220, 0.8)',
          '0 0 20px rgba(92, 90, 220, 0.6)'
        ]
      } : {}}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay: isWinning ? 0.3 : 0
      }}
    >
      {/* Верхняя часть - иконка предмета */}
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
          AP
        </span>
      </div>
    </motion.div>
  );
}