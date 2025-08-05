'use client';

import React, { useState, useMemo, memo, useEffect } from 'react';
import Modal from './Modal';
import { InventoryItem } from '@/hooks/useInventoryAPI';
import CaseItemCard from './CaseItemCard';
import { CaseItem } from '@/hooks/useCasesAPI';
import { useSellAPI } from '@/hooks/useSellAPI';
import { useBalanceUpdater } from '@/hooks/useBalanceUpdater';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: InventoryItem | null;
  initialTab?: 'sell' | 'withdraw';
  onSellSuccess?: () => void; // Колбэк для обновления инвентаря после продажи
}

/**
 * Модальное окно для продажи и вывода предметов из инвентаря
 * @param isOpen - Флаг открытия модального окна
 * @param onClose - Функция закрытия модального окна
 * @param selectedItem - Выбранный предмет для операций
 * @param initialTab - Начальная активная вкладка
 */
const InventoryModal = memo(function InventoryModal({ isOpen, onClose, selectedItem, initialTab = 'sell', onSellSuccess }: InventoryModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isMaxSelected, setIsMaxSelected] = useState(false);
  
  // Хук для продажи предметов
  const { sellItem, isLoading: isSelling, error: sellError, clearError } = useSellAPI();
  const { increaseBalance } = useBalanceUpdater();

  // Максимальное количество доступных предметов
  const maxQuantity = selectedItem?.amount || 1;

  // Синхронизация активной вкладки с initialTab
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Сброс количества при смене предмета
  useEffect(() => {
    setSelectedQuantity(1);
    setIsMaxSelected(false);
    clearError(); // Очищаем ошибки продажи
  }, [selectedItem, clearError]);

  // Функции для работы с количеством
  const handleDecrease = () => {
    if (selectedQuantity > 1) {
      const newQuantity = selectedQuantity - 1;
      setSelectedQuantity(newQuantity);
      setIsMaxSelected(newQuantity === maxQuantity);
    }
  };

  const handleIncrease = () => {
    if (selectedQuantity < maxQuantity) {
      const newQuantity = selectedQuantity + 1;
      setSelectedQuantity(newQuantity);
      setIsMaxSelected(newQuantity === maxQuantity);
    }
  };

  const handleMaxClick = () => {
    setSelectedQuantity(maxQuantity);
    setIsMaxSelected(true);
  };

  // Функция для обработки кнопки вывода
  const handleWithdraw = () => {
    window.open('https://discord.gg/6uSgHru2bv', '_blank');
  };

  // Функция для обработки продажи
  const handleSell = async () => {
    if (!selectedItem) {
      console.error('❌ [InventoryModal] Предмет не выбран для продажи');
      return;
    }

    try {
      const result = await sellItem(selectedItem.item.id, selectedQuantity, selectedItem.item.price);
      
      if (result.success && result.totalAmount) {
        // Успешная продажа
        console.log(`✅ [InventoryModal] Предмет ${selectedItem.item.name} успешно продан на сумму:`, result.totalAmount);
        
        // Локально обновляем баланс в хедере
        increaseBalance(result.totalAmount);
        
        // Вызываем колбэк для обновления инвентаря
        if (onSellSuccess) {
          onSellSuccess();
        }
        
        // Закрываем модальное окно
        onClose();
      }
      // Ошибка обрабатывается в хуке useSellAPI
    } catch (error) {
      console.error('❌ [InventoryModal] Неожиданная ошибка при продаже:', error);
    }
  };

  // Мемоизированный заголовок с вкладками
  const modalTitle = useMemo(() => (
    <div className="flex items-center gap-4">
      <button 
        className={`text-xl font-bold ${activeTab === 'sell' ? 'text-[#F9F8FC]' : 'text-[#F9F8FC]/50 hover:text-[#F9F8FC]/70'} transition-colors cursor-pointer`}
        onClick={() => setActiveTab('sell')}
        type="button"
      >
        Продажа
      </button>
      <span className="text-[#F9F8FC]/30">/</span>
      <button 
        className={`text-xl font-bold ${activeTab === 'withdraw' ? 'text-[#F9F8FC]' : 'text-[#F9F8FC]/50 hover:text-[#F9F8FC]/70'} transition-colors cursor-pointer`}
        onClick={() => setActiveTab('withdraw')}
        type="button"
      >
        Вывод
      </button>
    </div>
  ), [activeTab]);

  // Преобразуем selectedItem в CaseItem для отображения
  const caseItem: CaseItem | null = selectedItem ? {
    id: selectedItem.item.id,
    name: selectedItem.item.name,
    description: selectedItem.item.description,
    imageUrl: selectedItem.item.imageUrl,
    amount: selectedItem.item.amount,
    price: selectedItem.item.price,
    percentChance: selectedItem.item.percentChance,
    rarity: selectedItem.item.rarity
  } : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div className='flex p-4 items-start gap-4 self-stretch rounded-lg bg-[#F9F8FC]/5'>
        {/* Иконка предмета */}
        <div className="flex-shrink-0">
          {caseItem && (
            <CaseItemCard 
              item={caseItem}
              hideChance={true}
              className="w-[80px] h-[100px]"
            />
          )}
        </div>
        <div className='flex flex-col justify-center items-start gap-3 flex-1 self-stretch'>
          <div className='flex flex-col items-start self-stretch'>
            <p className='self-stretch text-[#F9F8FC] text-20 font-bold'>
              {selectedItem?.item.name || 'Предмет не выбран'}
            </p>
            <p className='self-stretch text-[#F9F8FC]/50 text-16 font-bold overflow-hidden line-clamp-1'>
              {selectedItem?.item.description || 'Описание отсутствует'}
            </p>
          </div>
          <div className='flex justify-between items-center self-stretch'>
            <div className='flex items-center gap-1'>
              <button
                onClick={activeTab === 'sell' ? handleDecrease : undefined}
                disabled={activeTab === 'withdraw' || selectedQuantity <= 1}
                className={`flex w-9 p-2.5 px-2 py-1.5 flex-col items-center justify-center gap-2.5 rounded-md transition-colors ${
                  activeTab === 'withdraw' || selectedQuantity <= 1
                    ? 'bg-[#F9F8FC]/5 opacity-50 cursor-not-allowed' 
                    : 'bg-[#F9F8FC]/5 hover:bg-[#F9F8FC]/10 active:bg-[#F9F8FC]/15 cursor-pointer'
                }`}
                type="button"
              >
                <span className='text-[#F9F8FC] text-center text-16 font-bold'>-</span>
              </button>
              <div className='flex w-9 p-2.5 px-2 py-1.5 flex-col items-center justify-center gap-2.5 rounded-md bg-[#5C5ADC]'>
                <span className='text-[#F9F8FC] text-center text-16 font-bold'>{selectedQuantity}</span>
              </div>
              <button
                onClick={activeTab === 'sell' ? handleIncrease : undefined}
                disabled={activeTab === 'withdraw' || selectedQuantity >= maxQuantity}
                className={`flex w-9 p-2.5 px-2 py-1.5 flex-col items-center justify-center gap-2.5 rounded-md transition-colors ${
                  activeTab === 'withdraw' || selectedQuantity >= maxQuantity
                    ? 'bg-[#F9F8FC]/5 opacity-50 cursor-not-allowed' 
                    : 'bg-[#F9F8FC]/5 hover:bg-[#F9F8FC]/10 active:bg-[#F9F8FC]/15 cursor-pointer'
                }`}
                type="button"
              >
                <span className='text-[#F9F8FC] text-center text-16 font-bold'>+</span>
              </button>
            </div>
            <button 
              onClick={activeTab === 'sell' ? handleMaxClick : undefined}
              disabled={activeTab === 'withdraw'}
              className={`text-[#F9F8FC] text-center text-16 font-bold px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'withdraw'
                  ? 'bg-[#F9F8FC]/5 opacity-50 cursor-not-allowed border border-transparent'
                  : isMaxSelected 
                    ? 'bg-[#6563EE]/10 border border-[#5C5ADC] cursor-pointer' 
                    : 'bg-[#F9F8FC]/5 hover:bg-[#6563EE]/10 border border-transparent hover:border-[#5C5ADC] cursor-pointer'
              }`}
              type="button"
            >
              Макс. {maxQuantity}
            </button>
          </div>
        </div>
      </div>
      
      {/* Отображение ошибок продажи */}
      {sellError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm font-medium">
            Ошибка продажи: {sellError}
          </p>
        </div>
      )}
      
      {/* Кнопки */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button 
          onClick={onClose}
          className="bg-[#19191D] hover:bg-[#1E1E23] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
          type="button"
        >
          Отменить
        </button>
        <button 
          onClick={activeTab === 'withdraw' ? handleWithdraw : handleSell}
          disabled={isSelling}
          className={`py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0 transition-colors ${
            isSelling 
              ? 'bg-[#5C5ADC]/50 cursor-not-allowed' 
              : 'bg-[#5C5ADC] hover:bg-[#4A48B0] cursor-pointer'
          }`}
          type="button"
        >
          {isSelling ? 'Продажа...' : (activeTab === 'sell' ? 'Продать' : 'Вывести')}
        </button>
      </div>
    </Modal>
  );
});

export default InventoryModal;