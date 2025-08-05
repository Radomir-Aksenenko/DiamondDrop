import { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';
import { DEV_CONFIG } from '@/lib/config';

// Интерфейс для предмета инвентаря
export interface InventoryItem {
  item: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string;
    amount: number;
    price: number;
    percentChance: number;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  };
  amount: number;
}

// Интерфейс для ответа API
interface InventoryResponse {
  items: InventoryItem[];
  totalCount: number;
  hasMore: boolean;
}

export const useInventoryAPI = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 20; // Количество предметов на страницу



  // Функция для загрузки инвентаря
  const fetchInventory = useCallback(async (page: number, append: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch(
        `https://battle-api.chasman.engineer/api/v1/users/me/inventory?page=${page}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка загрузки инвентаря: ${response.status}`);
      }

      const data: InventoryItem[] = await response.json();
      
      // Определяем, есть ли еще страницы
      const hasMoreItems = data.length === pageSize;
      
      setItems(prevItems => append ? [...prevItems, ...data] : data);
      setHasMore(hasMoreItems);
      setTotalCount(prevCount => append ? prevCount + data.length : data.length);
      setCurrentPage(page);

      console.log(`📦 [InventoryAPI] Загружена страница ${page}, предметов: ${data.length}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('❌ [InventoryAPI] Ошибка загрузки инвентаря:', errorMessage);
      
      // В случае ошибки используем мок-данные в режиме разработки
      if (DEV_CONFIG.skipAuth && page === 1) {
        console.log('🔄 [InventoryAPI] Используем мок-данные как fallback');
        const mockItems: InventoryItem[] = [
          {
            item: {
              id: "mock-1",
              name: "Зачарованная книга",
              description: "Порыв ветра II",
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/enchanted_book/icon",
              amount: 1,
              price: 128,
              percentChance: 100,
              rarity: "Legendary"
            },
            amount: 21
          },
          {
            item: {
              id: "mock-2",
              name: "Тотем бессмертия",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/totem_of_undying/icon",
              amount: 1,
              price: 0.3,
              percentChance: 100,
              rarity: "Uncommon"
            },
            amount: 179
          },
          {
            item: {
              id: "mock-3",
              name: "Лук",
              description: "Сила V; Воспламенение; Откидывание II; Прочность III; Починка",
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/bow/icon",
              amount: 1,
              price: 20,
              percentChance: 100,
              rarity: "Rare"
            },
            amount: 35
          }
        ];
        
        setItems(append ? [...items, ...mockItems] : mockItems);
        setHasMore(false);
        setTotalCount(mockItems.length);
      }
    } finally {
      setLoading(false);
    }
  }, [items, pageSize]);

  // Функция для загрузки следующей страницы
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchInventory(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, fetchInventory]);

  // Функция для обновления инвентаря
  const refresh = useCallback(() => {
    setItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setTotalCount(0);
    fetchInventory(1, false);
  }, [fetchInventory]);

  // Начальная загрузка
  useEffect(() => {
    fetchInventory(1, false);
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    totalCount,
    currentPage,
    loadMore,
    refresh,
  };
};