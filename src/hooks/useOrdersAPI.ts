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
  status: 'Unknown' | 'Created' | 'Accepted' | 'InDelivery' | 'Delivered' | 'Confirmed' | 'Cancelled';
  createdAt: string;
}

// Функция для определения направления по координатам
export const getBranchDirection = (coordinates: OrderCoordinate[]): string => {
  if (!coordinates || coordinates.length === 0) {
    console.warn('getBranchDirection: пустые или некорректные координаты', coordinates);
    return 'Неизвестно';
  }
  
  // Находим координаты в мире "world" или "nether"
  const worldCoord = coordinates.find(coord => coord && coord.world === 'world') || coordinates[0];
  
  if (!worldCoord || typeof worldCoord.x !== 'number' || typeof worldCoord.z !== 'number') {
    console.warn('getBranchDirection: некорректные координаты мира', worldCoord);
    return 'Неизвестно';
  }
  
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
  if (!coordinates || coordinates.length === 0) {
    console.warn('formatCoordinates: пустые координаты');
    return 'Неизвестно';
  }
  
  const direction = getBranchDirection(coordinates);
  const worldCoord = coordinates.find(coord => coord && coord.world === 'world') || coordinates[0];
  
  if (!worldCoord || typeof worldCoord.x !== 'number' || typeof worldCoord.z !== 'number') {
    console.warn('formatCoordinates: некорректные координаты мира', worldCoord);
    return 'Неизвестно';
  }
  
  // Берем максимальное по модулю значение для отображения
  const absX = Math.abs(worldCoord.x);
  const absZ = Math.abs(worldCoord.z);
  const maxValue = Math.max(absX, absZ);
  
  return `${direction.toLowerCase()} ${maxValue}`;
};

// Функция валидации заказа
const validateOrder = (order: any): order is Order => {
  if (!order || typeof order !== 'object') {
    console.warn('validateOrder: заказ не является объектом', order);
    return false;
  }
  
  if (!order.id || typeof order.id !== 'string') {
    console.warn('validateOrder: некорректный ID заказа', order.id);
    return false;
  }
  
  if (!order.branch || typeof order.branch !== 'object') {
    console.warn('validateOrder: некорректный филиал', order.branch);
    return false;
  }
  
  if (!order.item || typeof order.item !== 'object' || !order.item.item) {
    console.warn('validateOrder: некорректный предмет', order.item);
    return false;
  }
  
  if (!order.status || typeof order.status !== 'string') {
    console.warn('validateOrder: некорректный статус', order.status);
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
        throw new Error(`Ошибка загрузки заказов: ${response.status} ${response.statusText}`);
      }

      const data: Order[] = await response.json();
      
      console.log(`useOrdersAPI: Получено ${data.length} заказов с API`);
      
      // Валидируем полученные данные
      const validOrders = data.filter(order => {
        const isValid = validateOrder(order);
        if (!isValid) {
          console.warn('useOrdersAPI: Невалидный заказ отфильтрован', order);
        }
        return isValid;
      });
      
      console.log(`useOrdersAPI: ${validOrders.length} из ${data.length} заказов прошли валидацию`);
      
      // Определяем, есть ли еще страницы
      const hasMoreData = validOrders.length === pageSize;
      
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
  }, [pageSize, loading]);

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
    isInitialized
  };
};