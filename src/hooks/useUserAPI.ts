'use client';

import { usePreloadedData } from '@/components/providers/DataPreloadProvider';

/**
 * Интерфейс данных пользователя из API
 */
export interface APIUser {
  id: string;
  nickname: string;
  balance: number;
  level: number;
  avatarUrl: string;
  permission: string;
}

/**
 * Хук для получения данных пользователя из API
 * Теперь использует предзагруженные данные из DataPreloadProvider для избежания дублирования запросов
 * @returns {Object} Объект с данными пользователя, состоянием загрузки и ошибкой
 */
export default function useUserAPI() {
  const { user, loading, error, refreshUser, isAuthenticated } = usePreloadedData();

  return {
    user,
    loading,
    error,
    refreshUser,
    isAuthenticated,
  };
}