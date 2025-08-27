'use client';

import { useState, useCallback } from 'react';
import useBranchesAPI from './useBranchesAPI';
import { getAuthToken } from '@/lib/auth';

// Типы для API заказов
export interface OrderCoordinate {
  world: string;
  x: number;
  y: number;
  z: number;
}

// Новый формат координат
export interface BranchCoordinates {
  overworld: {
    x: number;
    y: number;
    z: number;
  } | null;
  the_nether: {
    color: string;
    distance: number;
  } | null;
}

export interface OrderBranch {
  id: string;
  name: string;
  description: string | null;
  coordinates: BranchCoordinates;
  imageUrls: string[];
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
  cell: {
    id: string;
    name: string;
  } | null;
  item: {
    item: OrderItem;
    amount: number;
  };
  price: number;
  status: 'Unknown' | 'Created' | 'Accepted' | 'InDelivery' | 'Delivered' | 'Confirmed' | 'Cancelled';
  createdAt: string;
}

// Тип ответа API заказов
interface ApiOrdersResponse {
  items: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
}

function isApiOrdersResponse(value: unknown): value is ApiOrdersResponse {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  const items = obj.items;
  const totalCount = obj.totalCount;
  const page = obj.page;
  const pageSize = obj.pageSize;
  return Array.isArray(items)
    && typeof totalCount === 'number'
    && typeof page === 'number'
    && typeof pageSize === 'number';
}

// Функция для определения направления по координатам (новый формат)
export const getBranchDirection = (coordinates: BranchCoordinates): string => {
  if (!coordinates) {
    console.warn('getBranchDirection: пустые координаты');
    return 'Неизвестно';
  }
  
  // Приоритет: the_nether, затем overworld
  if (coordinates.the_nether && coordinates.the_nether.color) {
    const color = coordinates.the_nether.color.toLowerCase();
    switch (color) {
      case 'green':
        return 'ЗВ';
      case 'yellow':
        return 'ЖВ';
      case 'red':
        return 'КВ';
      case 'blue':
        return 'СВ';
      default:
        return 'НВ';
    }
  }
  
  if (coordinates.overworld) {
    const { x, z } = coordinates.overworld;
    const absX = Math.abs(x);
    const absZ = Math.abs(z);
    
    if (absX > absZ) {
      return x >= 0 ? 'ЗВ' : 'СВ';
    } else {
      return z >= 0 ? 'ЖВ' : 'КВ';
    }
  }
  
  console.warn('getBranchDirection: нет доступных координат', coordinates);
  return 'Неизвестно';
};

// Функция для форматирования координат в строку (новый формат)
export const formatCoordinates = (coordinates: BranchCoordinates, branchId?: string, branchesForDisplay?: Array<{id: string, name: string, coordinates: string}>): string => {
  // Если есть branchId и список филиалов, используем данные из useBranchesAPI
  if (branchId && branchesForDisplay) {
    const branchDisplay = branchesForDisplay.find(b => b.id === branchId);
    if (branchDisplay) {
      return branchDisplay.coordinates;
    }
  }
  
  // Fallback к локальной обработке координат
  if (coordinates?.the_nether) {
    const { color, distance } = coordinates.the_nether;
    let prefix = '';
    switch (color.toLowerCase()) {
      case 'green':
        prefix = 'зв';
        break;
      case 'yellow':
        prefix = 'жв';
        break;
      case 'red':
        prefix = 'кв';
        break;
      case 'blue':
        prefix = 'св';
        break;
      default:
        prefix = 'нв';
    }
    return `${prefix} ${distance}`;
  }
  
  if (coordinates?.overworld) {
    const { x, y, z } = coordinates.overworld;
    return `${x}, ${y}, ${z}`;
  }
  
  return 'Координаты не указаны';
};

// Функция валидации заказа
const validateOrder = (order: unknown): order is Order => {
  const o = order as Partial<Order> | null | undefined;
  if (!o || typeof o !== 'object') {
    console.warn('validateOrder: заказ не является объектом', order);
    return false;
  }

  if (!('id' in o) || typeof o.id !== 'string') {
    console.warn('validateOrder: некорректный ID заказа', o.id);
    return false;
  }

  if (!('branch' in o) || typeof o.branch !== 'object' || !o.branch) {
    console.warn('validateOrder: некорректный филиал', o.branch);
    return false;
  }

  if (!('item' in o) || typeof o.item !== 'object' || !o.item || !('item' in o.item)) {
    console.warn('validateOrder: некорректный предмет', o.item);
    return false;
  }

  if (!('status' in o) || typeof o.status !== 'string') {
    console.warn('validateOrder: некорректный статус', o.status);
    return false;
  }

  return true;
};

