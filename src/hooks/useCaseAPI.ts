'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';
import { API_BASE_URL, isDevelopment, DEV_CONFIG } from '@/lib/config';
import { CaseData } from './useCasesAPI';

/**
 * Хук для получения данных отдельного кейса из API
 * @param caseId - ID кейса для загрузки
 * @returns {Object} Объект с данными кейса, состоянием загрузки и ошибкой
 */
export default function useCaseAPI(caseId: string) {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Загружает данные кейса из API
   */
  const fetchCaseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        // Логирование удалено
        return DEV_CONFIG.mockCases.find(c => c.id === caseId) || null;
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch(
        `${API_BASE_URL}/cases/${caseId}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': token,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Кейс не найден');
        }
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
      }

      const data: CaseData = await response.json();
      setCaseData(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Error loading case:', errorMessage);
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  /**
   * Обновляет данные кейса
   */
  const refresh = () => {
    fetchCaseData();
  };

  // Загружаем данные при монтировании и при изменении ID кейса
  useEffect(() => {
    if (caseId) {
      fetchCaseData();
    }
  }, [caseId, fetchCaseData]);

  return {
    caseData,
    loading,
    error,
    refresh,
  };
}