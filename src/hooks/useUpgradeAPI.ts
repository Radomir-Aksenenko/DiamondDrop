'use client';

import { useState, useCallback, useEffect } from 'react';
import { getAuthToken } from '@/lib/auth';
import { API_BASE_URL, isDevelopment, DEV_CONFIG } from '@/lib/config';

/**
 * Интерфейс ответа API для апгрейда
 */
interface UpgradeResponse {
  rtp: number;
}

/**
 * Хук для получения данных апгрейда из API
 * @returns {Object} Объект с RTP коэффициентом, состоянием загрузки и ошибкой
 */
export default function useUpgradeAPI() {
  const [rtp, setRtp] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Загружает данные апгрейда из API
   */
  const fetchUpgradeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // В dev режиме используем моковые данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Моковый RTP коэффициент
        setRtp(80);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        // Если нет токена, используем дефолтное значение
        setRtp(80);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/upgrade`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
      }

      const data: UpgradeResponse = await response.json();
      setRtp(data.rtp);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Ошибка загрузки данных апгрейда:', errorMessage);
      
      // В случае ошибки используем дефолтное значение
      setRtp(80);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Обновляет данные апгрейда
   */
  const refresh = useCallback(() => {
    fetchUpgradeData();
  }, [fetchUpgradeData]);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchUpgradeData();
  }, [fetchUpgradeData]);

  return {
    rtp,
    loading,
    error,
    refresh
  };
}