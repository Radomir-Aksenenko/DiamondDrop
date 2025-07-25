'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';
import { API_BASE_URL, isDevelopment, DEV_CONFIG } from '@/lib/config';

/**
 * Интерфейс кейса из API
 */
export interface CaseData {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
}

/**
 * Интерфейс ответа API для кейсов
 */
interface CasesResponse {
  cases: CaseData[];
}

/**
 * Хук для получения кейсов из API с поддержкой пагинации
 * @returns {Object} Объект с данными кейсов, состоянием загрузки и функциями управления
 */
export default function useCasesAPI() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const pageSize = 50;

  /**
   * Загружает кейсы с указанной страницы
   */
  const fetchCases = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = getAuthToken();
      if (!token) {
        // Если нет токена, показываем пустой список
        if (append) {
          // Не добавляем ничего
        } else {
          setCases([]);
        }
        setHasMore(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/cases?page=${page}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
      }

      const data: CasesResponse = await response.json();
      
      if (append) {
        setCases(prev => [...prev, ...data.cases]);
      } else {
        setCases(data.cases);
      }
      
      // Если получили меньше кейсов чем запрашивали, значит это последняя страница
      setHasMore(data.cases.length === pageSize);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Ошибка при загрузке кейсов:', errorMessage);
      
      // При ошибке показываем пустой список
      if (!append) {
        setCases([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize]);

  /**
   * Загружает следующую страницу кейсов
   */
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchCases(nextPage, true);
    }
  }, [currentPage, loadingMore, hasMore, fetchCases]);

  /**
   * Обновляет список кейсов (загружает первую страницу заново)
   */
  const refresh = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchCases(1, false);
  }, [fetchCases]);

  // Загружаем первую страницу при монтировании
  useEffect(() => {
    fetchCases(1, false);
  }, [fetchCases]);

  return {
    cases,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}