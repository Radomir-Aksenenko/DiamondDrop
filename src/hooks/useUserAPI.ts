'use client';

import { useEffect, useState } from 'react';

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

  /**
   * Получает токен авторизации из куки
   */
  const getAuthToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith('authToken=')
    );
    
    return authCookie ? authCookie.split('=')[1] : null;
  };

  /**
   * Загружает данные пользователя из API
   */
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch('https://battle-api.chasman.engineer/api/v1/users/me', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': token,
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

  return {
    user,
    loading,
    error,
    refreshUser,
  };
}