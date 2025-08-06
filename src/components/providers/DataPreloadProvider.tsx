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
    rarity: 'Legendary',
    percentage: '0.01%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/netherite_sword/icon',
    itemName: 'Золотой меч',
    apValue: 999.5,
    amount: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: 'mock-2',
    playerName: 'GamerPro',
    rarity: 'Epic',
    percentage: '0.5%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond_chestplate/icon',
    itemName: 'Магический щит',
    apValue: 250.3,
    amount: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: 'mock-3',
    playerName: 'LuckyOne',
    rarity: 'Rare',
    percentage: '2.5%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond/icon',
    itemName: 'Редкий кристалл',
    apValue: 100.7,
    amount: 16,
    timestamp: new Date(Date.now() - 1000 * 60 * 30)
  }
];

interface DataPreloadProviderProps {
  children: ReactNode;
}

export default function DataPreloadProvider({ children }: DataPreloadProviderProps) {
  // Уникальный идентификатор для отслеживания экземпляров
  const [providerId] = useState(() => Math.random().toString(36).substr(2, 9));
  
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
        console.log(`[${providerId}] Development mode: using mock banners`);
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
      console.error('Ошибка при загрузке баннеров:', err);
      // Возвращаем дефолтный баннер при ошибке
      return [{
        id: 'default',
        imageUrl: '/Frame 116.png',
        url: '/news/1'
      }];
    }
  }, [providerId]);

  // Кешированный мок пользователя для dev режима
  const [cachedMockUser] = useState(() => ({ ...mockUser }));

  // Функция загрузки данных пользователя
  const loadUser = useCallback(async (): Promise<APIUser | null> => {
    try {
      // В dev режиме используем кешированные мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log(`[${providerId}] Development mode: using cached mock user`);
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
      console.error('Ошибка при загрузке данных пользователя:', err);
      return null;
    }
  }, [providerId, cachedMockUser]);

  // Функция загрузки кейсов
  const loadCases = useCallback(async (): Promise<CaseData[]> => {
    try {
      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log(`[${providerId}] Development mode: using mock cases`);
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
      console.error('Ошибка при загрузке кейсов:', err);
      return [];
    }
  }, [providerId]);

  // Функция загрузки живых выигрышей (начальные данные)
  const loadInitialLiveWins = useCallback(async (): Promise<LiveWinData[]> => {
    try {
      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log(`[${providerId}] Dev mode: using mock wins`);
        return [...mockLiveWins];
      }

      // Проверяем наличие токена авторизации
      const token = getAuthToken();
      if (!token) {
        console.log(`[${providerId}] Token not found, using mock data for live wins`);
        return [...mockLiveWins];
      }

      // Загружаем начальные данные через API
      console.log(`[${providerId}] Loading initial live wins via API...`);
      const apiResults = await fetchGameResults();
      console.log(`[${providerId}] Loaded ${apiResults.length} initial live wins from API`);
      
      return apiResults;
    } catch (err) {
      console.error(`[${providerId}] Error loading initial wins:`, err);
      // В случае ошибки возвращаем мок данные как fallback
      console.log(`[${providerId}] Using mock data as fallback`);
      return [...mockLiveWins];
    }
  }, [providerId, fetchGameResults]);

  // Функция предзагрузки всех данных
  const preloadAllData = useCallback(async (isInitialLoad = false) => {
    try {
      // Устанавливаем состояние загрузки только для первоначальной загрузки
      if (isInitialLoad || !hasInitialLoad) {
        setIsLoading(true);
        setError(null);
      }

      console.log(`[${providerId}] Starting preload of all data...`);
      console.log(`[${providerId}] Loading parameters:`, {
        isInitialLoad,
        hasInitialLoad,
        currentToken: !!currentToken,
        authToken: !!getAuthToken()
      });
      
      // Добавляем stack trace чтобы понять откуда вызывается
      console.trace(`[${providerId}] Stack trace for preloadAllData`);

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

      console.log(`[${providerId}] Data preload completed successfully`);

      // Небольшая задержка для плавности только при первоначальной загрузке
      if (isInitialLoad || !hasInitialLoad) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setHasInitialLoad(true);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error(`[${providerId}] Preload error:`, errorMessage);
    } finally {
      // Убираем состояние загрузки только после первоначальной загрузки
      if (isInitialLoad || !hasInitialLoad) {
        setIsLoading(false);
      }
    }
  }, [hasInitialLoad, currentToken, loadBanners, loadCases, loadInitialLiveWins, loadUser, providerId]);

  // Функции для обновления отдельных данных
  const refreshBanners = async () => {
    try {
      const bannersData = await loadBanners();
      setBanners(bannersData);
    } catch (err) {
      console.error('Ошибка обновления баннеров:', err);
    }
  };

  const refreshUser = async () => {
    try {
      console.log('refreshUser: Starting user data update...');
      const oldBalance = user?.balance;
      console.log('refreshUser: Current balance:', oldBalance);
      
      const userData = await loadUser();
      console.log('refreshUser: New user data received:', userData);
      console.log('refreshUser: New balance:', userData?.balance);
      
      setUser(userData);
      setIsAuthenticated(hasAuthToken());
      
      console.log('refreshUser: User data updated successfully');
      if (oldBalance !== userData?.balance) {
        console.log(`refreshUser: Balance changed from ${oldBalance} to ${userData?.balance}`);
      }
    } catch (err) {
      console.error('refreshUser: Error updating user data:', err);
    }
  };

  const refreshCases = async () => {
    try {
      const casesData = await loadCases();
      setCases(casesData);
    } catch (err) {
      console.error('Ошибка обновления кейсов:', err);
    }
  };

  const refreshAllData = async () => {
    await preloadAllData(true); // Принудительная перезагрузка с показом состояния загрузки
  };

  // Функция для локального увеличения баланса (при депозите)
  const updateBalanceLocally = useCallback((amount: number) => {
    console.log(`updateBalanceLocally: Balance increase function called with amount: ${amount}`);
    
    setUser(prevUser => {
      if (!prevUser) {
        console.log('updateBalanceLocally: User not found, skipping update');
        return prevUser;
      }
      
      const oldBalance = prevUser.balance;
      const newBalance = oldBalance + amount;
      console.log(`updateBalanceLocally: Increasing balance from ${oldBalance} by ${amount}, new balance: ${newBalance}`);
      
      return {
        ...prevUser,
        balance: newBalance
      };
    });
  }, []);

  // Функция для локального уменьшения баланса (при покупке кейса)
  const decreaseBalanceLocally = useCallback((amount: number) => {
    console.log(`decreaseBalanceLocally: Balance decrease function called with amount: ${amount}`);
    
    setUser(prevUser => {
      if (!prevUser) {
        console.log('decreaseBalanceLocally: User not found, skipping update');
        return prevUser;
      }
      
      const oldBalance = prevUser.balance;
      const newBalance = Math.max(0, oldBalance - amount);
      console.log(`decreaseBalanceLocally: Decreasing balance from ${oldBalance} by ${amount}, new balance: ${newBalance}`);
      
      return {
        ...prevUser,
        balance: newBalance
      };
    });
  }, []);

  // Единый useEffect для управления загрузкой данных
  useEffect(() => {
    const token = getAuthToken();
    const hasToken = token || (isDevelopment && DEV_CONFIG.skipAuth);
    
    console.log(`[${providerId}] useEffect (main): Initialization, token:`, !!token, 'dev mode:', isDevelopment && DEV_CONFIG.skipAuth);
    console.log(`[${providerId}] useEffect: hasToken =`, hasToken, 'hasInitialLoad =', hasInitialLoad, 'currentToken =', !!currentToken);
    
    // Устанавливаем текущий токен если он изменился
    if (token !== currentToken) {
      console.log(`[${providerId}] useEffect: Token changed:`, {
        old: currentToken ? 'exists' : 'none',
        new: token ? 'exists' : 'none'
      });
      setCurrentToken(token);
    }
    
    // Загружаем данные только если есть токен и еще не было начальной загрузки
    if (hasToken && !hasInitialLoad) {
      console.log(`[${providerId}] useEffect: Calling preloadAllData(true) - initial load`);
      preloadAllData(true);
    } else if (!hasToken && hasInitialLoad) {
      // Токен исчез - сбрасываем состояние
      console.log(`[${providerId}] useEffect: Token disappeared, resetting user data`);
      setUser(null);
      setIsAuthenticated(false);
    } else if (hasToken && hasInitialLoad) {
      // Токен есть и данные уже загружены - просто обновляем статус аутентификации
      console.log(`[${providerId}] useEffect: Token exists, data loaded - updating authentication status only`);
      setIsAuthenticated(hasAuthToken());
      setIsLoading(false);
    } else {
      // Если токена нет, показываем состояние ожидания токена
      console.log(`[${providerId}] useEffect: Waiting for authorization token...`);
      setIsLoading(true);
    }
  }, [currentToken, hasInitialLoad, preloadAllData, providerId]);

  // Отдельный useEffect для периодической проверки токена (только для отслеживания изменений)
  useEffect(() => {
    console.log(`[${providerId}] useEffect (interval): Initializing token check interval`);
    let isActive = true;
    
    const checkTokenInterval = setInterval(() => {
      if (!isActive) return;
      
      const token = getAuthToken();
      
      // Проверяем, действительно ли токен изменился
      if (token !== currentToken) {
        console.log(`[${providerId}] useEffect (interval): Token change detected, updating state`);
        setCurrentToken(token);
        // Основная логика загрузки будет обработана в первом useEffect
      }
    }, 5000);

    return () => {
      console.log(`[${providerId}] useEffect (interval): Cleaning up token check interval`);
      isActive = false;
      clearInterval(checkTokenInterval);
    };
  }, [currentToken, providerId]);

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