'use client';

import { useState, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';

// Типы для API заказов
export interface OrderCoordinate {
  world: string;
  x: number;
  y: number;
  z: number;
}

export interface OrderBranch {
  id: string;
  name: string;
  description: string | null;
  coordinates: OrderCoordinate[];
  imageUrls: string[];
  cell: {
    id: string;
    name: string;
  };
}

export interface OrderItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  amount: number;
  price: number;
  percentChance: number | null;
  rarity: string;
  isWithdrawable: boolean | null;
}

export interface Order {
  id: string;
  branch: OrderBranch;
  item: {
    item: OrderItem;
    amount: number;
  };
  price: number;
  status: 'Created' | 'InProgress' | 'Delivered' | 'Done' | 'Cancelled';
  createdAt: string;
}

// Функция для определения направления по координатам
export const getBranchDirection = (coordinates: OrderCoordinate[]): string => {
  if (!coordinates || coordinates.length === 0) return 'Неизвестно';
  
  // Находим координаты в мире "world" или "nether"
  const worldCoord = coordinates.find(coord => coord.world === 'world') || coordinates[0];
  
  const { x, z } = worldCoord;
  
  // Определяем максимальное по модулю значение
  const absX = Math.abs(x);
  const absZ = Math.abs(z);
  
  if (absX > absZ) {
    // X доминирует
    return x >= 0 ? 'ЗВ' : 'СВ'; // X+ = ЗВ, X- = СВ
  } else {
    // Z доминирует
    return z >= 0 ? 'ЖВ' : 'КВ'; // Z+ = ЖВ, Z- = КВ
  }
};

// Функция для форматирования координат в строку
export const formatCoordinates = (coordinates: OrderCoordinate[]): string => {
  const direction = getBranchDirection(coordinates);
  const worldCoord = coordinates.find(coord => coord.world === 'world') || coordinates[0];
  
  // Берем максимальное по модулю значение для отображения
  const absX = Math.abs(worldCoord.x);
  const absZ = Math.abs(worldCoord.z);
  const maxValue = Math.max(absX, absZ);
  
  return `${direction.toLowerCase()} ${maxValue}`;
};

export const useOrdersAPI = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  const pageSize = 10; // Количество заказов на страницу

  // Функция для загрузки заказов
  const fetchOrders = useCallback(async (page: number, append: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      // В dev режиме используем моковые данные
      if (process.env.NODE_ENV === 'development') {
        // Имитируем задержку API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Моковые данные для разработки
        const mockOrders: Order[] = Array.from({ length: pageSize }, (_, index) => ({
          id: `mock-${page}-${index + 1}`,
          branch: {
            id: `branch-${index + 1}`,
            name: `Филиал ${index + 1}`,
            description: null,
            coordinates: [
              {
                world: 'world',
                x: Math.floor(Math.random() * 400) - 200,
                y: 64,
                z: Math.floor(Math.random() * 400) - 200
              }
            ],
            imageUrls: [
              'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/barrier/icon',
              'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond_ore/icon'
            ],
            cell: {
              id: `cell-${index + 1}`,
              name: `Ячейка ${String.fromCharCode(65 + (index % 5))}${Math.floor(index / 5) + 1}`
            }
          },
          item: {
            item: {
              id: `item-${index + 1}`,
              name: `Предмет ${index + 1}`,
              description: `Описание предмета ${index + 1}`,
              imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/totem_of_undying/icon',
              amount: 1,
              price: Math.round((Math.random() * 100 + 10) * 100) / 100,
              percentChance: null,
              rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 5)],
              isWithdrawable: true
            },
            amount: 1
          },
          price: Math.random() * 100,
            status: (['Created', 'InProgress', 'Delivered', 'Done'] as const)[Math.floor(Math.random() * 4)],
            createdAt: new Date().toISOString()
        }));

        // Имитируем окончание данных после 5 страниц
        const hasMoreData = page < 5;
        
        if (append) {
          setOrders(prev => [...prev, ...mockOrders]);
        } else {
          setOrders(mockOrders);
        }
        
        setHasMore(hasMoreData);
        setCurrentPage(page);
        
        return;
      }

      // Продакшн код для реального API
      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch(
        `https://battle-api.chasman.engineer/api/v1/orders?page=${page}&pageSize=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка загрузки заказов: ${response.status}`);
      }

      const data: Order[] = await response.json();
      
      // Определяем, есть ли еще страницы
      const hasMoreData = data.length === pageSize;
      
      if (append) {
        setOrders(prev => [...prev, ...data]);
      } else {
        setOrders(data);
      }
      
      setHasMore(hasMoreData);
      setCurrentPage(page);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Ошибка загрузки заказов:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Загрузка первой страницы
  const loadInitial = useCallback(async () => {
    if (isInitialized) return;
    setIsInitialized(true);
    await fetchOrders(1, false);
  }, [fetchOrders, isInitialized]);

  // Загрузка следующей страницы
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchOrders(currentPage + 1, true);
  }, [fetchOrders, currentPage, loading, hasMore]);

  // Обновление данных
  const refresh = useCallback(async () => {
    setIsInitialized(false);
    setCurrentPage(1);
    setHasMore(true);
    await fetchOrders(1, false);
    setIsInitialized(true);
  }, [fetchOrders]);

  // Мягкое обновление (без индикатора загрузки)
  const softRefresh = useCallback(async () => {
    try {
      await fetchOrders(1, false);
      setCurrentPage(1);
      setHasMore(true);
    } catch (err) {
      console.error('Ошибка мягкого обновления заказов:', err);
    }
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    hasMore,
    loadInitial,
    loadMore,
    refresh,
    softRefresh,
    isInitialized
  };
};