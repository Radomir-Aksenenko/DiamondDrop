'use client';

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import Modal from './Modal';
import useDepositAPI from '@/hooks/useDepositAPI';
import { SmartLink } from '@/lib/linkUtils';
import { useBalanceUpdater } from '@/hooks/useBalanceUpdater';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Константы для предотвращения пересоздания при каждом рендере
const DEPOSIT_AMOUNTS = ['16', '32', '64', '128', '512'] as const;
const WITHDRAW_AMOUNTS = ['8', '16', '32', '64', '10000'] as const;
const CARD_NUMBERS = ['77777', '77777', '77777', '77777'] as const;

// Мемоизированный компонент кнопки для предотвращения лишних рендеров
const AmountButton = memo(function AmountButton({ 
  amount, 
  isSelected, 
  onClick, 
  isMax = false 
}: { 
  amount: string; 
  isSelected: boolean; 
  onClick: () => void; 
  isMax?: boolean;
}) {
  const buttonClass = useMemo(() => 
    `${isSelected ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-1.5 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`,
    [isSelected]
  );

  return (
    <button onClick={onClick} className={buttonClass}>
      <span className="font-unbounded text-sm">{isMax ? 'Макс.' : amount}</span>
      {!isMax && <span className="text-xs text-[#8C8C90]"> АР</span>}
    </button>
  );
});

