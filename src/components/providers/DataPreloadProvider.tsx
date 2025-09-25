'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { APIBanner } from '@/hooks/useBannersAPI';
import { APIUser } from '@/types/user';
import { CaseData } from '@/hooks/useCasesAPI';
import { LiveWinData } from '@/hooks/useLiveWins';
import useGameResultsAPI from '@/hooks/useGameResultsAPI';
import { getAuthToken, hasAuthToken } from '@/lib/auth';
import { API_ENDPOINTS, DEV_CONFIG, isDevelopment, API_BASE_URL } from '@/lib/config';
import { generateRandomItems } from '@/lib/caseUtils';

// Интерфейс для контекста предзагруженных данных
interface PreloadedData {
  banners: APIBanner[];
  user: APIUser | null;
  cases: CaseData[];
  liveWins: LiveWinData[];
  isLoaded: boolean;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Интерфейс для контекста с методами
interface DataPreloadContextType extends PreloadedData {
  refreshBanners: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshCases: () => Promise<void>;
  refreshLiveWins: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  updateBalanceLocally: (amount: number) => void;
  decreaseBalanceLocally: (amount: number) => void;
}

// Создаем контекст
const DataPreloadContext = createContext<DataPreloadContextType | undefined>(undefined);

// Хук для использования контекста
export const usePreloadedData = () => {
  const context = useContext(DataPreloadContext);
  if (context === undefined) {
    throw new Error('usePreloadedData должен использоваться внутри DataPreloadProvider');
  }
  return context;
};

// Моковые данные для разработки
const mockBanners: APIBanner[] = [
  { id: '1', imageUrl: '/Frame 116.png', url: '/news/1' },
  { id: '2', imageUrl: '/image 27.png', url: '/news/2' }
];

const mockUser: APIUser = {
  id: 'dev-user-id',
  nickname: 'DevUser',
  balance: 1000,
  level: 5,
  avatarUrl: 'https://avatar.spoverlay.ru/face/DevUser?w=512',
  permission: 'user'
};

const mockLiveWins: LiveWinData[] = [
  {
    id: 'mock-1',
    playerName: 'Player123',
    username: 'Player123',
    rarity: 'Legendary',
    percentage: '0.01%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/netherite_sword/icon',
    itemName: 'Золотой меч',
    apValue: 999.5,
    amount: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    caseId: 'case-1',
    caseName: 'Легендарный кейс'
  },
  {
    id: 'mock-2',
    playerName: 'GamerPro',
    username: 'GamerPro',
    rarity: 'Epic',
    percentage: '0.5%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond_chestplate/icon',
    itemName: 'Магический щит',
    apValue: 250.3,
    amount: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    caseId: 'case-2',
    caseName: 'Эпический кейс'
  },
  {
    id: 'mock-3',
    playerName: 'LuckyOne',
    username: 'LuckyOne',
    rarity: 'Rare',
    percentage: '2.5%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond/icon',
    itemName: 'Редкий кристалл',
    apValue: 100.7,
    amount: 16,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    caseId: 'case-3',
    caseName: 'Редкий кейс'
  }
];

interface DataPreloadProviderProps {
  children: ReactNode;
}

export default function DataPreloadProvider({ children }: DataPreloadProviderProps) {
  // Хук для загрузки результатов игр
  const { fetchGameResults } = useGameResultsAPI();
  
  // Состояние для хранения данных
  const [banners, setBanners] = useState<APIBanner[]>([]);
  const [user, setUser] = useState<APIUser | null>(null);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [liveWins, setLiveWins] = useState<LiveWinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(getAuthToken());
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Функция загрузки баннеров
  const loadBanners = useCallback(async (): Promise<APIBanner[]> => {
    try {
      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        return [...mockBanners];
      }

      const token = getAuthToken();
      if (!token) {
        // Если токен не найден, возвращаем дефолтный баннер
        return [{
          id: 'default',
          imageUrl: '/Frame 116.png',
          url: '/news/1'
        }];
      }

      const response = await fetch(API_ENDPOINTS.banners, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка API баннеров: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error loading banners:', err);
      // Возвращаем дефолтный баннер при ошибке
      return [{
        id: 'default',
        imageUrl: '/Frame 116.png',
        url: '/news/1'
      }];
    }
  }, []);

  // Кешированный мок пользователя для dev режима
  const [cachedMockUser] = useState(() => ({ ...mockUser }));

  // Функция загрузки данных пользователя
  const loadUser = useCallback(async (): Promise<APIUser | null> => {
    try {
      // В dev режиме используем кешированные мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        return cachedMockUser;
      }

      const token = getAuthToken();
      if (!token) {
        return null;
      }

      const response = await fetch(API_ENDPOINTS.users.me, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка API пользователя: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error loading user data:', err);
      return null;
    }
  }, [cachedMockUser]);

  // Функция загрузки кейсов
  const loadCases = useCallback(async (): Promise<CaseData[]> => {
    try {
      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        return DEV_CONFIG.mockCases.map(caseData => ({
          ...caseData,
          description: caseData.description || null,
          items: caseData.items || generateRandomItems(caseData.price)
        }));
      }

      const token = getAuthToken();
      if (!token) {
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/cases?page=1&pageSize=50`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка API кейсов: ${response.status}`);
      }

      const data = await response.json();
      return data.cases || [];
    } catch (err) {
      console.error('Error loading cases:', err);
      return [];
    }
  }, []);

  // Функция загрузки живых выигрышей (начальные данные)
  const loadInitialLiveWins = useCallback(async (): Promise<LiveWinData[]> => {
    try {
      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        return [...mockLiveWins];
      }

      // Проверяем наличие токена авторизации
      const token = getAuthToken();
      if (!token) {
        return [...mockLiveWins];
      }

      // Загружаем начальные данные через API
      const apiResults = await fetchGameResults();
      
      return apiResults;
    } catch (err) {
      console.error(`Error loading initial wins:`, err);
      // В случае ошибки возвращаем мок данные как fallback
      return [...mockLiveWins];
    }
  }, [fetchGameResults]);

  // Функция предзагрузки всех данных
  const preloadAllData = useCallback(async (isInitialLoad = false) => {
    try {
      // Устанавливаем состояние загрузки только для первоначальной загрузки
      if (isInitialLoad || !hasInitialLoad) {
        setIsLoading(true);
        setError(null);
      }

      // Проверяем аутентификацию
      const authenticated = hasAuthToken();
      setIsAuthenticated(authenticated);

      // Загружаем все данные параллельно для лучшей производительности
      const [bannersData, userData, casesData, liveWinsData] = await Promise.all([
        loadBanners(),
        loadUser(),
        loadCases(),
        loadInitialLiveWins()
      ]);

      setBanners(bannersData);
      setUser(userData);
      setCases(casesData);
      setLiveWins(liveWinsData);

      // Небольшая задержка для плавности только при первоначальной загрузке
      if (isInitialLoad || !hasInitialLoad) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setHasInitialLoad(true);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error(`Preload error:`, errorMessage);
    } finally {
      // Убираем состояние загрузки только после первоначальной загрузки
      if (isInitialLoad || !hasInitialLoad) {
        setIsLoading(false);
      }
    }
  }, [hasInitialLoad, loadBanners, loadUser, loadCases, loadInitialLiveWins]);

  // Функция обновления баннеров
  const refreshBanners = useCallback(async () => {
    try {
      const bannersData = await loadBanners();
      setBanners(bannersData);
    } catch (err) {
      console.error('Error updating banners:', err);
    }
  }, [loadBanners]);

  // Функция обновления данных пользователя
  const refreshUser = useCallback(async () => {
    try {
      const oldBalance = user?.balance;
      
      const userData = await loadUser();
      setUser(userData);
      
      // Проверяем изменение баланса
      if (oldBalance !== undefined && userData?.balance !== undefined && oldBalance !== userData.balance) {
        // Информационное логирование удалено
      }
    } catch (err) {
      console.error('Error updating user data:', err);
    }
  }, [loadUser, user?.balance]);

  // Функция обновления кейсов
  const refreshCases = useCallback(async () => {
    try {
      const casesData = await loadCases();
      setCases(casesData);
    } catch (err) {
      console.error('Error updating cases:', err);
    }
  }, [loadCases]);

  // Функция обновления живых выигрышей через API
  const refreshLiveWins = useCallback(async () => {
    try {
      const liveWinsData = await loadInitialLiveWins();
      setLiveWins(liveWinsData);
    } catch (err) {
      console.error('Error updating live wins:', err);
    }
  }, [loadInitialLiveWins]);

  // Функция локального увеличения баланса
  const updateBalanceLocally = useCallback((amount: number) => {
    if (!user) {
      return;
    }

    const oldBalance = user.balance;
    const newBalance = oldBalance + amount;
    
    setUser(prevUser => prevUser ? {
      ...prevUser,
      balance: newBalance
    } : null);
  }, [user]);

  // Функция локального уменьшения баланса
  const decreaseBalanceLocally = useCallback((amount: number) => {
    if (!user) {
      return;
    }

    const oldBalance = user.balance;
    const newBalance = Math.max(0, oldBalance - amount);
    
    setUser(prevUser => prevUser ? {
      ...prevUser,
      balance: newBalance
    } : null);
  }, [user]);

  // Функция обновления всех данных
  const refreshAllData = useCallback(async () => {
    try {
      await Promise.all([
        refreshBanners(),
        refreshUser(),
        refreshCases()
      ]);
    } catch (err) {
      console.error('Error refreshing all data:', err);
    }
  }, [refreshBanners, refreshUser, refreshCases]);

  // Основной useEffect для инициализации и отслеживания токена
  useEffect(() => {
    const hasToken = !!currentToken;
    
    if (hasToken && !hasInitialLoad) {
      // Первоначальная загрузка данных
      preloadAllData(true);
    } else if (!hasToken) {
      // Токен исчез - сбрасываем данные пользователя
      setUser(null);
      setIsAuthenticated(false);
    } else if (hasToken && hasInitialLoad) {
      // Токен есть, данные загружены - обновляем только статус аутентификации
      setIsAuthenticated(true);
    }
  }, [currentToken, hasInitialLoad, preloadAllData]);

  // useEffect для периодической проверки токена
  useEffect(() => {
    const interval = setInterval(() => {
      const newToken = getAuthToken();
      if (newToken !== currentToken) {
        setCurrentToken(newToken);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentToken]);

  // Значение контекста
  const contextValue: DataPreloadContextType = {
    banners,
    user,
    cases,
    liveWins,
    isLoaded: !isLoading && !error,
    loading: isLoading,
    error,
    isAuthenticated,
    refreshBanners,
    refreshUser,
    refreshCases,
    refreshLiveWins,
    refreshAllData,
    updateBalanceLocally,
    decreaseBalanceLocally,
  };

  return (
    <DataPreloadContext.Provider value={contextValue}>
      {children}
    </DataPreloadContext.Provider>
  );
}