'use client';

import { useState, useCallback, useEffect } from 'react';
import { getAuthToken } from '@/lib/auth';
import { API_BASE_URL, isDevelopment, DEV_CONFIG } from '@/lib/config';

/**
 * Интерфейс ответа API для получения RTP
 */
interface UpgradeResponse {
  rtp: number;
}

/**
 * Интерфейс запроса на выполнение апгрейда
 */
interface UpgradeRequest {
  selectedItemIds: string[];
  targetItemId: string;
}

/**
 * Интерфейс предмета в ответе апгрейда
 */
interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  amount: number;
  price: number;
  percentChance: number;
  rarity: string;
}

/**
 * Интерфейс ответа API для выполнения апгрейда
 */
interface UpgradeExecuteResponse {
  success: boolean;
  item: UpgradeItem | null;
}

/**
 * Интерфейс предмета в инвентаре для апгрейда
 */
export interface UpgradeInventoryItem {
  item: UpgradeItem;
  amount: number;
}

/**
 * Интерфейс ответа API для получения предметов апгрейда
 */
// API returns direct array of items
type UpgradeItemsResponse = UpgradeInventoryItem[];

/**
 * Хук для получения данных апгрейда из API
 * @returns {Object} Объект с RTP коэффициентом, состоянием загрузки и ошибкой
 */
export default function useUpgradeAPI() {
  const [rtp, setRtp] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState<boolean>(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradeItems, setUpgradeItems] = useState<UpgradeInventoryItem[]>([]);
  const [upgradeItemsLoading, setUpgradeItemsLoading] = useState<boolean>(false);
  const [upgradeItemsError, setUpgradeItemsError] = useState<string | null>(null);

  /**
   * Загружает данные апгрейда из API
   */
  const fetchUpgradeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // В dev режиме используем моковые данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Моковый RTP коэффициент
        setRtp(80);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        // Если нет токена, используем дефолтное значение
        setRtp(80);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/upgrade`,
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

      const data: UpgradeResponse = await response.json();
      setRtp(data.rtp);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Ошибка загрузки данных апгрейда:', errorMessage);
      
      // В случае ошибки используем дефолтное значение
      setRtp(80);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Загружает предметы доступные для апгрейда
   * @param {number} minPrice - Минимальная цена предметов для фильтрации
   */
  const fetchUpgradeItems = useCallback(async (minPrice: number = 0) => {
    try {
      setUpgradeItemsLoading(true);
      setUpgradeItemsError(null);

      const token = getAuthToken();
      if (!token) {
        setUpgradeItemsError('Токен авторизации не найден');
        setUpgradeItems([]);
        return;
      }

      // Формируем URL безопасно
      const url = new URL(`${API_BASE_URL}/upgrade/items`);
      url.searchParams.set('min_price', String(minPrice));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
      }

      // Читаем как текст и затем парсим JSON вручную, чтобы уметь диагностировать ошибки парсинга
      const rawText = await response.text();
      let json: any = [];
      try {
        json = rawText ? JSON.parse(rawText) : [];
      } catch (e) {
        throw new Error('Некорректный JSON в ответе API');
      }

      // Приводим ответ к массиву элементов
      const rawItems: any[] = Array.isArray(json)
        ? json
        : (Array.isArray(json?.items) ? json.items : []);

      // Нормализация полей и защита от разночтений (snake_case/camelCase, кавычки в URL и т.п.)
      const validRarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
      const normalized: UpgradeInventoryItem[] = rawItems
        .map((entry: any) => {
          const rawItem = entry?.item ?? entry;
          if (!rawItem || !rawItem.id) return null;

          const img = String(rawItem.imageUrl ?? rawItem.image_url ?? '').replace(/[`"]/g, '').trim();
          const rarityRaw = String(rawItem.rarity ?? 'Common');
          const rarity = validRarities.includes(rarityRaw) ? rarityRaw : 'Common';

          return {
            item: {
              id: String(rawItem.id),
              name: String(rawItem.name ?? ''),
              description: rawItem.description == null ? '' : String(rawItem.description),
              imageUrl: img,
              amount: Number(rawItem.amount ?? 1),
              price: Number(rawItem.price ?? 0),
              percentChance: Number(rawItem.percentChance ?? rawItem.percent_chance ?? 0),
              rarity,
            },
            amount: Number(entry?.amount ?? rawItem.amount ?? 0),
          } as UpgradeInventoryItem;
        })
        .filter((it: any): it is UpgradeInventoryItem => it !== null);

      setUpgradeItems(normalized);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setUpgradeItemsError(errorMessage);
      console.error('Ошибка загрузки предметов для апгрейда:', errorMessage);
      setUpgradeItems([]);
    } finally {
      setUpgradeItemsLoading(false);
    }
  }, []);

  /**
   * Выполняет апгрейд ресурсов
   * @param {UpgradeRequest} upgradeData - Данные для апгрейда
   * @returns {Promise<UpgradeExecuteResponse | null>} Результат апгрейда
   */
  const executeUpgrade = useCallback(async (upgradeData: UpgradeRequest): Promise<UpgradeExecuteResponse | null> => {
    try {
      setUpgradeLoading(true);
      setUpgradeError(null);

      // Проверяем, что мы в продакшене
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log('Апгрейд API доступен только при отключённом skipAuth в dev или в продакшене');
        
        // В dev режиме возвращаем моковый ответ
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockResponse: UpgradeExecuteResponse = {
          success: Math.random() > 0.5, // 50% шанс успеха
          item: Math.random() > 0.5 ? {
            id: "mock-item-id",
            name: "Тестовый предмет",
            description: "Описание тестового предмета",
            imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond/icon",
            amount: 1,
            price: 100,
            percentChance: 0,
            rarity: "Epic"
          } : null
        };
        
        return mockResponse;
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch(
        `${API_BASE_URL}/upgrade`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*',
            'Authorization': token,
          },
          body: JSON.stringify(upgradeData)
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
      }

      const result: UpgradeExecuteResponse = await response.json();
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при выполнении апгрейда';
      setUpgradeError(errorMessage);
      console.error('Ошибка выполнения апгрейда:', errorMessage);
      return null;
    } finally {
      setUpgradeLoading(false);
    }
  }, []);

  /**
   * Обновляет данные апгрейда
   */
  const refresh = useCallback(() => {
    fetchUpgradeData();
  }, [fetchUpgradeData]);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchUpgradeData();
  }, [fetchUpgradeData]);

  return {
    rtp,
    loading,
    error,
    refresh,
    executeUpgrade,
    upgradeLoading,
    upgradeError,
    upgradeItems,
    upgradeItemsLoading,
    upgradeItemsError,
    fetchUpgradeItems
  };
}