// Функция создания моковых данных с лучшей структурой
const createMockOrder = (page: number, index: number): Order => {
  const statuses: Order['status'][] = ['Unknown', 'Created', 'Accepted', 'InDelivery', 'Delivered', 'Confirmed', 'Cancelled'];
  const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  
  const orderId = `mock-${page}-${index + 1}`;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  
  console.log(`Создание мокового заказа: ID=${orderId}, статус=${status}, редкость=${rarity}`);
  
  return {
    id: orderId,
    branch: {
      id: `branch-${index + 1}`,
      name: `Филиал ${index + 1}`,
      description: null,
      coordinates: {
        overworld: {
          x: Math.floor(Math.random() * 400) - 200,
          y: 64,
          z: Math.floor(Math.random() * 400) - 200
        },
        the_nether: {
          color: ['green', 'yellow', 'red', 'blue'][Math.floor(Math.random() * 4)],
          distance: Math.floor(Math.random() * 1000) + 100
        }
      },
      imageUrls: [
        'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/barrier/icon',
        'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond_ore/icon'
      ]
    },
    cell: {
      id: `cell-${index + 1}`,
      name: `Ячейка ${String.fromCharCode(65 + (index % 5))}${Math.floor(index / 5) + 1}`
    },
    item: {
      item: {
        id: `item-${index + 1}`,
        name: `Предмет ${index + 1}`,
        description: `Описание предмета ${index + 1}`,
        imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/totem_of_undying/icon',
        amount: Math.floor(Math.random() * 5) + 1,
        price: Math.round((Math.random() * 100 + 10) * 100) / 100,
        percentChance: Math.round(Math.random() * 50 * 10) / 10,
        rarity: rarity,
        isWithdrawable: true
      },
      amount: Math.floor(Math.random() * 3) + 1
    },
    price: Math.random() * 100,
    status: status,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  };
};

