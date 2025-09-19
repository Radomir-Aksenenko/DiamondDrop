'use client';

import { useState, useCallback, useEffect } from 'react';
import { getAuthToken } from '@/lib/auth';
import { API_BASE_URL, isDevelopment, DEV_CONFIG } from '@/lib/config';

/**
 * Интерфейс ответа API для получения RTP
 */
interface UpgradeResponse {
  rtp: number;
}

/**
 * Интерфейс запроса на выполнение апгрейда
 */
interface UpgradeRequest {
  selectedItemIds: string[];
  targetItemId: string;
}

/**
 * Интерфейс предмета в ответе апгрейда
 */
interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  amount: number;
  price: number;
  percentChance: number;
  rarity: string;
}

/**
 * Интерфейс ответа API для выполнения апгрейда
 */
interface UpgradeExecuteResponse {
  success: boolean;
  item: UpgradeItem | null;
}

/**
 * Хук для получения данных апгрейда из API
 * @returns {Object} Объект с RTP коэффициентом, состоянием загрузки и ошибкой
 */
export default function useUpgradeAPI() {
  const [rtp, setRtp] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState<boolean>(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

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
   * Выполняет апгрейд ресурсов
   * @param {UpgradeRequest} upgradeData - Данные для апгрейда
   * @returns {Promise<UpgradeExecuteResponse | null>} Результат апгрейда
   */
  const executeUpgrade = useCallback(async (upgradeData: UpgradeRequest): Promise<UpgradeExecuteResponse | null> => {
    try {
      setUpgradeLoading(true);
      setUpgradeError(null);

      // Проверяем, что мы в продакшене
      if (isDevelopment) {
        console.log('Апгрейд API доступен только в продакшене');
        
        // В dev режиме возвращаем моковый ответ
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockResponse: UpgradeExecuteResponse = {
          success: Math.random() > 0.5, // 50% шанс успеха
          item: Math.random() > 0.5 ? {
            id: "mock-item-id",
            name: "Тестовый предмет",
            description: "Описание тестового предмета",
            imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond/icon",
            amount: 1,
            price: 100,
            percentChance: 0,
            rarity: "Epic"
          } : null
        };
        
        return mockResponse;
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/upgrade`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*',
            'Authorization': token,
          },
          body: JSON.stringify(upgradeData)
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
      }

      const result: UpgradeExecuteResponse = await response.json();
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при выполнении апгрейда';
      setUpgradeError(errorMessage);
      console.error('Ошибка выполнения апгрейда:', errorMessage);
      return null;
    } finally {
      setUpgradeLoading(false);
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
    refresh,
    executeUpgrade,
    upgradeLoading,
    upgradeError
  };
}