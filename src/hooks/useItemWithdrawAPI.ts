'use client';

import { useState, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';
import { API_ENDPOINTS } from '@/lib/config';

/**
 * Интерфейс запроса на вывод предмета
 */
interface ItemWithdrawRequest {
  itemId: string;
  amount: number;
  branchId: string;
}

/**
 * Интерфейс ответа API при ошибке
 */
interface ItemWithdrawErrorResponse {
  message: string;
}

/**
 * Хук для работы с API вывода предметов из инвентаря
 */
export default function useItemWithdrawAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Создает запрос на вывод предмета
   * @param itemId - ID предмета для вывода
   * @param amount - количество предметов для вывода
   * @param branchId - ID филиала для вывода
   */
  const withdrawItem = useCallback(async (itemId: string, amount: number, branchId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const requestBody: ItemWithdrawRequest = {
        itemId,
        amount,
        branchId
      };

      console.log('[ItemWithdrawAPI] Отправка запроса на вывод предмета:', { itemId, amount, branchId });

      // Создаем запрос на вывод предмета
      const response = await fetch(API_ENDPOINTS.orders.list, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        try {
          const errorData: ItemWithdrawErrorResponse = await response.json();
          console.error('[ItemWithdrawAPI] Ошибка вывода предмета:', errorData);
          
          if (response.status === 500) {
            throw new Error('Ошибка вывода, обратитесь в тех поддержку');
          }
          
          if (errorData.message === "You have reached the maximum number of active orders.") {
            throw new Error('Вы достигли максимального количества активных заказов');
          }
          
          if (errorData.message === "The total order price must be at least 10. (Parameter 'Amount')") {
            throw new Error('Общая стоимость заказа должна быть не менее 10 АР.');
          }
          
          throw new Error(errorData.message || `Ошибка сервера: ${response.status}`);
        } catch (err) {
          if (response.status === 500) {
            throw new Error('Ошибка вывода, обратитесь в тех поддержку');
          }
          
          if (err instanceof Error) {
            throw err;
          }
          
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
      }

      console.log('[ItemWithdrawAPI] Предмет успешно отправлен на вывод');
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('[ItemWithdrawAPI] Ошибка при выводе предмета:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    withdrawItem,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}