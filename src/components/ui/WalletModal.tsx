'use client';

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import Modal from './Modal';
import useDepositAPI from '@/hooks/useDepositAPI';
import useWithdrawAPI from '@/hooks/useWithdrawAPI';
import useSavedCards from '@/hooks/useSavedCards';
import { useBalanceUpdater } from '@/hooks/useBalanceUpdater';
import { SmartLink } from '@/lib/linkUtils';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetAmount?: number; // Предустановленная сумма для пополнения
}

// Константы для предотвращения пересоздания при каждом рендере
const DEPOSIT_AMOUNTS = ['16', '32', '64', '128', '512'] as const;
const WITHDRAW_AMOUNTS = ['8', '16', '32', '64', '10000'] as const;

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
 * @param presetAmount - Предустановленная сумма для пополнения
 */
const WalletModal = memo(function WalletModal({ isOpen, onClose, presetAmount }: WalletModalProps) {
  const { createDeposit, setupPaymentHandlers, isLoading: isDepositLoading, error: depositError, clearError } = useDepositAPI();
  const { createWithdraw, isLoading: isWithdrawLoading, error: withdrawError, clearError: clearWithdrawError } = useWithdrawAPI();
  const { savedCards, addCard } = useSavedCards();
  const { decreaseBalance } = useBalanceUpdater();
  const { user, refreshUser } = usePreloadedData();
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

  // Обработка предустановленной суммы пополнения
  useEffect(() => {
    if (isOpen && presetAmount && presetAmount > 0) {
      // Переключаемся на вкладку пополнения
      setActiveTab('deposit');
      // Устанавливаем предустановленную сумму
      setDepositAmount(presetAmount.toString());
      // Сбрасываем выбранную кнопку, так как сумма может не совпадать с предустановленными
      setSelectedDepositAmountButton(null);
      // Очищаем ошибки
      setDepositAmountError(null);
      clearError();
    }
  }, [isOpen, presetAmount, clearError]);

  // Настройка обработчиков событий оплаты
  useEffect(() => {
    if (!isOpen) return;

    const cleanup = setupPaymentHandlers(
      // onSuccess - при успешной оплате
      async () => {
        // Логирование удалено
        
        // Ждем 2 секунды, чтобы дать серверу время обработать платеж
        setTimeout(async () => {
          // Логирование удалено
          
          try {
             // Обновляем данные пользователя с сервера
             await refreshUser();
             // Логирование удалено
            
            // Очищаем форму и закрываем модалку
            setDepositAmount('');
            setSelectedDepositAmountButton(null);
            setDepositAmountError(null);
            clearError();
            onClose();
          } catch (error) {
            console.error('Error updating balance:', error);
            setDepositAmountError('Ошибка при обновлении баланса');
          }
        }, 2000);
      },
      // onError - при ошибке оплаты
      (error: string) => {
        console.error('Error processing deposit payment:', error);
        setDepositAmountError(error);
      }
    );

    return cleanup;
  }, [isOpen, setupPaymentHandlers, onClose, clearError, depositAmount, refreshUser]);

  // Мемоизированные обработчики для предотвращения лишних рендеров
  const handleDepositAmountSelect = useCallback((amount: string) => {
    setDepositAmount(amount);
    setSelectedDepositAmountButton(amount);
    setDepositAmountError(null);
    clearError(); // Очищаем ошибки API
  }, [clearError]);

  const handleAmountSelect = useCallback((amount: string) => {
    // Если выбрана кнопка "Макс", устанавливаем весь доступный баланс, округленный в меньшую сторону
    if (amount === '10000') {
      const userBalance = user?.balance ?? 0;
      const roundedBalance = Math.floor(userBalance).toString();
      setWithdrawAmount(roundedBalance);
      setSelectedAmountButton(amount);
      setAmountError(null);
    } else {
      setWithdrawAmount(amount);
      setSelectedAmountButton(amount);
      setAmountError(null);
    }
  }, [user?.balance]);

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
    clearWithdrawError(); // Очищаем ошибки API вывода
  }, [clearWithdrawError]);

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
    } else if (parseFloat(depositAmount) !== parseInt(depositAmount)) {
      setDepositAmountError('Пополнение возможно только целыми значениями');
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

  const handleWithdraw = useCallback(async () => {
    if (validateWithdrawForm()) {
      clearWithdrawError(); // Очищаем предыдущие ошибки
      
      const success = await createWithdraw(parseInt(withdrawAmount), cardNumber);
      
      if (success) {
        // Логирование удалено
        
        // Локально уменьшаем баланс на сумму вывода
        const withdrawAmountNum = parseInt(withdrawAmount);
        decreaseBalance(withdrawAmountNum);
        // Логирование удалено
        
        // Сохраняем карту в куки только после успешного вывода
        addCard(cardNumber);
        // Логирование удалено
        
        // Очищаем форму и закрываем модалку
        setWithdrawAmount('');
        setCardNumber('');
        setSelectedAmountButton(null);
        setSelectedCardButton(null);
        setAmountError(null);
        setCardError(null);
        onClose();
      }
    }
  }, [validateWithdrawForm, withdrawAmount, cardNumber, createWithdraw, addCard, decreaseBalance, clearWithdrawError, onClose]);

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
    clearWithdrawError(); // Очищаем ошибки API вывода
    onClose();
  }, [onClose, clearWithdrawError]);

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
  const cardButtons = useMemo(() => {
    if (savedCards.length === 0) {
      return null;
    }
    
    return (
      <div className="grid grid-cols-4 gap-1.5">
        {savedCards.map((card, index) => (
          <CardButton
            key={`${card}-${index}`}
            cardNumber={card}
            isSelected={selectedCardButton === card}
            onClick={() => handleCardSelect(card)}
          />
        ))}
      </div>
    );
  }, [savedCards, selectedCardButton, handleCardSelect]);

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
              disabled={isWithdrawLoading}
              className={`w-full bg-[#19191D] text-[#F9F8FC] px-3 py-3 rounded-lg outline-none text-xl font-unbounded ${amountError ? 'border border-red-500' : 'focus:ring-1 focus:ring-[#5C5ADC]'} ${isWithdrawLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
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
              disabled={isWithdrawLoading}
              className={`w-full bg-[#19191D] text-[#F9F8FC] px-3 py-3 rounded-lg outline-none text-xl font-unbounded ${(cardError || withdrawError) ? 'border border-red-500' : 'focus:ring-1 focus:ring-[#5C5ADC]'} ${isWithdrawLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
              placeholder="Номер карты"
            />
            {(cardError || withdrawError) && (
              <p className="text-red-500 text-sm mt-1">*{cardError || withdrawError}</p>
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
                disabled={isWithdrawLoading}
                className={`bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0 ${isWithdrawLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="button"
              >
                {isWithdrawLoading ? 'Обработка...' : 'Вывести'}
              </button>
            </div>
          </div>
        </div>
      )}    
    </Modal>
  );
});

export default WalletModal;