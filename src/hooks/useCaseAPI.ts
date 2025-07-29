'use client';

import { useEffect, useState } from 'react';
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
  const fetchCaseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // В dev режиме используем моковые данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log('🔧 Dev режим: используем мок данные для кейса', caseId);
        
        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Ищем кейс в моковых данных
        const mockCase = DEV_CONFIG.mockCases.find(c => c.id === caseId);
        
        if (mockCase) {
          setCaseData(mockCase);
        } else {
          // Если кейс не найден, создаем дефолтный
          setCaseData({
            id: caseId,
            name: 'Мамонт',
            description: 'Каменный век, дикие земли, первобытные люди и... МАМОНТЫ! Да-да, именно с них началась история самого первого кейса.',
            imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
            price: 16,
            items: []
          });
        }
        return;
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
      console.error('Ошибка при загрузке кейса:', errorMessage);
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  };

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
  }, [caseId]);

  return {
    caseData,
    loading,
    error,
    refresh,
  };
}