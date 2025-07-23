'use client';

import { useEffect, useState } from 'react';

/**
 * Интерфейс данных баннера из API
 */
export interface APIBanner {
  id: string;
  imageUrl: string;
  url: string;
}

/**
 * Хук для получения баннеров из API
 * @returns {Object} Объект с данными баннеров, состоянием загрузки и ошибкой
 */
export default function useBannersAPI() {
  const [banners, setBanners] = useState<APIBanner[]>([]);
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
   * Загружает данные баннеров из API
   */
  const fetchBannersData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        // Если токен не найден, устанавливаем один баннер
        setBanners([{
          id: 'default',
          imageUrl: '/Frame 116.png',
          url: '/news/1'
        }]);
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch('https://battle-api.chasman.engineer/api/v1/banners', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
      }

      const bannersData = await response.json();
      setBanners(bannersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Ошибка при загрузке баннеров:', errorMessage);
      
      // Если ошибка не связана с отсутствием токена, устанавливаем пустой массив
      if (err instanceof Error && err.message !== 'Токен авторизации не найден') {
        setBanners([]);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Обновляет данные баннеров
   */
  const refreshBanners = () => {
    fetchBannersData();
  };

  useEffect(() => {
    fetchBannersData();
  }, []);

  return {
    banners,
    loading,
    error,
    refreshBanners,
  };
}