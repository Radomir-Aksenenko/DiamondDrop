'use client';

import { useEffect, useState } from 'react';
import spw from '@/lib/spw';

/**
 * Хук для удобного использования SPWMini в компонентах
 * @returns {Object} Объект с данными пользователя и методами SPWMini
 */
export default function useSPW() {
  const [user, setUser] = useState(spw.user);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Обновляем состояние при получении данных пользователя
    const handleInitResponse = (userData: any) => {
      setUser(userData);
    };

    // Устанавливаем флаг готовности
    const handleReady = () => {
      setIsReady(true);
      setUser(spw.user);
    };

    // Добавляем обработчики событий
    spw.on('initResponse', handleInitResponse);
    spw.on('ready', handleReady);

    // Если SPWMini уже инициализирован, устанавливаем данные
    if (spw.user) {
      setUser(spw.user);
      setIsReady(true);
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
  const validateUser = (url: string, options?: RequestInit) => spw.validateUser(url, options);

  return {
    user,
    isReady,
    openURL,
    openPayment,
    validateUser,
    spw, // Предоставляем доступ к оригинальному экземпляру для расширенного использования
  };
}