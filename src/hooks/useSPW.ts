'use client';

import { useEffect, useState } from 'react';
import spw from '@/lib/spw';
import { SPWUser, ValidateOptions } from '@/types/spw';

/**
 * Хук для удобного использования SPWMini в компонентах
 * @returns {Object} Объект с данными пользователя и методами SPWMini
 */
export default function useSPW() {
  const [user, setUser] = useState<SPWUser | null>(spw.user);
  useEffect(() => {
    // Обновляем состояние при получении данных пользователя
    const handleInitResponse = (userData: SPWUser) => {
      setUser(userData);
    };

    // Устанавливаем флаг готовности
    const handleReady = () => {
      setUser(spw.user);
    };

    // Добавляем обработчики событий
    spw.on('initResponse', handleInitResponse);
    spw.on('ready', handleReady);

    // Если SPWMini уже инициализирован, устанавливаем данные
    if (spw.user) {
      setUser(spw.user);
    }

    // Очистка при размонтировании
    return () => {
      spw.off('initResponse', handleInitResponse);
      spw.off('ready', handleReady);
    };
  }, []);

  // Методы для работы с SPWMini
  const openURL = (url: string) => spw.openURL(url);
  const openPayment = (code: string) => spw.openPayment(code);
  const validateUser = (url: string, options?: ValidateOptions) => spw.validateUser(url, options);

  return {
    user,
    openURL,
    openPayment,
    validateUser,
    spw, // Предоставляем доступ к оригинальному экземпляру для расширенного использования
  };
}