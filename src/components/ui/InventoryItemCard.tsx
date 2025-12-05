import React from 'react';
import { motion } from 'framer-motion';
import { InventoryItem } from '@/hooks/useInventoryAPI';
import { CaseItem } from '@/hooks/useCasesAPI';
import CaseItemCard from './CaseItemCard';
import { useIsMobile } from '@/hooks/useIsMobile';
import { getItemImageUrl, handleItemImageError } from '@/utils/imageUtils';

interface InventoryItemCardProps {
  inventoryItem: InventoryItem;
  index: number;
  onSellClick?: (item: InventoryItem) => void;
  onWithdrawClick?: (item: InventoryItem) => void;
  onItemClick?: (item: InventoryItem) => void;
}

// Конфигурация цветов для каждого типа редкости
const rarityConfig = {
  Common: {
    background: 'rgba(249, 248, 252, 0.05)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
  },
  Uncommon: {
    background: 'radial-gradient(174.65% 116.67% at 50% 52.63%, rgba(119, 110, 239, 0.00) 0%, rgba(89, 78, 235, 0.20) 100%)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
  },
  Rare: {
    background: 'radial-gradient(181.89% 122.27% at 50% 52.63%, rgba(178, 255, 158, 0.00) 0%, rgba(71, 173, 45, 0.30) 100%)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
  },
  Epic: {
    background: 'radial-gradient(166.28% 111.64% at 50% 52.63%, rgba(203, 50, 209, 0.00) 0%, rgba(172, 33, 146, 0.60) 100%)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
  },
  Legendary: {
    background: 'radial-gradient(202.89% 144.9% at 50% 52.63%, rgba(255, 219, 18, 0.00) 0%, rgba(255, 183, 50, 0.80) 100%)',
    border: '1px solid rgba(249, 248, 252, 0.05)',
  }
};

export default function InventoryItemCard({ inventoryItem, index, onSellClick, onWithdrawClick, onItemClick }: InventoryItemCardProps) {
  const { item, amount } = inventoryItem;
  const { isMobile } = useIsMobile();
  const config = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig.Common;

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
    rarity: item.rarity,
    isWithdrawable: item.isWithdrawable
  };

  // Обработчик клика по предмету
  const handleItemClick = () => {
    onItemClick?.(inventoryItem);
  };

  // Форматируем цену (убираем .0)
  const formatPrice = (price: number): string => {
    return price % 1 === 0 ? price.toString() : price.toFixed(1);
  };

  // Мобильная версия - компактная вертикальная карточка
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className='relative group cursor-pointer hover:brightness-110 transition-all duration-200 rounded-lg p-2'
        style={{ background: config.background, border: config.border }}
        onClick={handleItemClick}
      >
        {/* Верх: иконка предмета */}
        <div className='relative flex items-center justify-center w-full h-[90px]'>
          <img
            src={getItemImageUrl(item.imageUrl)}
            alt={item.name}
            className='w-[70.5px] h-[70.5px] object-contain drop-shadow-lg'
            onError={handleItemImageError}
          />
          {/* Количество поверх изображения — показывать только если больше 1 */}
          {amount > 1 && (
            <div className='absolute -right-1 -top-1'>
              <span className='text-[#F9F8FC] font-actay-wide text-sm font-bold opacity-50'>
                x{amount}
              </span>
            </div>
          )}
        </div>

        {/* Название */}
        <div className='mt-2'>
          <h3 className='text-[#F9F8FC] font-actay-wide text-sm font-bold leading-tight overflow-hidden text-ellipsis line-clamp-1'
              style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 }}>
            {item.name}
          </h3>
        </div>

        {/* Цена в нижней строке */}
        <div className='mt-2 flex items-baseline gap-1 px-2 py-1 rounded-md bg-[#0D0D11]/40 w-fit'>
          <span className='text-[#F9F8FC] font-actay-wide text-xs font-bold'>{formatPrice(item.price)}</span>
          <span className='text-[#F9F8FC]/50 font-actay-wide text-xs font-bold'>АР</span>
        </div>
      </motion.div>
    );
  }

  // Десктоп версия - горизонтальная карточка с кнопками
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
            whileHover={item.isWithdrawable ? { scale: 1.02 } : {}}
            whileTap={item.isWithdrawable ? { scale: 0.98 } : {}}
            onClick={item.isWithdrawable ? () => onWithdrawClick?.(inventoryItem) : undefined}
            disabled={!item.isWithdrawable}
            className={`flex flex-col justify-center items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              item.isWithdrawable
                ? 'bg-[#F9F8FC]/[0.10] hover:bg-[#F9F8FC]/[0.15] cursor-pointer'
                : 'bg-[#F9F8FC]/[0.05] cursor-not-allowed'
            }`}
          >
            <span className={`text-[#F9F8FC] font-unbounded text-sm font-medium transition-opacity duration-200 ${
              item.isWithdrawable
                ? 'opacity-50 group-hover:opacity-70'
                : 'opacity-25'
            }`}>
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