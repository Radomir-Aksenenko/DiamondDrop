'use client';

import { useEffect, useState } from 'react';
import { getAuthToken, hasAuthToken } from '@/lib/auth';

/**
 * Интерфейс данных пользователя из API
 */
export interface APIUser {
  id: string;
  nickname: string;
  balance: number;
  level: number;
  avatarUrl: string;
  permission: string;
}

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

      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch('https://battle-api.chasman.engineer/api/v1/users/me', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
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
      console.error('Ошибка при загрузке данных пользователя:', errorMessage);
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