'use client';

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import Modal from './Modal';
import { InventoryItem } from '@/hooks/useInventoryAPI';
import { SmartLink } from '@/lib/linkUtils';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem?: InventoryItem | null;
  initialTab?: 'sell' | 'withdraw';
}

// Константы для предотвращения пересоздания при каждом рендере
const SELL_AMOUNTS = ['1', '5', '10', '25', 'Все'] as const;
const WITHDRAW_AMOUNTS = ['1', '5', '10', '25', 'Все'] as const;

// Мемоизированный компонент кнопки для предотвращения лишних рендеров
const AmountButton = memo(function AmountButton({ 
  amount, 
  isSelected, 
  onClick, 
  isAll = false 
}: { 
  amount: string; 
  isSelected: boolean; 
  onClick: () => void; 
  isAll?: boolean;
}) {
  const buttonClass = useMemo(() => 
    `${isSelected ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-1.5 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`,
    [isSelected]
  );

  return (
    <button onClick={onClick} className={buttonClass}>
      <span className="font-unbounded text-sm">{isAll ? 'Все' : amount}</span>
      {!isAll && <span className="text-xs text-[#8C8C90]"> шт.</span>}
    </button>
  );
});

/**
 * Модальное окно для продажи и вывода предметов из инвентаря
 * @param isOpen - Флаг открытия модального окна
 * @param onClose - Функция закрытия модального окна
 * @param selectedItem - Выбранный предмет для операций
 */
