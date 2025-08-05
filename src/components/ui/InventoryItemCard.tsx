import React from 'react';
import { motion } from 'framer-motion';
import { InventoryItem } from '@/hooks/useInventoryAPI';
import { CaseItem } from '@/hooks/useCasesAPI';
import CaseItemCard from './CaseItemCard';

interface InventoryItemCardProps {
  inventoryItem: InventoryItem;
  index: number;
  onSellClick?: (item: InventoryItem) => void;
  onWithdrawClick?: (item: InventoryItem) => void;
  onItemClick?: (item: InventoryItem) => void;
}

export default function InventoryItemCard({ inventoryItem, index, onSellClick, onWithdrawClick, onItemClick }: InventoryItemCardProps) {
  const { item, amount } = inventoryItem;
  
  // Преобразуем InventoryItem в CaseItem для использования в CaseItemCard
  // Используем item.amount для отображения количества предметов в одном стаке
  const caseItem: CaseItem = {
    id: item.id,
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl,
    amount: item.amount, // Количество предметов в одном стаке
    price: item.price,
    percentChance: item.percentChance,
    rarity: item.rarity
  };

  // Обработчик клика по предмету
  const handleItemClick = () => {
    onItemClick?.(inventoryItem);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className='relative flex p-4 items-start gap-4 rounded-xl bg-[#F9F8FC]/[0.05] hover:bg-[#F9F8FC]/[0.08] transition-all duration-300 group'
    >
      {/* Карточка предмета с использованием CaseItemCard */}
      <div className="flex-shrink-0">
        <CaseItemCard 
          item={caseItem}
          hideChance={true}
          className="w-[80px] h-[100px]"
          onClick={handleItemClick}
        />
      </div>
      
      {/* Информация о предмете */}
      <div className='flex flex-col items-start flex-1 self-stretch gap-1'>
        <div className='flex flex-col items-start self-stretch'>
          <h3 className='text-[#F9F8FC] font-actay-wide text-lg font-bold leading-tight'>
            {item.name}
          </h3>
          <p className='text-[#F9F8FC] font-actay-wide text-sm font-bold opacity-50 leading-tight'>
            {(() => {
              const description = item.description || 'Описание отсутствует';
              return description.length > 30 ? description.substring(0, 30) + '...' : description;
            })()}
          </p>
        </div>
        
        {/* Кнопки действий */}
        <div className='flex items-start gap-2 w-full mt-1'>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSellClick?.(inventoryItem)}
            className='flex flex-col justify-center items-center gap-2 px-4 py-2 rounded-lg bg-[#54A930] hover:bg-[#4A8A2A] transition-colors duration-200 cursor-pointer'
          >
            <span className='text-[#F9F8FC] font-unbounded text-sm font-medium'>Продать</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onWithdrawClick?.(inventoryItem)}
            className='flex flex-col justify-center items-center gap-2 px-4 py-2 rounded-lg bg-[#F9F8FC]/[0.10] hover:bg-[#F9F8FC]/[0.15] transition-colors duration-200 cursor-pointer'
          >
            <span className='text-[#F9F8FC] font-unbounded text-sm font-medium opacity-50 group-hover:opacity-70 transition-opacity duration-200'>
              Вывести
            </span>
          </motion.button>
        </div>
      </div>
      
      {/* Общее количество предметов в инвентаре */}
      <div className='absolute right-4 top-4'>
        <span className='text-[#F9F8FC] text-center font-actay-wide text-lg font-bold opacity-50'>
          x{amount}
        </span>
      </div>

    </motion.div>
  );
}