// Мемоизированный компонент кнопки карты
const CardButton = memo(function CardButton({ 
  cardNumber, 
  isSelected, 
  onClick 
}: { 
  cardNumber: string; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  const buttonClass = useMemo(() => 
    `${isSelected ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-1.5 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`,
    [isSelected]
  );

  return (
    <button onClick={onClick} className={buttonClass}>
      <span className="font-unbounded text-sm">{cardNumber}</span>
    </button>
  );
});

/**
 * Оптимизированное модальное окно кошелька
 * @param isOpen - Флаг открытия модального окна
 * @param onClose - Функция закрытия модального окна
 */
const WalletModal = memo(function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { createDeposit, setupPaymentHandlers, isLoading: isDepositLoading, error: depositError, clearError } = useDepositAPI();
  const { increaseBalance } = useBalanceUpdater();
  const [activeTab, setActiveTab] = useState('deposit');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [selectedAmountButton, setSelectedAmountButton] = useState<string | null>(null);
  const [selectedDepositAmountButton, setSelectedDepositAmountButton] = useState<string | null>(null);
  const [selectedCardButton, setSelectedCardButton] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [depositAmountError, setDepositAmountError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  // Настройка обработчиков событий оплаты
  useEffect(() => {
    if (!isOpen) return;

    const cleanup = setupPaymentHandlers(
      // onSuccess - при успешной оплате
      async () => {
        console.log('🎉 Депозит успешно выполнен');
        console.log('🔄 Локально обновляем баланс пользователя...');
        
        // Локально увеличиваем баланс на сумму депозита
        const depositAmountNum = parseInt(depositAmount);
        increaseBalance(depositAmountNum);
        console.log(`✅ Баланс локально увеличен на ${depositAmountNum}`);
        
        // Очищаем форму и закрываем модалку
        setDepositAmount('');
        setSelectedDepositAmountButton(null);
        setDepositAmountError(null);
        clearError();
        onClose();
      },
      // onError - при ошибке оплаты
      (error: string) => {
        console.error('Ошибка при оплате депозита:', error);
        setDepositAmountError(error);
      }
    );

    return cleanup;
  }, [isOpen, setupPaymentHandlers, onClose, clearError, increaseBalance, depositAmount]);

  // Мемоизированные обработчики для предотвращения лишних рендеров
  const handleDepositAmountSelect = useCallback((amount: string) => {
    setDepositAmount(amount);
    setSelectedDepositAmountButton(amount);
    setDepositAmountError(null);
    clearError(); // Очищаем ошибки API
  }, [clearError]);

  const handleAmountSelect = useCallback((amount: string) => {
    setWithdrawAmount(amount);
    setSelectedAmountButton(amount);
    setAmountError(null);
  }, []);

  const handleCardSelect = useCallback((card: string) => {
    setCardNumber(card);
    setSelectedCardButton(card);
    setCardError(null);
  }, []);

  const handleDepositAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setDepositAmount(value);
    setSelectedDepositAmountButton(null);
    setDepositAmountError(null);
    clearError(); // Очищаем ошибки API
  }, [clearError]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setWithdrawAmount(value);
    setSelectedAmountButton(null);
    setAmountError(null);
  }, []);

  const handleCardChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setCardNumber(value);
    setSelectedCardButton(null);
    setCardError(null);
  }, []);

  // Мемоизированная валидация
  const validateDepositForm = useCallback(() => {
    let isValid = true;
    
    if (!depositAmount) {
      setDepositAmountError('Введите сумму');
      isValid = false;
    } else if (parseInt(depositAmount) <= 0) {
      setDepositAmountError('Некорректная сумма');
      isValid = false;
    } else if (parseInt(depositAmount) > 10000) {
      setDepositAmountError('Сумма превышает максимальную');
      isValid = false;
    }
    
    return isValid;
  }, [depositAmount]);

  const validateWithdrawForm = useCallback(() => {
    let isValid = true;
    
    if (!withdrawAmount) {
      setAmountError('Введите сумму');
      isValid = false;
    } else if (parseInt(withdrawAmount) <= 0) {
      setAmountError('Некорректная сумма');
      isValid = false;
    } else if (parseInt(withdrawAmount) > 10000) {
      setAmountError('Сумма превышает максимальную');
      isValid = false;
    }
    
    if (!cardNumber) {
      setCardError('Введите номер карты');
      isValid = false;
    } else if (cardNumber.length < 5) {
      setCardError('Номер карты должен содержать 5 цифр');
      isValid = false;
    }
    
    return isValid;
  }, [withdrawAmount, cardNumber]);

  const handleDeposit = useCallback(async () => {
    if (validateDepositForm()) {
      clearError(); // Очищаем предыдущие ошибки
      await createDeposit(parseInt(depositAmount));
    }
  }, [validateDepositForm, depositAmount, createDeposit, clearError]);

  const handleWithdraw = useCallback(() => {
    if (validateWithdrawForm()) {
      console.log('Вывод средств:', { withdrawAmount, cardNumber });
      onClose();
    }
  }, [validateWithdrawForm, withdrawAmount, cardNumber, onClose]);

  // Мемоизированные обработчики отмены
  const handleDepositCancel = useCallback(() => {
    setDepositAmount('');
    setSelectedDepositAmountButton(null);
    setDepositAmountError(null);
    clearError(); // Очищаем ошибки API
    onClose();
  }, [onClose, clearError]);

  const handleWithdrawCancel = useCallback(() => {
    setWithdrawAmount('');
    setCardNumber('');
    setSelectedAmountButton(null);
    setSelectedCardButton(null);
    setAmountError(null);
    setCardError(null);
    onClose();
  }, [onClose]);

  // Мемоизированный заголовок
  const modalTitle = useMemo(() => (
    <div className="flex items-center gap-4">
      <button 
        className={`text-xl font-bold ${activeTab === 'deposit' ? 'text-[#F9F8FC]' : 'text-[#F9F8FC]/50 hover:text-[#F9F8FC]/70'} transition-colors cursor-pointer`}
        onClick={() => setActiveTab('deposit')}
        type="button"
      >
        Депозит
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

  // Мемоизированные кнопки депозита
  const depositAmountButtons = useMemo(() => (
    <div className="grid grid-cols-5 gap-1.5">
      {DEPOSIT_AMOUNTS.map((amount) => (
        <AmountButton
          key={amount}
          amount={amount}
          isSelected={selectedDepositAmountButton === amount}
          onClick={() => handleDepositAmountSelect(amount)}
        />
      ))}
    </div>
  ), [selectedDepositAmountButton, handleDepositAmountSelect]);

  // Мемоизированные кнопки вывода
  const withdrawAmountButtons = useMemo(() => (
    <div className="grid grid-cols-5 gap-1.5">
      {WITHDRAW_AMOUNTS.map((amount) => (
        <AmountButton
          key={amount}
          amount={amount}
          isSelected={selectedAmountButton === amount}
          onClick={() => handleAmountSelect(amount)}
          isMax={amount === '10000'}
        />
      ))}
    </div>
  ), [selectedAmountButton, handleAmountSelect]);

  // Мемоизированные кнопки карт
  const cardButtons = useMemo(() => (
    <div className="grid grid-cols-4 gap-1.5">
      {CARD_NUMBERS.map((card, index) => (
        <CardButton
          key={`${card}-${index}`}
          cardNumber={card}
          isSelected={selectedCardButton === card}
          onClick={() => handleCardSelect(card)}
        />
      ))}
    </div>
  ), [selectedCardButton, handleCardSelect]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      {activeTab === 'deposit' ? (
        <div className="flex flex-col gap-3">
          {/* Поле ввода суммы депозита */}
          <div className="relative">
            <input 
              type="text" 
              value={depositAmount}
              onChange={handleDepositAmountChange}
              disabled={isDepositLoading}
              className={`w-full bg-[#19191D] text-[#F9F8FC] px-3 py-3 rounded-lg outline-none text-xl font-unbounded ${(depositAmountError || depositError) ? 'border border-red-500' : 'focus:ring-1 focus:ring-[#5C5ADC]'} ${isDepositLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
              placeholder="Сумма депозита"
            />
            {(depositAmountError || depositError) && (
              <p className="text-red-500 text-sm mt-1">*{depositAmountError || depositError}</p>
            )}
          </div>
          
          {/* Кнопки быстрого выбора суммы */}
          {depositAmountButtons}
          
          {/* Соглашение и кнопки действий */}
          <div className="mt-2">
            <p className="text-[#F9F8FC]/50 text-sm mb-3">
              Нажимая кнопку «Пополнить»,<br/>
              я соглашаюсь с <SmartLink href="https://example.com/terms" className="text-[#5C5ADC] hover:underline">«Договором оферты»</SmartLink>
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleDepositCancel}
                className="bg-[#19191D] hover:bg-[#1E1E23] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
                type="button"
              >
                Отменить
              </button>
              <button 
                onClick={handleDeposit}
                disabled={isDepositLoading}
                className={`bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0 ${isDepositLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="button"
              >
                {isDepositLoading ? 'Создание...' : 'Пополнить'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Поле ввода суммы вывода */}
          <div className="relative">
            <input 
              type="text" 
              value={withdrawAmount}
              onChange={handleAmountChange}
              className={`w-full bg-[#19191D] text-[#F9F8FC] px-3 py-3 rounded-lg outline-none text-xl font-unbounded ${amountError ? 'border border-red-500' : 'focus:ring-1 focus:ring-[#5C5ADC]'}`} 
              placeholder="Сумма вывода"
            />
            {amountError && (
              <p className="text-red-500 text-sm mt-1">*{amountError}</p>
            )}
          </div>
          
          {/* Кнопки быстрого выбора суммы */}
          {withdrawAmountButtons}
          
          {/* Поле ввода номера карты */}
          <div className="relative">
            <input 
              type="text" 
              value={cardNumber}
              onChange={handleCardChange}
              maxLength={5}
              className={`w-full bg-[#19191D] text-[#F9F8FC] px-3 py-3 rounded-lg outline-none text-xl font-unbounded ${cardError ? 'border border-red-500' : 'focus:ring-1 focus:ring-[#5C5ADC]'}`} 
              placeholder="Номер карты"
            />
            {cardError && (
              <p className="text-red-500 text-sm mt-1">*{cardError}</p>
            )}
          </div>
          
          {/* Кнопки быстрого выбора карты */}
          {cardButtons}
          
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
                className="bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
                type="button"
              >
                Вывести
              </button>
            </div>
          </div>
        </div>
      )}    
    </Modal>
  );
});

export default WalletModal;