const InventoryModal = memo(function InventoryModal({ isOpen, onClose, selectedItem, initialTab = 'sell' }: InventoryModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sellAmount, setSellAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedSellAmountButton, setSelectedSellAmountButton] = useState<string | null>(null);
  const [selectedWithdrawAmountButton, setSelectedWithdrawAmountButton] = useState<string | null>(null);
  const [sellAmountError, setSellAmountError] = useState<string | null>(null);
  const [withdrawAmountError, setWithdrawAmountError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Синхронизация активной вкладки с initialTab
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Мемоизированные обработчики для предотвращения лишних рендеров
  const handleSellAmountSelect = useCallback((amount: string) => {
    if (amount === 'Все' && selectedItem) {
      setSellAmount(selectedItem.amount.toString());
      setSelectedSellAmountButton(amount);
    } else {
      setSellAmount(amount);
      setSelectedSellAmountButton(amount);
    }
    setSellAmountError(null);
  }, [selectedItem]);

  const handleWithdrawAmountSelect = useCallback((amount: string) => {
    if (amount === 'Все' && selectedItem) {
      setWithdrawAmount(selectedItem.amount.toString());
      setSelectedWithdrawAmountButton(amount);
    } else {
      setWithdrawAmount(amount);
      setSelectedWithdrawAmountButton(amount);
    }
    setWithdrawAmountError(null);
  }, [selectedItem]);

  const handleSellAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setSellAmount(value);
    setSelectedSellAmountButton(null);
    setSellAmountError(null);
  }, []);

  const handleWithdrawAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setWithdrawAmount(value);
    setSelectedWithdrawAmountButton(null);
    setWithdrawAmountError(null);
  }, []);

  // Мемоизированная валидация
  const validateSellForm = useCallback(() => {
    let isValid = true;
    
    if (!sellAmount) {
      setSellAmountError('Введите количество');
      isValid = false;
    } else if (parseInt(sellAmount) <= 0) {
      setSellAmountError('Некорректное количество');
      isValid = false;
    } else if (selectedItem && parseInt(sellAmount) > selectedItem.amount) {
      setSellAmountError('Недостаточно предметов');
      isValid = false;
    }
    
    return isValid;
  }, [sellAmount, selectedItem]);

  const validateWithdrawForm = useCallback(() => {
    let isValid = true;
    
    if (!withdrawAmount) {
      setWithdrawAmountError('Введите количество');
      isValid = false;
    } else if (parseInt(withdrawAmount) <= 0) {
      setWithdrawAmountError('Некорректное количество');
      isValid = false;
    } else if (selectedItem && parseInt(withdrawAmount) > selectedItem.amount) {
      setWithdrawAmountError('Недостаточно предметов');
      isValid = false;
    }
    
    return isValid;
  }, [withdrawAmount, selectedItem]);

  const handleSell = useCallback(async () => {
    if (validateSellForm()) {
      setIsLoading(true);
      try {
        // TODO: Здесь будет логика продажи предмета
        console.log('Продажа предмета:', selectedItem?.item.name, 'количество:', sellAmount);
        
        // Имитация API запроса
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Очищаем форму и закрываем модалку
        setSellAmount('');
        setSelectedSellAmountButton(null);
        setSellAmountError(null);
        onClose();
      } catch (error) {
        setSellAmountError('Ошибка при продаже предмета');
      } finally {
        setIsLoading(false);
      }
    }
  }, [validateSellForm, selectedItem, sellAmount, onClose]);

  const handleWithdraw = useCallback(async () => {
    if (validateWithdrawForm()) {
      setIsLoading(true);
      try {
        // TODO: Здесь будет логика вывода предмета
        console.log('Вывод предмета:', selectedItem?.item.name, 'количество:', withdrawAmount);
        
        // Имитация API запроса
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Очищаем форму и закрываем модалку
        setWithdrawAmount('');
        setSelectedWithdrawAmountButton(null);
        setWithdrawAmountError(null);
        onClose();
      } catch (error) {
        setWithdrawAmountError('Ошибка при выводе предмета');
      } finally {
        setIsLoading(false);
      }
    }
  }, [validateWithdrawForm, selectedItem, withdrawAmount, onClose]);

  // Мемоизированные обработчики отмены
  const handleSellCancel = useCallback(() => {
    setSellAmount('');
    setSelectedSellAmountButton(null);
    setSellAmountError(null);
    onClose();
  }, [onClose]);

  const handleWithdrawCancel = useCallback(() => {
    setWithdrawAmount('');
    setSelectedWithdrawAmountButton(null);
    setWithdrawAmountError(null);
    onClose();
  }, [onClose]);

  // Мемоизированный заголовок
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

  // Мемоизированные кнопки продажи
  const sellAmountButtons = useMemo(() => (
    <div className="grid grid-cols-5 gap-1.5">
      {SELL_AMOUNTS.map((amount) => (
        <AmountButton
          key={amount}
          amount={amount}
          isSelected={selectedSellAmountButton === amount}
          onClick={() => handleSellAmountSelect(amount)}
          isAll={amount === 'Все'}
        />
      ))}
    </div>
  ), [selectedSellAmountButton, handleSellAmountSelect]);

  // Мемоизированные кнопки вывода
  const withdrawAmountButtons = useMemo(() => (
    <div className="grid grid-cols-5 gap-1.5">
      {WITHDRAW_AMOUNTS.map((amount) => (
        <AmountButton
          key={amount}
          amount={amount}
          isSelected={selectedWithdrawAmountButton === amount}
          onClick={() => handleWithdrawAmountSelect(amount)}
          isAll={amount === 'Все'}
        />
      ))}
    </div>
  ), [selectedWithdrawAmountButton, handleWithdrawAmountSelect]);

  // Информация о выбранном предмете
  const itemInfo = useMemo(() => {
    if (!selectedItem) return null;
    
    return (
      <div className="mb-3 p-3 bg-[#19191D] rounded-lg">
        <div className="flex items-center gap-3">
          <img 
            src={selectedItem.item.imageUrl} 
            alt={selectedItem.item.name}
            className="w-12 h-12 object-contain"
          />
          <div className="flex-1">
            <h3 className="text-[#F9F8FC] font-unbounded text-sm font-bold">
              {selectedItem.item.name}
            </h3>
            <p className="text-[#F9F8FC]/50 text-xs">
              Доступно: {selectedItem.amount} шт.
            </p>
            <p className="text-[#F9F8FC]/70 text-xs">
              Цена: {selectedItem.item.price} АР за шт.
            </p>
          </div>
        </div>
      </div>
    );
  }, [selectedItem]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      {itemInfo}
      
      {activeTab === 'sell' ? (
        <div className="flex flex-col gap-3">
          {/* Поле ввода количества для продажи */}
          <div className="relative">
            <input 
              type="text" 
              value={sellAmount}
              onChange={handleSellAmountChange}
              disabled={isLoading}
              className={`w-full bg-[#19191D] text-[#F9F8FC] px-3 py-3 rounded-lg outline-none text-xl font-unbounded ${sellAmountError ? 'border border-red-500' : 'focus:ring-1 focus:ring-[#5C5ADC]'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
              placeholder="Количество для продажи"
            />
            {sellAmountError && (
              <p className="text-red-500 text-sm mt-1">*{sellAmountError}</p>
            )}
          </div>
          
          {/* Кнопки быстрого выбора количества */}
          {sellAmountButtons}
          
          {/* Информация о доходе */}
          {sellAmount && selectedItem && (
            <div className="p-2 bg-[#19191D] rounded-lg">
              <p className="text-[#F9F8FC]/70 text-sm">
                Доход: {(parseInt(sellAmount) * selectedItem.item.price).toFixed(2)} АР
              </p>
            </div>
          )}
          
          {/* Соглашение и кнопки действий */}
          <div className="mt-2">
            <p className="text-[#F9F8FC]/50 text-sm mb-3">
              Нажимая кнопку «Продать»,<br/>
              я соглашаюсь с <SmartLink href="https://example.com/terms" className="text-[#5C5ADC] hover:underline">«Договором оферты»</SmartLink>
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleSellCancel}
                className="bg-[#19191D] hover:bg-[#1E1E23] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
                type="button"
              >
                Отменить
              </button>
              <button 
                onClick={handleSell}
                disabled={isLoading}
                className={`bg-[#54A930] hover:bg-[#4A8A2A] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="button"
              >
                {isLoading ? 'Продажа...' : 'Продать'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Поле ввода количества для вывода */}
          <div className="relative">
            <input 
              type="text" 
              value={withdrawAmount}
              onChange={handleWithdrawAmountChange}
              disabled={isLoading}
              className={`w-full bg-[#19191D] text-[#F9F8FC] px-3 py-3 rounded-lg outline-none text-xl font-unbounded ${withdrawAmountError ? 'border border-red-500' : 'focus:ring-1 focus:ring-[#5C5ADC]'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
              placeholder="Количество для вывода"
            />
            {withdrawAmountError && (
              <p className="text-red-500 text-sm mt-1">*{withdrawAmountError}</p>
            )}
          </div>
          
          {/* Кнопки быстрого выбора количества */}
          {withdrawAmountButtons}
          
          {/* Информация о выводе */}
          {withdrawAmount && selectedItem && (
            <div className="p-2 bg-[#19191D] rounded-lg">
              <p className="text-[#F9F8FC]/70 text-sm">
                К выводу: {withdrawAmount} шт. {selectedItem.item.name}
              </p>
            </div>
          )}
          
          {/* Соглашение и кнопки действий */}
          <div className="mt-2">
            <p className="text-[#F9F8FC]/50 text-sm mb-3">
              Нажимая кнопку «Вывести»,<br/>
              я соглашаюсь с <SmartLink href="https://example.com/terms" className="text-[#5C5ADC] hover:underline">«Договором оферты»</SmartLink>
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleWithdrawCancel}
                className="bg-[#19191D] hover:bg-[#1E1E23] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
                type="button"
              >
                Отменить
              </button>
              <button 
                onClick={handleWithdraw}
                disabled={isLoading}
                className={`bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="button"
              >
                {isLoading ? 'Вывод...' : 'Вывести'}
              </button>
            </div>
          </div>
        </div>
      )}    
    </Modal>
  );
});

export default InventoryModal;