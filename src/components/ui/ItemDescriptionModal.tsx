'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
      <motion.div 
        className="flex flex-col gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Основной контент модалки */}
        <motion.div 
          className="flex p-4 items-start gap-4 self-stretch rounded-lg bg-[#F9F8FC]/5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: 0.15 }}
         >
           {/* Карточка предмета */}
           <motion.div 
             className="flex-shrink-0"
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.3, delay: 0.2 }}
           >
             <CaseItemCard 
               item={item}
               className="w-[76px] h-[100px]"
               hideChance={true}
             />
           </motion.div>
           
           {/* Информация о предмете */}
           <motion.div 
             className='flex flex-col py-2 justify-center items-start gap-1 flex-1 self-stretch'
             initial={{ opacity: 0, x: 10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.3, delay: 0.25 }}
           >
             {/* Редкость */}
             <motion.p 
               className='text-16 font-bold'
               style={{ color: rarityColor }}
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.2, delay: 0.3 }}
             >
               {item.rarity === 'Common' && 'Обычный'}
               {item.rarity === 'Uncommon' && 'Необычный'}
               {item.rarity === 'Rare' && 'Редкий'}
               {item.rarity === 'Epic' && 'Эпический'}
               {item.rarity === 'Legendary' && 'Легендарный'}
             </motion.p>
             
             {/* Название предмета */}
             <motion.p 
               className='self-stretch text-[#F9F8FC] text-20 font-bold'
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.2, delay: 0.35 }}
             >
               {item.name}
             </motion.p>
             
             {/* Описание предмета */}
             <motion.p 
               className='self-stretch text-[#F9F8FC] text-16 font-bold opacity-50'
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 0.5, y: 0 }}
               transition={{ duration: 0.2, delay: 0.4 }}
             >
               {item.description || 'Описание отсутствует'}
             </motion.p>
           </motion.div>
         </motion.div>
         
         {/* Кнопки действий */}
         <motion.div 
           className="grid grid-cols-2 gap-3 mt-4"
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.25, delay: 0.45 }}
        >
          <motion.button 
             onClick={onClose}
             className="bg-[#19191D] hover:bg-[#1E1E23] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
             initial={{ opacity: 0, y: 5 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.2, delay: 0.5 }}
           >
             Закрыть
           </motion.button>
           <motion.button 
             onClick={onClose}
             className="bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
             initial={{ opacity: 0, y: 5 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.2, delay: 0.55 }}
           >
             Учту
           </motion.button>
        </motion.div>
      </motion.div>
    </Modal>
  );
}