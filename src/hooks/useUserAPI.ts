'use client';

import { useEffect, useState } from 'react';
import { getAuthToken, hasAuthToken } from '@/lib/auth';
import { API_ENDPOINTS, DEV_CONFIG, isDevelopment } from '@/lib/config';
import { APIUser } from '@/types/user';

/**
 * Хук для получения данных пользователя из API
 * @returns {Object} Объект с данными пользователя, состоянием загрузки и ошибкой
 */
export default function useUserAPI() {
  const [user, setUser] = useState<APIUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenState, setTokenState] = useState<string | null>(getAuthToken());

  /**
   * Загружает данные пользователя из API
   */
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        // Информационное логирование удалено
        setUser(DEV_CONFIG.mockUser);
        setLoading(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.users.me, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Error loading user data:', errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Обновляет данные пользователя
   */
  const refreshUser = () => {
    fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Отслеживаем изменения токена
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      const currentToken = getAuthToken();
      if (currentToken !== tokenState) {
        setTokenState(currentToken);
        fetchUserData();
      }
    }, 1000);

    return () => clearInterval(checkTokenInterval);
  }, [tokenState]);

  return {
    user,
    loading,
    error,
    refreshUser,
    isAuthenticated: hasAuthToken(),
  };
}