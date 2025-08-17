'use client';

import { useEffect, useState } from 'react';
import { getAuthToken, hasAuthToken } from '@/lib/auth';
import { API_ENDPOINTS, DEV_CONFIG, isDevelopment } from '@/lib/config';

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
  const [tokenState, setTokenState] = useState<string | null>(getAuthToken());

  /**
   * Загружает данные баннеров из API
   */
  const fetchBannersData = async () => {
    try {
      setLoading(true);
      setError(null);

      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        // Информационное логирование удалено
        setBanners([...DEV_CONFIG.mockBanners]);
        setLoading(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        // Если токен не найден, устанавливаем один баннер
        setBanners([{
          id: 'default',
          imageUrl: '/Frame116.png',
          url: '/news/1'
        }]);
        setLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.banners, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `${token}`,
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
      console.error('Error loading banners:', errorMessage);
      
      // Устанавливаем дефолтный баннер при ошибке
      setBanners([{
        id: 'default',
        imageUrl: '/Frame116.svg',
        url: '/news/1'
      }]);
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

  // Отслеживаем изменения токена
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      const currentToken = getAuthToken();
      if (currentToken !== tokenState) {
        setTokenState(currentToken);
        fetchBannersData();
      }
    }, 1000);

    return () => clearInterval(checkTokenInterval);
  }, [tokenState]);

  return {
    banners,
    loading,
    error,
    refreshBanners,
    isAuthenticated: hasAuthToken(),
  };
}