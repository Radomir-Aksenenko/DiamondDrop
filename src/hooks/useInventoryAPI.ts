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
    isWithdrawable: boolean;
  };
  amount: number;
}



export const useInventoryAPI = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Состояние для инвентаря доступного для апгрейда
  const [upgradeInventory, setUpgradeInventory] = useState<InventoryItem[]>([]);
  const [upgradeInventoryLoading, setUpgradeInventoryLoading] = useState(false);
  const [upgradeInventoryError, setUpgradeInventoryError] = useState<string | null>(null);

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

      console.log(`[InventoryAPI] Page ${page} loaded, items: ${data.length}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('[InventoryAPI] Error loading inventory:', errorMessage);
      
      // В случае ошибки используем мок-данные в режиме разработки
      if (DEV_CONFIG.skipAuth && page === 1) {
        console.log('[InventoryAPI] Using mock data as fallback');
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
              rarity: "Legendary",
              isWithdrawable: false
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
              rarity: "Uncommon",
              isWithdrawable: true
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
              rarity: "Rare",
              isWithdrawable: true
            },
            amount: 35
          },
          {
            item: {
              id: "mock-4",
              name: "Алмазный меч",
              description: "Острота V; Заговор огня II; Мародёрство III; Прочность III; Починка",
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond_sword/icon",
              amount: 1,
              price: 45,
              percentChance: 100,
              rarity: "Epic",
              isWithdrawable: true
            },
            amount: 12
          },
          {
            item: {
              id: "mock-5",
              name: "Незеритовая кирка",
              description: "Эффективность V; Удача III; Прочность III; Починка",
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/netherite_pickaxe/icon",
              amount: 1,
              price: 89,
              percentChance: 100,
              rarity: "Legendary",
              isWithdrawable: true
            },
            amount: 7
          },
          {
            item: {
              id: "mock-6",
              name: "Элитры",
              description: "Прочность III; Починка",
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/elytra/icon",
              amount: 1,
              price: 156,
              percentChance: 100,
              rarity: "Legendary",
              isWithdrawable: false
            },
            amount: 3
          },
          {
            item: {
              id: "mock-7",
              name: "Золотое яблоко",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/golden_apple/icon",
              amount: 64,
              price: 2.5,
              percentChance: 100,
              rarity: "Rare",
              isWithdrawable: true
            },
            amount: 256
          },
          {
            item: {
              id: "mock-8",
              name: "Зачарованное золотое яблоко",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/enchanted_golden_apple/icon",
              amount: 1,
              price: 78,
              percentChance: 100,
              rarity: "Legendary",
              isWithdrawable: false
            },
            amount: 15
          },
          {
            item: {
              id: "mock-9",
              name: "Алмазная броня",
              description: "Защита IV; Прочность III; Починка",
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond_chestplate/icon",
              amount: 1,
              price: 67,
              percentChance: 100,
              rarity: "Epic",
              isWithdrawable: true
            },
            amount: 8
          },
          {
            item: {
              id: "mock-10",
              name: "Трезубец",
              description: "Верность III; Пронзание V; Прочность III; Починка",
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/trident/icon",
              amount: 1,
              price: 134,
              percentChance: 100,
              rarity: "Legendary",
              isWithdrawable: true
            },
            amount: 4
          },
          {
            item: {
              id: "mock-11",
              name: "Шалкеровый ящик",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/shulker_box/icon",
              amount: 1,
              price: 23,
              percentChance: 100,
              rarity: "Rare",
              isWithdrawable: true
            },
            amount: 27
          },
          {
            item: {
              id: "mock-12",
              name: "Маяк",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/beacon/icon",
              amount: 1,
              price: 189,
              percentChance: 100,
              rarity: "Legendary",
              isWithdrawable: false
            },
            amount: 2
          },
          {
            item: {
              id: "mock-13",
              name: "Незеритовый слиток",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/netherite_ingot/icon",
              amount: 64,
              price: 12,
              percentChance: 100,
              rarity: "Epic",
              isWithdrawable: true
            },
            amount: 128
          },
          {
            item: {
              id: "mock-14",
              name: "Алмаз",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond/icon",
              amount: 64,
              price: 3.2,
              percentChance: 100,
              rarity: "Uncommon",
              isWithdrawable: true
            },
            amount: 512
          },
          {
            item: {
              id: "mock-15",
              name: "Изумруд",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/emerald/icon",
              amount: 64,
              price: 4.1,
              percentChance: 100,
              rarity: "Rare",
              isWithdrawable: true
            },
            amount: 256
          },
          {
            item: {
              id: "mock-16",
              name: "Звезда Нижнего мира",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/nether_star/icon",
              amount: 1,
              price: 234,
              percentChance: 100,
              rarity: "Legendary",
              isWithdrawable: false
            },
            amount: 6
          },
          {
            item: {
              id: "mock-17",
              name: "Яйцо дракона",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/dragon_egg/icon",
              amount: 1,
              price: 500,
              percentChance: 100,
              rarity: "Legendary",
              isWithdrawable: false
            },
            amount: 1
          },
          {
            item: {
              id: "mock-18",
              name: "Кольчужная броня",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/chainmail_chestplate/icon",
              amount: 1,
              price: 30,
              percentChance: 100,
              rarity: "Rare",
              isWithdrawable: true
            },
            amount: 14
          },
          {
            item: {
              id: "mock-19",
              name: "Ткацкий станок",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/loom/icon",
              amount: 1,
              price: 5,
              percentChance: 100,
              rarity: "Uncommon",
              isWithdrawable: true
            },
            amount: 40
          },
          {
            item: {
              id: "mock-20",
              name: "Обсидиан",
              description: null,
              imageUrl: "https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/obsidian/icon",
              amount: 64,
              price: 1.2,
              percentChance: 100,
              rarity: "Common",
              isWithdrawable: true
            },
            amount: 67
          }
        ];
        
        setItems(prevItems => append ? [...prevItems, ...mockItems] : mockItems);
        setHasMore(false);
        setTotalCount(mockItems.length);
        setCurrentPage(1);
        setError(null);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Функция для загрузки следующей страницы
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchInventory(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, fetchInventory]);

  // Функция для полного обновления инвентаря
  const refresh = useCallback(() => {
    setItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setTotalCount(0);
    fetchInventory(1, false);
  }, [fetchInventory]);

  // Функция для мягкого обновления инвентаря (сохраняет текущее состояние пагинации)
  const softRefresh = useCallback(async () => {
    const currentPageCount = currentPage;
    setLoading(true);
    setError(null);

    try {
      // Загружаем все страницы заново, но сохраняем пагинацию
      const allItems: InventoryItem[] = [];
      let totalItems = 0;
      
      for (let page = 1; page <= currentPageCount; page++) {
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
        allItems.push(...data);
        totalItems += data.length;
        
        // Если получили меньше предметов чем ожидали, значит это последняя страница
        if (data.length < pageSize) {
          setHasMore(false);
          break;
        }
      }
      
      setItems(allItems);
      setTotalCount(totalItems);
      
      console.log(`[InventoryAPI] Soft refresh completed, items: ${allItems.length}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('[InventoryAPI] Error during soft inventory refresh:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // Функция для локального обновления количества предметов
  const updateItemAmounts = useCallback((updates: { itemId: string; amountChange: number }[]) => {
    setItems(prevItems => {
      return prevItems.map(inventoryItem => {
        const update = updates.find(u => u.itemId === inventoryItem.item.id);
        if (update) {
          const newAmount = inventoryItem.amount + update.amountChange;
          // Если количество становится 0 или меньше, удаляем предмет из инвентаря
          if (newAmount <= 0) {
            return null;
          }
          return {
            ...inventoryItem,
            amount: newAmount
          };
        }
        return inventoryItem;
      }).filter(Boolean) as InventoryItem[];
    });
  }, []);

  // Функция для добавления нового предмета в инвентарь
  const addItemToInventory = useCallback((newItem: InventoryItem) => {
    setItems(prevItems => {
      // Проверяем, есть ли уже такой предмет в инвентаре
      const existingItemIndex = prevItems.findIndex(item => item.item.id === newItem.item.id);
      
      if (existingItemIndex >= 0) {
        // Если предмет уже есть, увеличиваем его количество
        return prevItems.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, amount: item.amount + newItem.amount }
            : item
        );
      } else {
        // Если предмета нет, добавляем его в начало списка
        return [newItem, ...prevItems];
      }
    });
  }, []);

  // Начальная загрузка
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      fetchInventory(1, false);
    }
  }, [fetchInventory, isInitialized]);

  return {
    items,
    loading,
    error,
    hasMore,
    totalCount,
    currentPage,
    loadMore,
    refresh,
    softRefresh,
    updateItemAmounts,
    addItemToInventory,
  };
};