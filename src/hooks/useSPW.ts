'use client';

import { useEffect, useState } from 'react';
import spw from '@/lib/spw';
import { SPWUser, ValidateOptions } from '@/types/spw';
import { getAuthToken, hasAuthToken } from '@/lib/auth';

/**
 * Хук для удобного использования SPWMini в компонентах
 * @returns {Object} Объект с данными пользователя и методами SPWMini
 */
export default function useSPW() {
  const [user, setUser] = useState<SPWUser | null>(spw.user);
  const [authToken, setAuthToken] = useState<string | null>(getAuthToken());
  
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

    // Проверяем токен авторизации периодически
    const tokenCheckInterval = setInterval(() => {
      const currentToken = getAuthToken();
      if (currentToken !== authToken) {
        setAuthToken(currentToken);
      }
    }, 1000);

    // Очистка при размонтировании
    return () => {
      spw.off('initResponse', handleInitResponse);
      spw.off('ready', handleReady);
      clearInterval(tokenCheckInterval);
    };
  }, [authToken]);

  // Методы для работы с SPWMini
  const openURL = (url: string) => spw.openURL(url);
  const openPayment = (code: string) => spw.openPayment(code);
  const validateUser = (url: string, options?: ValidateOptions) => spw.validateUser(url, options);

  // Метод для выполнения авторизованных запросов
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Токен авторизации не найден. Пожалуйста, перезагрузите страницу.');
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  return {
    user,
    authToken,
    isAuthenticated: hasAuthToken(),
    openURL,
    openPayment,
    validateUser,
    makeAuthenticatedRequest,
    spw, // Предоставляем доступ к оригинальному экземпляру для расширенного использования
  };
}