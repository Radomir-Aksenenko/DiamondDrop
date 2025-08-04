'use client';

import { usePreloadedData } from '@/components/providers/DataPreloadProvider';

/**
 * Хук-обертка для совместимости с useCasesAPI
 * Использует предзагруженные данные вместо прямых API запросов
 * Это предотвращает дублирование запросов при загрузке страницы
 */
export default function usePreloadedCasesAPI() {
  const { cases, loading, error, refreshCases } = usePreloadedData();

  return {
    cases,
    loading,
    loadingMore: false, // Больше не поддерживаем бесконечную прокрутку
    error,
    hasMore: false, // Больше не поддерживаем бесконечную прокрутку
    loadMore: () => {}, // Заглушка для совместимости
    refresh: refreshCases,
  };
}