export const useOrdersAPI = (options?: { activeOnly?: boolean }) => {
  const activeOnly = options?.activeOnly === true;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [responsePageSize, setResponsePageSize] = useState<number>(pageSize);
  
  // Интеграция с useBranchesAPI для получения координат
   const { branchesForDisplay } = useBranchesAPI();

  const pageSize = 15; // Количество заказов на страницу (обновлено под новый API)

  // Функция для загрузки заказов
  const fetchOrders = useCallback(async (page: number, append: boolean = false) => {
    console.log(`fetchOrders: страница=${page}, добавить=${append}, загружается=${loading}`);
    
    setLoading(true);
    setError(null);

    try {
      // В dev режиме используем моковые данные
      if (process.env.NODE_ENV === 'development') {
        console.log('useOrdersAPI: Используются моковые данные для разработки');
        
        // Имитируем задержку API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Моковые данные для разработки
        const mockOrders: Order[] = Array.from({ length: pageSize }, (_, index) => 
          createMockOrder(page, index)
        );

        console.log(`useOrdersAPI: Создано ${mockOrders.length} моковых заказов для страницы ${page}`);

        // Имитируем окончание данных после 5 страниц
        const hasMoreData = page < 5;
        
        if (append) {
          setOrders(prev => {
            const newOrders = [...prev, ...mockOrders];
            console.log(`useOrdersAPI: Общее количество заказов после добавления: ${newOrders.length}`);
            return newOrders;
          });
        } else {
          setOrders(mockOrders);
          console.log(`useOrdersAPI: Установлено ${mockOrders.length} заказов`);
        }
        
        setHasMore(hasMoreData);
        setCurrentPage(page);
        
        return;
      }

      // Продакшн код для реального API
      const token = getAuthToken();
      if (!token) {
        console.warn('useOrdersAPI: Токен авторизации не найден');
        throw new Error('Токен авторизации не найден');
      }

      console.log('useOrdersAPI: Загрузка данных с реального API');
      
      const response = await fetch(
        `https://battle-api.chasman.engineer/api/v1/orders?page=${page}&pageSize=${pageSize}&activeOnly=${activeOnly ? 'true' : 'false'}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка загрузки заказов: ${response.status} ${response.statusText}`);
      }

      const raw = (await response.json()) as unknown;
      let apiItems: Order[] = [];
      let apiTotalCount = 0;
      if (isApiOrdersResponse(raw)) {
        apiItems = raw.items;
        apiTotalCount = raw.totalCount;
        setResponsePageSize(raw.pageSize);
      } else if (Array.isArray(raw)) {
        apiItems = raw as Order[];
        apiTotalCount = apiItems.length;
        setResponsePageSize(pageSize);
      } else {
        apiItems = [];
        apiTotalCount = 0;
        setResponsePageSize(pageSize);
      }
      
      console.log(`useOrdersAPI: Получено ${apiItems.length} заказов с API (totalCount=${apiTotalCount})`);
      
      // Валидируем полученные данные
      const validOrders = apiItems.filter(order => {
        const isValid = validateOrder(order);
        if (!isValid) {
          console.warn('useOrdersAPI: Невалидный заказ отфильтрован', order);
        }
        return isValid;
      });
      
      console.log(`useOrdersAPI: ${validOrders.length} из ${apiItems.length} заказов прошли валидацию`);
      
      // Определяем, есть ли еще страницы
      const hasMoreData = page * pageSize < apiTotalCount;
      
      if (append) {
        setOrders(prev => {
          const newOrders = [...prev, ...validOrders];
          console.log(`useOrdersAPI: Общее количество заказов после добавления: ${newOrders.length}`);
          return newOrders;
        });
      } else {
        setOrders(validOrders);
        console.log(`useOrdersAPI: Установлено ${validOrders.length} заказов`);
      }
      
      setHasMore(hasMoreData);
      setCurrentPage(page);
      setTotalCount(apiTotalCount);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('useOrdersAPI: Ошибка загрузки заказов:', err);
      setError(errorMessage);
      
      // При ошибке в dev режиме показываем хотя бы один мок-заказ для отладки
      if (process.env.NODE_ENV === 'development' && !append) {
        console.log('useOrdersAPI: Создание fallback мок-заказа из-за ошибки');
        const fallbackOrder = createMockOrder(1, 0);
        setOrders([fallbackOrder]);
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize, loading, activeOnly]);

  // Загрузка первой страницы
  const loadInitial = useCallback(async () => {
    if (isInitialized) {
      console.log('useOrdersAPI: loadInitial - уже инициализировано, пропускаем');
      return;
    }
    console.log('useOrdersAPI: loadInitial - инициализация');
    setIsInitialized(true);
    await fetchOrders(1, false);
  }, [fetchOrders, isInitialized]);

  // Загрузка следующей страницы
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {
      console.log(`useOrdersAPI: loadMore - пропускаем (загружается=${loading}, есть еще=${hasMore})`);
      return;
    }
    console.log(`useOrdersAPI: loadMore - загрузка страницы ${currentPage + 1}`);
    await fetchOrders(currentPage + 1, true);
  }, [fetchOrders, currentPage, loading, hasMore]);

  // Обновление данных
  const refresh = useCallback(async () => {
    console.log('useOrdersAPI: refresh - полное обновление данных');
    setIsInitialized(false);
    setCurrentPage(1);
    setHasMore(true);
    await fetchOrders(1, false);
    setIsInitialized(true);
  }, [fetchOrders]);

  // Мягкое обновление (без индикатора загрузки)
  const softRefresh = useCallback(async () => {
    console.log('useOrdersAPI: softRefresh - мягкое обновление');
    try {
      await fetchOrders(1, false);
      setCurrentPage(1);
      setHasMore(true);
    } catch (err) {
      console.error('useOrdersAPI: Ошибка мягкого обновления заказов:', err);
    }
  }, [fetchOrders]);

  // Подтверждение заказа
  const confirmOrder = useCallback(async (orderId: string): Promise<boolean> => {
    console.log(`useOrdersAPI: confirmOrder - подтверждение заказа ${orderId}`);
    
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('useOrdersAPI: Токен авторизации не найден');
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch(
        `https://battle-api.chasman.engineer/api/v1/orders/${orderId}/confirm`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Authorization': token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка подтверждения заказа: ${response.status} ${response.statusText}`);
      }

      console.log(`useOrdersAPI: Заказ ${orderId} успешно подтвержден`);
      
      // Обновляем статус заказа локально
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'Confirmed' as const }
            : order
        )
      );

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error(`useOrdersAPI: Ошибка подтверждения заказа ${orderId}:`, err);
      setError(errorMessage);
      return false;
    }
  }, []);

  console.log(`useOrdersAPI: Текущее состояние - заказов: ${orders.length}, загружается: ${loading}, ошибка: ${error}, инициализировано: ${isInitialized}`);

  return {
    orders,
    loading,
    error,
    hasMore,
    loadInitial,
    loadMore,
    refresh,
    softRefresh,
    confirmOrder,
    isInitialized,
    branchesForDisplay,
    totalCount,
    pageSize: responsePageSize
  };
};