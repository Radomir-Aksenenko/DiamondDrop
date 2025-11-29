'use client';

import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '@/lib/config';
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
        API_ENDPOINTS.payments.deposit,
        {
          method: 'POST',
          body: JSON.stringify({ amount }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Специальная обработка ошибки превышения лимита (429)
        if (response.status === 429) {
          // Логирование удалено
          throw new Error("Вы превысили лимит, попробуйте позже");
        }
        
        // Специальная обработка ошибки недостатка средств
        if (response.status === 400 && errorData.error === "error._server.transactions.pay.senderNotEnoughBalance") {
          console.log('Insufficient funds error detected:', errorData);
          throw new Error("Недостаточно средств");
        }
        
        throw new Error(errorData.message || `Ошибка сервера: ${response.status}`);
      }

      const depositData: DepositResponse = await response.json();
      
      // Логирование удалено

      // Открываем окно оплаты с полученным кодом
      openPayment(depositData.code);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при создании депозита';
      console.error('Error creating deposit:', errorMessage);
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
      // Логирование удалено
    };

    // Обработчик ошибки открытия окна оплаты
    const handleOpenPaymentError = (err: string) => {
      console.error(`Failed to open payment window: ${err}`);
      setError("Не удалось открыть окно оплаты");
      onError?.("Не удалось открыть окно оплаты");
    };

    // Обработчик успешной оплаты
    const handlePaymentResponse = () => {
      // Логирование удалено
      setError(null);
      onSuccess?.();
    };

    // Обработчик ошибки оплаты
    const handlePaymentError = (err: string) => {
      console.error(`Payment failed! Error: ${err}`);
      
      // Проверяем на ошибку недостатка средств
      let errorMessage = "Ошибка оплаты";
      if (err.includes("senderNotEnoughBalance")) {
        console.log('Insufficient funds error detected in handlePaymentError:', err);
        errorMessage = "Недостаточно средств";
      }
      
      setError(errorMessage);
      onError?.(errorMessage);
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