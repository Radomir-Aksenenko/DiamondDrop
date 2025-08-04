'use client';

import React from 'react';
import Modal from './Modal';
import { CaseItem } from '@/hooks/useCasesAPI';
import CaseItemCard from './CaseItemCard';

interface ItemDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CaseItem | null;
}

// Конфигурация цветов для редкости
const rarityColors = {
  Common: '#9CA3AF',
  Uncommon: '#8B5CF6', 
  Rare: '#11AB47',
  Epic: '#A855F7',
  Legendary: '#F59E0B'
};

/**
 * Модальное окно описания предмета
 */
export default function ItemDescriptionModal({ isOpen, onClose, item }: ItemDescriptionModalProps) {
  if (!item) return null;

  const rarityColor = rarityColors[item.rarity as keyof typeof rarityColors] || rarityColors.Common;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Описание">
      <div className="flex flex-col gap-6">
        {/* Основной контент модалки */}
        <div className="flex p-4 items-start gap-4 self-stretch rounded-lg bg-[#F9F8FC]/5">
          {/* Карточка предмета */}
          <div className="flex-shrink-0">
            <CaseItemCard 
              item={item}
              className="w-[76px] h-[100px]"
            />
          </div>
          
          {/* Информация о предмете */}
          <div className='flex flex-col py-2 justify-center items-start gap-1 flex-1 self-stretch'>
            {/* Редкость */}
            <p 
              className='text-16 font-bold'
              style={{ color: rarityColor }}
            >
              {item.rarity === 'Common' && 'Обычный'}
              {item.rarity === 'Uncommon' && 'Необычный'}
              {item.rarity === 'Rare' && 'Редкий'}
              {item.rarity === 'Epic' && 'Эпический'}
              {item.rarity === 'Legendary' && 'Легендарный'}
            </p>
            
            {/* Название предмета */}
            <p className='self-stretch text-[#F9F8FC] text-20 font-bold'>
              {item.name}
            </p>
            
            {/* Описание предмета */}
            <p className='self-stretch text-[#F9F8FC] text-16 font-bold opacity-50'>
              {item.description || 'Описание отсутствует'}
            </p>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button 
            onClick={onClose}
            className="bg-[#19191D] hover:bg-[#1E1E23] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
          >
            Закрыть
          </button>
          <button 
            onClick={onClose}
            className="bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
          >
            Учту
          </button>
        </div>
      </div>
    </Modal>
  );
}