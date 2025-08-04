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
        
        // Специальная обработка ошибки превышения лимита (429)
        if (response.status === 429) {
          console.log('⏰ Обнаружена ошибка превышения лимита:', errorData);
          throw new Error("Вы превысили лимит, попробуйте позже");
        }
        
        // Специальная обработка ошибки недостатка средств
        if (response.status === 400 && errorData.error === "error._server.transactions.pay.senderNotEnoughBalance") {
          console.log('💳 Обнаружена ошибка недостатка средств:', errorData);
          throw new Error("Недостаточно средств");
        }
        
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
      setError("Не удалось открыть окно оплаты");
      onError?.("Не удалось открыть окно оплаты");
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
      
      // Проверяем на ошибку недостатка средств
      let errorMessage = "Ошибка оплаты";
      if (err.includes("senderNotEnoughBalance")) {
        console.log('💳 Обнаружена ошибка недостатка средств в handlePaymentError:', err);
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