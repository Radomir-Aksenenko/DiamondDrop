'use client';

import { usePreloadedData } from '@/components/providers/DataPreloadProvider';

/**
 * Хук-обертка для совместимости с useUserAPI
 * Использует предзагруженные данные вместо прямых API запросов
 * Это предотвращает дублирование запросов при загрузке страницы
 */
export default function usePreloadedUserAPI() {
  const { user, loading, error, isAuthenticated, refreshUser } = usePreloadedData();

  return {
    user,
    loading,
    error,
    refreshUser,
    isAuthenticated,
  };
}