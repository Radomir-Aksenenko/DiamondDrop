'use client';

import { useState, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/config';
import useSPW from '@/hooks/useSPW';

/**
 * Интерфейс запроса на вывод средств
 */
interface WithdrawRequest {
  amount: number;
  cardId: string;
}

/**
 * Интерфейс ответа API при ошибке
 */
interface WithdrawErrorResponse {
  message: string;
}

/**
 * Хук для работы с API вывода средств
 */
export default function useWithdrawAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { makeAuthenticatedRequest } = useSPW();

  /**
   * Создает запрос на вывод средств
   * @param amount - сумма вывода
   * @param cardId - ID карты для вывода
   */
  const createWithdraw = useCallback(async (amount: number, cardId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: WithdrawRequest = {
        amount,
        cardId
      };

      console.log('Отправляем запрос на вывод:', requestBody);

      // Создаем запрос на вывод средств
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/payments/withdraw`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        // Обрабатываем ошибки
        try {
          const errorData: WithdrawErrorResponse = await response.json();
          console.error('Ошибка вывода средств:', errorData);
          
          // Специальная обработка ошибки превышения лимита (429)
          if (response.status === 429) {
            console.log('⏰ Обнаружена ошибка превышения лимита при выводе:', errorData);
            throw new Error("Вы превысили лимит, попробуйте позже");
          }
          
          // Специальная обработка ошибки несуществующей карты
          if (errorData.message === "Receiver card not found.") {
            console.log('💳 Обнаружена ошибка несуществующей карты:', errorData);
            throw new Error("Данная карта не существует");
          }
          
          // Специальная обработка bad request при выводе
          if (response.status === 400) {
            console.log('❌ Обнаружена ошибка bad request при выводе:', errorData);
            throw new Error("Ошибка оплаты, обратитесь к тех поддержке");
          }
          
          throw new Error(errorData.message || `Ошибка сервера: ${response.status}`);
        } catch (err) {
          // Если не удалось распарсить JSON ошибки, но есть специальные статусы
          if (response.status === 429) {
            throw new Error("Вы превысили лимит, попробуйте позже");
          }
          if (response.status === 400) {
            throw new Error("Ошибка оплаты, обратитесь к тех поддержке");
          }
          
          // Если это уже Error из блока try выше, пробрасываем его
          if (err instanceof Error) {
            throw err;
          }
          
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
      }

      // Успешный вывод (код 200)
      console.log('Вывод средств успешно выполнен');
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при выводе средств';
      console.error('Ошибка создания запроса на вывод:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [makeAuthenticatedRequest]);

  return {
    createWithdraw,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}