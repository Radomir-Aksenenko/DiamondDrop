'use client';

import { useState, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/config';

/**
 * Интерфейс для ответа API продажи
 */
interface SellResponse {
  success: boolean;
  message?: string;
}

/**
 * Хук для продажи предметов из инвентаря
 */
export const useSellAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Продает предмет из инвентаря
   * @param itemId - ID предмета для продажи
   * @param quantity - количество предметов для продажи
   * @returns Promise<boolean> - true если продажа успешна
   */
  const sellItem = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch(
        `${API_BASE_URL}/users/me/inventory/${itemId}/sell?quantity=${quantity}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Authorization': token,
          },
          body: '',
        }
      );

      // Проверяем статус ответа
      if (response.status === 200) {
        console.log(`✅ [SellAPI] Предмет ${itemId} успешно продан (количество: ${quantity})`);
        return true;
      } else {
        const errorMessage = `Ошибка продажи: HTTP ${response.status}`;
        setError(errorMessage);
        console.error(`❌ [SellAPI] ${errorMessage}`);
        return false;
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при продаже';
      setError(errorMessage);
      console.error('❌ [SellAPI] Ошибка продажи предмета:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Очищает ошибку
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sellItem,
    isLoading,
    error,
    clearError,
  };
};