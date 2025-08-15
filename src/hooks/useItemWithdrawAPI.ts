'use client';

import { useState, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';

/**
 * Интерфейс запроса на вывод предмета
 */
interface ItemWithdrawRequest {
  itemId: string;
  amount: number;
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
   */
  const withdrawItem = useCallback(async (itemId: string, amount: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const requestBody: ItemWithdrawRequest = {
        itemId,
        amount
      };

      console.log('[ItemWithdrawAPI] Отправка запроса на вывод предмета:', { itemId, amount });

      // Создаем запрос на вывод предмета
      const response = await fetch(
        'https://battle-api.chasman.engineer/api/v1/orders',
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        // Обрабатываем ошибки
        try {
          const errorData: ItemWithdrawErrorResponse = await response.json();
          console.error('[ItemWithdrawAPI] Ошибка вывода предмета:', errorData);
          
          // Специальная обработка ошибки сервера (500)
          if (response.status === 500) {
            throw new Error('Ошибка вывода, обратитесь в тех поддержку');
          }
          
          throw new Error(errorData.message || `Ошибка сервера: ${response.status}`);
        } catch (err) {
          // Если не удалось распарсить JSON ошибки, но есть специальные статусы
          if (response.status === 500) {
            throw new Error('Ошибка вывода, обратитесь в тех поддержку');
          }
          
          // Если это уже Error из блока try выше, пробрасываем его
          if (err instanceof Error) {
            throw err;
          }
          
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
      }

      // Успешный вывод (код 200)
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