'use client';

import React, { useState, useMemo, memo, useEffect, useCallback, useRef } from 'react';
import Modal from './Modal';
import { InventoryItem } from '@/hooks/useInventoryAPI';
import CaseItemCard from './CaseItemCard';
import { CaseItem } from '@/hooks/useCasesAPI';
import { useSellAPI } from '@/hooks/useSellAPI';
import { useBalanceUpdater } from '@/hooks/useBalanceUpdater';
import useItemWithdrawAPI from '@/hooks/useItemWithdrawAPI';
import useBranchesAPI, { BranchForDisplay } from '@/hooks/useBranchesAPI';

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
  
  // Используем useRef для хранения текущего количества - это предотвратит сброс при обновлениях
  const quantityRef = useRef(1);
  const [displayQuantity, setDisplayQuantity] = useState(1);
  const [isMaxSelected, setIsMaxSelected] = useState(false);
  
  // Состояние для выпадающего списка филиалов
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchForDisplay | null>(null);
  
  // Получаем данные филиалов из API
  const { branchesForDisplay: branches, loading: branchesLoading, error: branchesError, refetch: refetchBranches } = useBranchesAPI();
  
  // Хук для продажи предметов
  const { sellItem, isLoading: isSelling, error: sellError, clearError } = useSellAPI();
  // Хук для вывода предметов
  const { withdrawItem, isLoading: isWithdrawing, error: withdrawError, clearError: clearWithdrawError } = useItemWithdrawAPI();
  const { increaseBalance } = useBalanceUpdater();

  // Максимальное количество доступных предметов
  const maxQuantity = selectedItem?.amount || 1;
  
  // Стабильный идентификатор предмета для отслеживания смены
  const itemId = selectedItem?.item.id;
  const previousItemIdRef = useRef<string | null>(null);

  // Инициализируем количество только при первом открытии или смене предмета
  useEffect(() => {
    if (isOpen && itemId && itemId !== previousItemIdRef.current) {
      quantityRef.current = 1;
      setDisplayQuantity(1);
      setIsMaxSelected(false);
      previousItemIdRef.current = itemId;
      clearError();
      clearWithdrawError();
      // Сбрасываем состояние выпадающего списка
      setIsBranchDropdownOpen(false);
      setSelectedBranch(null);
    }
  }, [isOpen, itemId, clearError, clearWithdrawError]);

  // Синхронизация активной вкладки с initialTab только при открытии
  useEffect(() => {
    if (isOpen) {
      if (initialTab === 'withdraw' && selectedItem && !selectedItem.item.isWithdrawable) {
        setActiveTab('sell');
      } else {
        setActiveTab(initialTab);
      }
      // Сбрасываем состояние выпадающего списка при смене вкладки
      setIsBranchDropdownOpen(false);
      // Загружаем филиалы при открытии модального окна
      refetchBranches();
    }
  }, [isOpen, initialTab, selectedItem]);

  // Сброс состояния выпадающего списка при смене вкладки
  useEffect(() => {
    setIsBranchDropdownOpen(false);
  }, [activeTab]);

  // Функция для форматирования цены (убирает .0 если десятые равны нулю)
  const formatPrice = (price: number): string => {
    return price % 1 === 0 ? price.toString() : price.toFixed(1);
  };

  // Стабильные функции для работы с количеством
  const updateQuantity = useCallback((newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxQuantity) return;
    
    quantityRef.current = newQuantity;
    setDisplayQuantity(newQuantity);
    setIsMaxSelected(newQuantity === maxQuantity);
  }, [maxQuantity]);

  const handleDecrease = useCallback(() => {
    const currentQuantity = quantityRef.current;
    if (currentQuantity > 1) {
      updateQuantity(currentQuantity - 1);
    }
  }, [updateQuantity]);

  const handleIncrease = useCallback(() => {
    const currentQuantity = quantityRef.current;
    if (currentQuantity < maxQuantity) {
      updateQuantity(currentQuantity + 1);
    }
  }, [updateQuantity, maxQuantity]);

  const handleMaxClick = useCallback(() => {
    updateQuantity(maxQuantity);
  }, [updateQuantity, maxQuantity]);

  // Функция для обработки кнопки вывода
  const handleWithdraw = async () => {
    if (!selectedItem) {
      console.error('[InventoryModal] No item selected for withdrawal');
      return;
    }

    if (!selectedBranch) {
      console.error('[InventoryModal] No branch selected for withdrawal');
      return;
    }

    try {
      const success = await withdrawItem(selectedItem.item.id, quantityRef.current, selectedBranch.id);
      
      if (success) {
        // Вызываем колбэк для обновления инвентаря
        if (onSellSuccess) {
          onSellSuccess();
        }
        
        // Закрываем модальное окно
        onClose();
      }
      // Ошибка обрабатывается в хуке useItemWithdrawAPI
    } catch (error) {
        console.error('[InventoryModal] Unexpected error during withdrawal:', error);
    }
  };

  // Функция для обработки продажи
  const handleSell = async () => {
    if (!selectedItem) {
      console.error('[InventoryModal] No item selected for sale');
      return;
    }

    try {
      const result = await sellItem(selectedItem.item.id, quantityRef.current, selectedItem.item.price);
      
      if (result.success && result.totalAmount) {
        
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
        console.error('[InventoryModal] Unexpected error during sale:', error);
    }
  };

  // Мемоизированный заголовок с вкладками
  const modalTitle = useMemo(() => {
    const isWithdrawable = selectedItem?.item.isWithdrawable ?? false;
    
    return (
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
          className={`text-xl font-bold transition-colors ${
            !isWithdrawable 
              ? 'text-[#F9F8FC]/25 cursor-not-allowed' 
              : activeTab === 'withdraw' 
                ? 'text-[#F9F8FC]' 
                : 'text-[#F9F8FC]/50 hover:text-[#F9F8FC]/70 cursor-pointer'
          }`}
          onClick={isWithdrawable ? () => setActiveTab('withdraw') : undefined}
          disabled={!isWithdrawable}
          type="button"
        >
          Вывод
        </button>
      </div>
    );
  }, [activeTab, selectedItem?.item.isWithdrawable]);

  // Преобразуем selectedItem в CaseItem для отображения
  const caseItem: CaseItem | null = selectedItem ? {
    id: selectedItem.item.id,
    name: selectedItem.item.name,
    description: selectedItem.item.description,
    imageUrl: selectedItem.item.imageUrl,
    amount: selectedItem.item.amount,
    price: selectedItem.item.price,
    percentChance: selectedItem.item.percentChance,
    rarity: selectedItem.item.rarity,
    isWithdrawable: selectedItem.item.isWithdrawable
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
                onClick={handleDecrease}
                disabled={displayQuantity <= 1}
                className={`flex w-9 p-2.5 px-2 py-1.5 flex-col items-center justify-center gap-2.5 rounded-md transition-colors ${
                  displayQuantity <= 1
                    ? 'bg-[#F9F8FC]/5 opacity-50 cursor-not-allowed' 
                    : 'bg-[#F9F8FC]/5 hover:bg-[#2A2A30] active:bg-[#F9F8FC]/15 cursor-pointer'
                }`}
                type="button"
              >
                <span className='text-[#F9F8FC] text-center text-16 font-bold'>-</span>
              </button>
              <div className='flex w-9 p-2.5 px-2 py-1.5 flex-col items-center justify-center gap-2.5 rounded-md bg-[#5C5ADC]'>
                <span className='text-[#F9F8FC] text-center text-16 font-bold'>{displayQuantity}</span>
              </div>
              <button
                onClick={handleIncrease}
                disabled={displayQuantity >= maxQuantity}
                className={`flex w-9 p-2.5 px-2 py-1.5 flex-col items-center justify-center gap-2.5 rounded-md transition-colors ${
                  displayQuantity >= maxQuantity
                    ? 'bg-[#F9F8FC]/5 opacity-50 cursor-not-allowed' 
                    : 'bg-[#F9F8FC]/5 hover:bg-[#2A2A30] active:bg-[#F9F8FC]/15 cursor-pointer'
                }`}
                type="button"
              >
                <span className='text-[#F9F8FC] text-center text-16 font-bold'>+</span>
              </button>
            </div>
            <button 
              onClick={handleMaxClick}
              className={`text-[#F9F8FC] text-center text-16 font-bold px-3 py-1.5 rounded-md transition-all ${
                isMaxSelected 
                  ? 'bg-[#6563EE]/10 border border-[#5C5ADC] cursor-pointer' 
                  : 'bg-[#F9F8FC]/5 hover:bg-[#2A2A30] border border-transparent hover:border-[#5C5ADC] cursor-pointer'
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
      
      {/* Отображение ошибок вывода */}
      {withdrawError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm font-medium">
            {withdrawError}
          </p>
        </div>
      )}
      
      {/* Блок выбора филиала - только для вкладки вывода */}
      {activeTab === 'withdraw' && (
        <div className='flex w-full mt-2 flex-col items-start gap-1'>
          <button 
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className='flex px-4 py-3 justify-between items-center self-stretch rounded-xl bg-[#F9F8FC]/5 hover:bg-[#2A2A30] transition-colors cursor-pointer'
            type="button"
          >
            <div className='flex justify-between items-center w-full'>
              <p className='text-[#FFF]/50 font-["Actay_Wide"] text-16 font-bold'>
                {selectedBranch?.name || 'Выберите филиал'}
              </p>
              {selectedBranch && (
                <div className='mr-2'>
                  {selectedBranch.coordinates.split(' ')[0].toLowerCase().startsWith('зв') && (
                    <span className='text-[#289547] text-base font-[515] leading-normal tabular-nums lining-nums font-["Actay_Wide"] font-bold'>{selectedBranch.coordinates}</span>
                  )}
                  {selectedBranch.coordinates.split(' ')[0].toLowerCase().startsWith('жв') && (
                    <span className='text-[#D9C332] text-base font-[515] leading-normal tabular-nums lining-nums font-["Actay_Wide"] font-bold'>{selectedBranch.coordinates}</span>
                  )}
                  {selectedBranch.coordinates.split(' ')[0].toLowerCase().startsWith('кв') && (
                    <span className='text-[#E74A4A] text-base font-[515] leading-normal tabular-nums lining-nums font-["Actay_Wide"] font-bold'>{selectedBranch.coordinates}</span>
                  )}
                  {selectedBranch.coordinates.split(' ')[0].toLowerCase().startsWith('св') && (
                    <span className='text-[#668CE0] text-base font-[515] leading-normal tabular-nums lining-nums font-["Actay_Wide"] font-bold'>{selectedBranch.coordinates}</span>
                  )}
                </div>
              )}
            </div>
            <img 
              src="/Arrow - Down 2.svg" 
              alt="Развернуть" 
              width={12} 
              height={10} 
              className={`w-[12px] h-[10px] transition-transform duration-200 ${
                isBranchDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {/* Выпадающий список филиалов */}
          {isBranchDropdownOpen && (
            <div className='flex p-1 flex-col items-start gap-1 self-stretch rounded-xl bg-[#F9F8FC]/5 animate-in slide-in-from-top-2 duration-200'>
              {branchesLoading ? (
                <div className='flex justify-center items-center px-3 py-2 w-full'>
                  <p className='text-[#F9F8FC] opacity-50 font-["Actay_Wide"] text-16 font-bold'>Загрузка филиалов...</p>
                </div>
              ) : branchesError ? (
                <div className='flex justify-center items-center px-3 py-2 w-full'>
                  <p className='text-[#E74A4A] opacity-50 font-["Actay_Wide"] text-16 font-bold'>Ошибка загрузки филиалов</p>
                </div>
              ) : branches.length === 0 ? (
                <div className='flex justify-center items-center px-3 py-2 w-full'>
                  <p className='text-[#F9F8FC] opacity-50 font-["Actay_Wide"] text-16 font-bold'>Филиалы не найдены</p>
                </div>
              ) : (
                branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setIsBranchDropdownOpen(false);
                    }}
                    className='flex justify-between items-center px-3 py-2 w-full text-left rounded-lg hover:bg-[#2A2A30] transition-colors cursor-pointer'
                    type="button"
                  >
                    <p className='text-[#F9F8FC] opacity-50 font-["Actay_Wide"] text-16 font-bold'>{branch.name}</p>
                    <div>
                      {branch.coordinates.split(' ')[0].toLowerCase().startsWith('зв') && (
                        <span className='text-[#289547] text-base font-[515] leading-normal tabular-nums lining-nums font-["Actay_Wide"] font-bold'>{branch.coordinates}</span>
                      )}
                      {branch.coordinates.split(' ')[0].toLowerCase().startsWith('жв') && (
                      <span className='text-[#D9C332] text-base font-[515] leading-normal tabular-nums lining-nums font-["Actay_Wide"] font-bold'>{branch.coordinates}</span>
                    )}
                    {branch.coordinates.split(' ')[0].toLowerCase().startsWith('кв') && (
                      <span className='text-[#E74A4A] text-base font-[515] leading-normal tabular-nums lining-nums font-["Actay_Wide"] font-bold'>{branch.coordinates}</span>
                    )}
                    {branch.coordinates.split(' ')[0].toLowerCase().startsWith('св') && (
                      <span className='text-[#668CE0] text-base font-[515] leading-normal tabular-nums lining-nums font-["Actay_Wide"] font-bold'>{branch.coordinates}</span>
                    )}
                  </div>
                </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Кнопки */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button 
          onClick={onClose}
          className="bg-[#19191D] hover:bg-[#2A2A30] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
          type="button"
        >
          Отменить
        </button>
        <button 
          onClick={activeTab === 'withdraw' ? handleWithdraw : handleSell}
          disabled={isSelling || isWithdrawing || (activeTab === 'withdraw' && !selectedItem?.item.isWithdrawable)}
          className={`py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0 transition-colors ${
            isSelling || isWithdrawing || (activeTab === 'withdraw' && !selectedItem?.item.isWithdrawable)
              ? 'bg-[#5C5ADC]/50 cursor-not-allowed' 
              : 'bg-[#5C5ADC] hover:bg-[#4A48B0] cursor-pointer'
          }`}
          type="button"
        >
          {isSelling ? 'Продажа...' : isWithdrawing ? 'Вывод...' : (activeTab === 'sell' ? `Продать • ${formatPrice((selectedItem?.item.price || 0) * displayQuantity)} АР` : `Вывести ${displayQuantity} шт.`)}
        </button>
      </div>
    </Modal>
  );
});

export default InventoryModal;