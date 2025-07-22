'use client';

import React from 'react';
import useSPW from '@/hooks/useSPW';

/**
 * Компонент для демонстрации методов SPWMini
 */
export default function SPWActions() {
  const { openURL, openPayment, validateUser, isReady, user } = useSPW();

  // Обработчик для открытия URL
  const handleOpenURL = () => {
    openURL('https://spworlds.ru');
  };

  // Обработчик для проверки пользователя
  const handleValidateUser = async () => {
    try {
      // В реальном приложении здесь должен быть эндпоинт вашего бэкенда
      const isValid = await validateUser('/api/validate');
      alert(isValid ? 'Пользователь валиден' : 'Пользователь не валиден');
    } catch (error) {
      console.error('Ошибка валидации:', error);
      alert('Ошибка валидации пользователя');
    }
  };

  // Обработчик для открытия окна оплаты
  // В реальном приложении код транзакции должен приходить с бэкенда
  const handleOpenPayment = () => {
    alert('В реальном приложении здесь должен быть запрос к бэкенду для создания транзакции');
    // openPayment('payment_code_from_backend');
  };

  if (!isReady) {
    return <div className="p-4 text-center">Загрузка SPWMini...</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h2 className="text-xl font-bold">SPWorlds Mini App</h2>
      
      {user && (
        <div className="bg-[#19191D] p-4 rounded-lg">
          <h3 className="font-bold mb-2">Данные пользователя:</h3>
          <p>Имя: {user.username}</p>
          <p>UUID: {user.minecraftUUID}</p>
          <p>Уровень: {user.level || 'Не указан'}</p>
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <button 
          onClick={handleOpenURL} 
          className="bg-[#5C5ADC] hover:bg-[#4B49B0] text-white font-bold py-2 px-4 rounded"
        >
          Открыть SPWorlds
        </button>
        
        <button 
          onClick={handleValidateUser} 
          className="bg-[#5C5ADC] hover:bg-[#4B49B0] text-white font-bold py-2 px-4 rounded"
        >
          Проверить пользователя
        </button>
        
        <button 
          onClick={handleOpenPayment} 
          className="bg-[#5C5ADC] hover:bg-[#4B49B0] text-white font-bold py-2 px-4 rounded"
        >
          Открыть окно оплаты
        </button>
      </div>
    </div>
  );
}