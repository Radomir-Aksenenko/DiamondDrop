import { useMemo } from 'react';

/**
 * Хук для склонения русских слов в зависимости от числа
 */
export const usePluralize = () => {
  const pluralize = useMemo(() => {
    return (count: number, singular: string, few: string, many: string): string => {
      const absCount = Math.abs(count);
      const lastDigit = absCount % 10;
      const lastTwoDigits = absCount % 100;
      
      // Особые случаи для чисел 11-14
      if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return many;
      }
      
      // Обычные правила склонения
      if (lastDigit === 1) {
        return singular;
      } else if (lastDigit >= 2 && lastDigit <= 4) {
        return few;
      } else {
        return many;
      }
    };
  }, []);

  const pluralizeItems = useMemo(() => {
    return (count: number): string => {
      return pluralize(count, 'Предмет', 'Предмета', 'Предметов');
    };
  }, [pluralize]);

  const pluralizeOrders = useMemo(() => {
    return (count: number): string => {
      return pluralize(count, 'Заказ', 'Заказа', 'Заказов');
    };
  }, [pluralize]);

  return {
    pluralize,
    pluralizeItems,
    pluralizeOrders
  };
};