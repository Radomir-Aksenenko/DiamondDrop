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
   * @param itemPrice - цена за единицу предмета
   * @returns Promise<{ success: boolean; totalAmount?: number }> - результат продажи и сумма
   */
  const sellItem = useCallback(async (itemId: string, quantity: number, itemPrice: number): Promise<{ success: boolean; totalAmount?: number }> => {
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
        const totalAmount = itemPrice * quantity;
        console.log(`✅ [SellAPI] Предмет ${itemId} успешно продан (количество: ${quantity}) на сумму: ${totalAmount}`);
        return { success: true, totalAmount };
      } else {
        const errorMessage = `Ошибка продажи: HTTP ${response.status}`;
        setError(errorMessage);
        console.error(`❌ [SellAPI] ${errorMessage}`);
        return { success: false };
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при продаже';
      setError(errorMessage);
      console.error('❌ [SellAPI] Ошибка продажи предмета:', errorMessage);
      return { success: false };
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