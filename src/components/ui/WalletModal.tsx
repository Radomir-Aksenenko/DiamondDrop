'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import useSPW from '@/hooks/useSPW';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Модальное окно кошелька
 * @param isOpen - Флаг открытия модального окна
 * @param onClose - Функция закрытия модального окна
 */
export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { user } = useSPW();
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

  // Обработчик выбора суммы для депозита
  const handleDepositAmountSelect = (amount: string) => {
    setDepositAmount(amount);
    setSelectedDepositAmountButton(amount);
    setDepositAmountError(null); // Сбрасываем ошибку при выборе суммы
  };

  // Обработчик выбора суммы
  const handleAmountSelect = (amount: string) => {
    setWithdrawAmount(amount);
    setSelectedAmountButton(amount);
    setAmountError(null); // Сбрасываем ошибку при выборе суммы
  };

  // Обработчик выбора карты
  const handleCardSelect = (card: string) => {
    setCardNumber(card);
    setSelectedCardButton(card);
    setCardError(null); // Сбрасываем ошибку при выборе карты
  };

  // Обработчик изменения суммы депозита (только цифры)
  const handleDepositAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Только цифры
    setDepositAmount(value);
    setSelectedDepositAmountButton(null); // Сбрасываем выделение кнопки при ручном вводе
    setDepositAmountError(null); // Сбрасываем ошибку при вводе
  };

  // Обработчик изменения суммы (только цифры)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Только цифры
    setWithdrawAmount(value);
    setSelectedAmountButton(null); // Сбрасываем выделение кнопки при ручном вводе
    setAmountError(null); // Сбрасываем ошибку при вводе
  };

  // Обработчик изменения номера карты (только цифры, максимум 5)
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5); // Только цифры, максимум 5
    setCardNumber(value);
    setSelectedCardButton(null); // Сбрасываем выделение кнопки при ручном вводе
    setCardError(null); // Сбрасываем ошибку при вводе
  };
  
  // Валидация формы депозита
  const validateDepositForm = () => {
    let isValid = true;
    
    // Проверка суммы
    if (!depositAmount) {
      setDepositAmountError('Введите сумму');
      isValid = false;
    } else if (parseInt(depositAmount) <= 0) {
      setDepositAmountError('Некорректная сумма');
      isValid = false;
    } else if (parseInt(depositAmount) > 10000) { // Предполагаемый максимум
      setDepositAmountError('Сумма превышает максимальную');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Обработчик отправки формы депозита
  const handleDeposit = () => {
    if (validateDepositForm()) {
      // Здесь будет логика отправки запроса на пополнение средств
      console.log('Пополнение средств:', { depositAmount });
      onClose();
    }
  };
  
  // Валидация формы вывода
  const validateWithdrawForm = () => {
    let isValid = true;
    
    // Проверка суммы
    if (!withdrawAmount) {
      setAmountError('Введите сумму');
      isValid = false;
    } else if (parseInt(withdrawAmount) <= 0) {
      setAmountError('Некорректная сумма');
      isValid = false;
    } else if (parseInt(withdrawAmount) > 10000) { // Предполагаемый максимум
      setAmountError('Сумма превышает максимальную');
      isValid = false;
    }
    
    // Проверка номера карты
    if (!cardNumber) {
      setCardError('Введите номер карты');
      isValid = false;
    } else if (cardNumber.length < 5) {
      setCardError('Номер карты должен содержать 5 цифр');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Обработчик отправки формы вывода
  const handleWithdraw = () => {
    if (validateWithdrawForm()) {
      // Здесь будет логика отправки запроса на вывод средств
      console.log('Вывод средств:', { withdrawAmount, cardNumber });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div className="flex items-center gap-4">
        <button 
          className={`text-xl font-bold ${activeTab === 'deposit' ? 'text-[#F9F8FC]' : 'text-[#F9F8FC]/50 hover:text-[#F9F8FC]/70'} transition-colors cursor-pointer`}
          onClick={() => setActiveTab('deposit')}
        >
          Депозит
        </button>
        <span className="text-[#F9F8FC]/30">/</span>
        <button 
          className={`text-xl font-bold ${activeTab === 'withdraw' ? 'text-[#F9F8FC]' : 'text-[#F9F8FC]/50 hover:text-[#F9F8FC]/70'} transition-colors cursor-pointer`}
          onClick={() => setActiveTab('withdraw')}
        >
          Вывод
        </button>
      </div>
    }>
      {activeTab === 'deposit' ? (
      <div className="flex flex-col gap-4">
        {/* Поле ввода суммы депозита */}
        <div className="relative">
          <input 
            type="text" 
            value={depositAmount}
            onChange={handleDepositAmountChange}
            className={`w-full bg-[#19191D] text-[#F9F8FC] p-4 rounded-lg outline-none text-2xl font-unbounded ${depositAmountError ? 'border border-red-500' : 'focus:ring-1 focus:ring-[#5C5ADC]'}`} 
            placeholder="999 АР"
          />
          {depositAmountError && (
            <p className="text-red-500 text-sm mt-1">*{depositAmountError}</p>
          )}
        </div>
        
        {/* Кнопки быстрого выбора суммы */}
        <div className="grid grid-cols-5 gap-2">
          <button 
            onClick={() => handleDepositAmountSelect('16')}
            className={`${selectedDepositAmountButton === '16' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">16</span> <span className="text-xs text-[#8C8C90]">АР</span>
          </button>
          <button 
            onClick={() => handleDepositAmountSelect('32')}
            className={`${selectedDepositAmountButton === '32' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">32</span> <span className="text-xs text-[#8C8C90]">АР</span>
          </button>
          <button 
            onClick={() => handleDepositAmountSelect('64')}
            className={`${selectedDepositAmountButton === '64' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">64</span> <span className="text-xs text-[#8C8C90]">АР</span>
          </button>
          <button 
            onClick={() => handleDepositAmountSelect('128')}
            className={`${selectedDepositAmountButton === '128' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">128</span> <span className="text-xs text-[#8C8C90]">АР</span>
          </button>
          <button 
            onClick={() => handleDepositAmountSelect('512')}
            className={`${selectedDepositAmountButton === '512' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">512</span> <span className="text-xs text-[#8C8C90]">АР</span>
          </button>
        </div>
        
        {/* Соглашение и кнопки действий */}
        <div className="mt-4">
          <p className="text-[#F9F8FC]/50 text-sm mb-4">
            Нажимая кнопку «Пополнить»,<br/>
            я соглашаюсь с <a href="#" className="text-[#5C5ADC] hover:underline">«Договором оферты»</a>
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                // Сбрасываем все поля и ошибки
                setDepositAmount('');
                setSelectedDepositAmountButton(null);
                setDepositAmountError(null);
                onClose();
              }}
              className="bg-[#19191D] hover:bg-[#1E1E23] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
            >
              Отменить
            </button>
            <button 
              onClick={handleDeposit}
              className="bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
            >
              Пополнить
            </button>
          </div>
        </div>
      </div>
      ) : (
      <div className="flex flex-col gap-4">
        {/* Поле ввода суммы вывода */}
        <div className="relative">
          <label className="text-[#F9F8FC]/70 text-sm mb-1 block">Сумма вывода</label>
          <input 
            type="text" 
            value={withdrawAmount}
            onChange={handleAmountChange}
            className={`w-full bg-[#19191D] text-[#F9F8FC] p-4 rounded-lg outline-none ${amountError ? 'border border-red-500' : 'focus:ring-1 focus:ring-[#5C5ADC]'}`} 
            placeholder="Введите сумму"
          />
          {amountError && (
            <p className="text-red-500 text-sm mt-1">*{amountError}</p>
          )}
        </div>
        
        {/* Кнопки быстрого выбора суммы */}
        <div className="grid grid-cols-5 gap-2">
          <button 
            onClick={() => handleAmountSelect('8')}
            className={`${selectedAmountButton === '8' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">8</span> <span className="text-xs text-[#8C8C90]">АР</span>
          </button>
          <button 
            onClick={() => handleAmountSelect('16')}
            className={`${selectedAmountButton === '16' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">16</span> <span className="text-xs text-[#8C8C90]">АР</span>
          </button>
          <button 
            onClick={() => handleAmountSelect('32')}
            className={`${selectedAmountButton === '32' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">32</span> <span className="text-xs text-[#8C8C90]">АР</span>
          </button>
          <button 
            onClick={() => handleAmountSelect('64')}
            className={`${selectedAmountButton === '64' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">64</span> <span className="text-xs text-[#8C8C90]">АР</span>
          </button>
          <button 
            onClick={() => handleAmountSelect('10000')}
            className={`${selectedAmountButton === '10000' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">Макс.</span>
          </button>
        </div>
        
        {/* Поле ввода номера карты */}
        <div className="relative mt-2">
          <label className="text-[#F9F8FC]/70 text-sm mb-1 block">Номер карты</label>
          <input 
            type="text" 
            value={cardNumber}
            onChange={handleCardChange}
            maxLength={5}
            className={`w-full bg-[#19191D] text-[#F9F8FC] p-4 rounded-lg outline-none ${cardError ? 'border border-red-500' : 'focus:ring-1 focus:ring-[#5C5ADC]'}`} 
            placeholder="Введите номер карты"
          />
          {cardError && (
            <p className="text-red-500 text-sm mt-1">*{cardError}</p>
          )}
        </div>
        
        {/* Кнопки быстрого выбора карты */}
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => handleCardSelect('77777')}
            className={`${selectedCardButton === '77777' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">77777</span>
          </button>
          <button 
            onClick={() => handleCardSelect('77777')}
            className={`${selectedCardButton === '77777' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">77777</span>
          </button>
          <button 
            onClick={() => handleCardSelect('77777')}
            className={`${selectedCardButton === '77777' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">77777</span>
          </button>
          <button 
            onClick={() => handleCardSelect('77777')}
            className={`${selectedCardButton === '77777' ? 'bg-[#1D1D2E] border border-[#5C5ADC]' : 'bg-[#19191D] hover:bg-[#1E1E23]'} transition-colors py-2 px-1 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0`}
          >
            <span className="font-unbounded text-sm">77777</span>
          </button>
        </div>
        
        {/* Соглашение и кнопки действий */}
        <div className="mt-4">
          <p className="text-[#F9F8FC]/50 text-sm mb-4">
            Нажимая кнопку «Вывести»,<br/>
            я соглашаюсь с <a href="#" className="text-[#5C5ADC] hover:underline">«Договором оферты»</a>
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                // Сбрасываем все поля и ошибки
                setWithdrawAmount('');
                setCardNumber('');
                setSelectedAmountButton(null);
                setSelectedCardButton(null);
                setAmountError(null);
                setCardError(null);
                onClose();
              }}
              className="bg-[#19191D] hover:bg-[#1E1E23] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
            >
              Отменить
            </button>
            <button 
              onClick={handleWithdraw}
              className="bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
            >
              Вывести
            </button>
          </div>
        </div>
      </div>
      )}    
    </Modal>
  );
}