'use client';

import { usePreloadedData } from '@/components/providers/DataPreloadProvider';

/**
 * Хук-обертка для совместимости с useBannersAPI
 * Использует предзагруженные данные вместо прямых API запросов
 * Это предотвращает дублирование запросов при загрузке страницы
 */
export default function usePreloadedBannersAPI() {
  const { banners, loading, error, isAuthenticated, refreshBanners } = usePreloadedData();

  return {
    banners,
    loading,
    error,
    refreshBanners,
    isAuthenticated,
  };
}