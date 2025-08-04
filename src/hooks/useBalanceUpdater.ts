import { usePreloadedData } from '@/components/providers/DataPreloadProvider';

/**
 * Хук для локального обновления баланса пользователя
 * Позволяет избежать лишних запросов к API при операциях с балансом
 */
export const useBalanceUpdater = () => {
  const { updateBalanceLocally, decreaseBalanceLocally } = usePreloadedData();

  /**
   * Увеличивает баланс локально (например, при депозите)
   * @param amount - сумма для увеличения баланса
   */
  const increaseBalance = (amount: number) => {
    if (amount <= 0) {
      console.warn('⚠️ useBalanceUpdater: Попытка увеличить баланс на неположительную сумму:', amount);
      return;
    }
    updateBalanceLocally(amount);
  };

  /**
   * Уменьшает баланс локально (например, при покупке кейса)
   * @param amount - сумма для уменьшения баланса
   */
  const decreaseBalance = (amount: number) => {
    if (amount <= 0) {
      console.warn('⚠️ useBalanceUpdater: Попытка уменьшить баланс на неположительную сумму:', amount);
      return;
    }
    decreaseBalanceLocally(amount);
  };

  return {
    increaseBalance,
    decreaseBalance,
  };
};