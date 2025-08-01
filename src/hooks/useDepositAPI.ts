'use client';

import { useState, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/config';
import useSPW from '@/hooks/useSPW';

/**
 * Интерфейс ответа API для создания депозита
 */
interface DepositResponse {
  url: string;
  code: string;
  card: string;
}

/**
 * Интерфейс для создания депозита
 */
interface CreateDepositRequest {
  amount: number;
}

/**
 * Хук для работы с API депозита
 */
export default function useDepositAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { makeAuthenticatedRequest, openPayment, spw } = useSPW();

  /**
   * Создает депозит и открывает окно оплаты
   * @param amount - сумма депозита
   */
  const createDeposit = useCallback(async (amount: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Создаем транзакцию на сервере
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/payments/deposit`,
        {
          method: 'POST',
          body: JSON.stringify({ amount }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Ошибка сервера: ${response.status}`);
      }

      const depositData: DepositResponse = await response.json();
      
      console.log('Депозит создан:', depositData);

      // Открываем окно оплаты с полученным кодом
      openPayment(depositData.code);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при создании депозита';
      console.error('Ошибка создания депозита:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [makeAuthenticatedRequest, openPayment]);

  /**
   * Настраивает обработчики событий оплаты
   * @param onSuccess - колбэк при успешной оплате
   * @param onError - колбэк при ошибке оплаты
   */
  const setupPaymentHandlers = useCallback((
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    // Обработчик успешного открытия окна оплаты
    const handleOpenPaymentResponse = () => {
      console.log('Окно оплаты успешно открыто, ждём оплату');
    };

    // Обработчик ошибки открытия окна оплаты
    const handleOpenPaymentError = (err: string) => {
      console.error(`Не удалось открыть окно оплаты: ${err}`);
      setError(`Не удалось открыть окно оплаты: ${err}`);
      onError?.(err);
    };

    // Обработчик успешной оплаты
    const handlePaymentResponse = () => {
      console.log('Оплата успешно произведена');
      setError(null);
      onSuccess?.();
    };

    // Обработчик ошибки оплаты
    const handlePaymentError = (err: string) => {
      console.error(`Оплатить не удалось! Ошибка: ${err}`);
      setError(`Оплатить не удалось! Ошибка: ${err}`);
      onError?.(err);
    };

    // Добавляем обработчики событий
    spw.on('openPaymentResponse', handleOpenPaymentResponse);
    spw.on('openPaymentError', handleOpenPaymentError);
    spw.on('paymentResponse', handlePaymentResponse);
    spw.on('paymentError', handlePaymentError);

    // Возвращаем функцию для очистки обработчиков
    return () => {
      spw.off('openPaymentResponse', handleOpenPaymentResponse);
      spw.off('openPaymentError', handleOpenPaymentError);
      spw.off('paymentResponse', handlePaymentResponse);
      spw.off('paymentError', handlePaymentError);
    };
  }, [spw]);

  return {
    createDeposit,
    setupPaymentHandlers,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}