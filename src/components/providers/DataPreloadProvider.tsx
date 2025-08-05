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
  forceReloadData: () => Promise<void>;
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

// Ключи для sessionStorage
const SESSION_CACHE_KEYS = {
  IS_INITIALIZED: 'dd_cache_initialized',
  BANNERS: 'dd_cache_banners',
  CASES: 'dd_cache_cases',
  LIVE_WINS: 'dd_cache_live_wins',
  LAST_LOAD_TIME: 'dd_cache_last_load_time'
};

// Утилиты для работы с sessionStorage кешем
const sessionCache = {
  // Проверяем, инициализирован ли кеш
  get isInitialized(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SESSION_CACHE_KEYS.IS_INITIALIZED) === 'true';
  },
  
  set isInitialized(value: boolean) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SESSION_CACHE_KEYS.IS_INITIALIZED, value.toString());
  },

  // Получаем данные из кеша
  getBanners(): APIBanner[] | null {
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem(SESSION_CACHE_KEYS.BANNERS);
    return data ? JSON.parse(data) : null;
  },

  setBanners(banners: APIBanner[] | null) {
    if (typeof window === 'undefined') return;
    if (banners) {
      sessionStorage.setItem(SESSION_CACHE_KEYS.BANNERS, JSON.stringify(banners));
    } else {
      sessionStorage.removeItem(SESSION_CACHE_KEYS.BANNERS);
    }
  },

  getCases(): CaseData[] | null {
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem(SESSION_CACHE_KEYS.CASES);
    return data ? JSON.parse(data) : null;
  },

  setCases(cases: CaseData[] | null) {
    if (typeof window === 'undefined') return;
    if (cases) {
      sessionStorage.setItem(SESSION_CACHE_KEYS.CASES, JSON.stringify(cases));
    } else {
      sessionStorage.removeItem(SESSION_CACHE_KEYS.CASES);
    }
  },

  getLiveWins(): LiveWinData[] | null {
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem(SESSION_CACHE_KEYS.LIVE_WINS);
    return data ? JSON.parse(data) : null;
  },

  setLiveWins(liveWins: LiveWinData[] | null) {
    if (typeof window === 'undefined') return;
    if (liveWins) {
      sessionStorage.setItem(SESSION_CACHE_KEYS.LIVE_WINS, JSON.stringify(liveWins));
    } else {
      sessionStorage.removeItem(SESSION_CACHE_KEYS.LIVE_WINS);
    }
  },

  // Очищаем весь кеш
  clear() {
    if (typeof window === 'undefined') return;
    Object.values(SESSION_CACHE_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
    });
  },

  // Устанавливаем время последней загрузки
  setLastLoadTime(time: number) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(SESSION_CACHE_KEYS.LAST_LOAD_TIME, time.toString());
  },

  getLastLoadTime(): number {
    if (typeof window === 'undefined') return 0;
    const time = sessionStorage.getItem(SESSION_CACHE_KEYS.LAST_LOAD_TIME);
    return time ? parseInt(time, 10) : 0;
  }
};

export default function DataPreloadProvider({ children }: DataPreloadProviderProps) {
  // Уникальный идентификатор для отслеживания экземпляров
  const [providerId] = useState(() => Math.random().toString(36).substr(2, 9));
  
  // Хук для загрузки результатов игр
  const { fetchGameResults } = useGameResultsAPI();
  
  // Состояние для хранения данных
  const [banners, setBanners] = useState<APIBanner[]>(() => sessionCache.getBanners() || []);
  const [user, setUser] = useState<APIUser | null>(null);
  const [cases, setCases] = useState<CaseData[]>(() => sessionCache.getCases() || []);
  const [liveWins, setLiveWins] = useState<LiveWinData[]>(() => sessionCache.getLiveWins() || []);
  const [isLoading, setIsLoading] = useState(!sessionCache.isInitialized);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(getAuthToken());
  const [hasInitialLoad, setHasInitialLoad] = useState(sessionCache.isInitialized);

  // Функция загрузки баннеров
  const loadBanners = useCallback(async (forceReload = false): Promise<APIBanner[]> => {
    try {
      // Проверяем кеш если не принудительная перезагрузка
      const cachedBanners = sessionCache.getBanners();
      if (!forceReload && cachedBanners && sessionCache.isInitialized) {
        console.log(`📦 [${providerId}] Используем кешированные баннеры`);
        return cachedBanners;
      }

      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log(`🔧 [${providerId}] Dev режим: используем мок баннеры`);
        const result = [...mockBanners];
        sessionCache.setBanners(result);
        return result;
      }

      const token = getAuthToken();
      if (!token) {
        // Если токен не найден, возвращаем дефолтный баннер
        const result = [{
          id: 'default',
          imageUrl: '/Frame 116.png',
          url: '/news/1'
        }];
        sessionCache.setBanners(result);
        return result;
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

      const result = await response.json();
      sessionCache.setBanners(result);
      return result;
    } catch (err) {
      console.error('Ошибка при загрузке баннеров:', err);
      // Возвращаем дефолтный баннер при ошибке
      const result = [{
        id: 'default',
        imageUrl: '/Frame 116.png',
        url: '/news/1'
      }];
      sessionCache.setBanners(result);
      return result;
    }
  }, [providerId]);

  // Кешированный мок пользователя для dev режима
  const [cachedMockUser] = useState(() => ({ ...mockUser }));

  // Функция загрузки данных пользователя
  const loadUser = useCallback(async (): Promise<APIUser | null> => {
    try {
      // В dev режиме используем кешированные мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log(`🔧 [${providerId}] Dev режим: используем кешированного мок пользователя`);
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
  const loadCases = useCallback(async (forceReload = false): Promise<CaseData[]> => {
    try {
      // Проверяем кеш если не принудительная перезагрузка
      const cachedCases = sessionCache.getCases();
      if (!forceReload && cachedCases && sessionCache.isInitialized) {
        console.log(`📦 [${providerId}] Используем кешированные кейсы`);
        return cachedCases;
      }

      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log(`🔧 [${providerId}] Dev режим: используем мок кейсы`);
        const result = DEV_CONFIG.mockCases.map(caseData => ({
          ...caseData,
          description: caseData.description || null,
          items: caseData.items || generateRandomItems(caseData.price)
        }));
        sessionCache.setCases(result);
        return result;
      }

      const token = getAuthToken();
      if (!token) {
        const result: CaseData[] = [];
        sessionCache.setCases(result);
        return result;
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
      const result = data.cases || [];
      sessionCache.setCases(result);
      return result;
    } catch (err) {
      console.error('Ошибка при загрузке кейсов:', err);
      const result: CaseData[] = [];
      sessionCache.setCases(result);
      return result;
    }
  }, [providerId]);

  // Функция загрузки живых выигрышей (начальные данные)
  const loadInitialLiveWins = useCallback(async (forceReload = false): Promise<LiveWinData[]> => {
    try {
      // Проверяем кеш если не принудительная перезагрузка
      const cachedLiveWins = sessionCache.getLiveWins();
      if (!forceReload && cachedLiveWins && sessionCache.isInitialized) {
        console.log(`📦 [${providerId}] Используем кешированные live wins`);
        return cachedLiveWins;
      }

      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log(`🔧 [${providerId}] Dev режим: используем мок выигрыши`);
        const result = [...mockLiveWins];
        sessionCache.setLiveWins(result);
        return result;
      }

      // Проверяем наличие токена авторизации
      const token = getAuthToken();
      if (!token) {
        console.log(`⚠️ [${providerId}] Токен не найден, используем мок данные для live wins`);
        const result = [...mockLiveWins];
        sessionCache.setLiveWins(result);
        return result;
      }

      // Загружаем начальные данные через API
      console.log(`🚀 [${providerId}] Загружаем начальные live wins через API...`);
      const apiResults = await fetchGameResults();
      console.log(`✅ [${providerId}] Загружено ${apiResults.length} начальных live wins из API`);
      
      sessionCache.setLiveWins(apiResults);
      return apiResults;
    } catch (err) {
      console.error(`❌ [${providerId}] Ошибка при загрузке начальных выигрышей:`, err);
      // В случае ошибки возвращаем мок данные как fallback
      console.log(`🔄 [${providerId}] Используем мок данные как fallback`);
      const result = [...mockLiveWins];
      sessionCache.setLiveWins(result);
      return result;
    }
  }, [providerId, fetchGameResults]);

  // Функция предзагрузки всех данных
  const preloadAllData = useCallback(async (isInitialLoad = false, forceReload = false) => {
    try {
      // Если данные уже загружены и это не принудительная перезагрузка, пропускаем
      if (sessionCache.isInitialized && !forceReload && !isInitialLoad) {
        console.log(`📦 [${providerId}] Данные уже загружены, используем кеш`);
        
        // Обновляем состояние из кеша
        const cachedBanners = sessionCache.getBanners();
        const cachedCases = sessionCache.getCases();
        const cachedLiveWins = sessionCache.getLiveWins();
        
        if (cachedBanners) setBanners(cachedBanners);
        if (cachedCases) setCases(cachedCases);
        if (cachedLiveWins) setLiveWins(cachedLiveWins);
        
        // Загружаем только данные пользователя (они не кешируются)
        const userData = await loadUser();
        setUser(userData);
        setIsAuthenticated(hasAuthToken());
        
        setIsLoading(false);
        setHasInitialLoad(true);
        return;
      }

      // Устанавливаем состояние загрузки только для первоначальной загрузки
      if (isInitialLoad || !hasInitialLoad) {
        setIsLoading(true);
        setError(null);
      }

      console.log(`🚀 [${providerId}] Начинаем предзагрузку всех данных...`);
      console.log(`📊 [${providerId}] Параметры загрузки:`, {
        isInitialLoad,
        hasInitialLoad,
        forceReload,
        cacheInitialized: sessionCache.isInitialized,
        currentToken: !!currentToken,
        authToken: !!getAuthToken()
      });

      // Проверяем аутентификацию
      const authenticated = hasAuthToken();
      setIsAuthenticated(authenticated);

      // Загружаем все данные параллельно для лучшей производительности
      const [bannersData, userData, casesData, liveWinsData] = await Promise.all([
        loadBanners(forceReload),
        loadUser(), // Данные пользователя всегда загружаем заново
        loadCases(forceReload),
        loadInitialLiveWins(forceReload)
      ]);

      setBanners(bannersData);
      setUser(userData);
      setCases(casesData);
      setLiveWins(liveWinsData);

      // Помечаем кеш как инициализированный
      sessionCache.isInitialized = true;
      sessionCache.setLastLoadTime(Date.now());

      console.log(`✅ [${providerId}] Предзагрузка завершена, кеш обновлен`);

      // Небольшая задержка для плавности только при первоначальной загрузке
      if (isInitialLoad || !hasInitialLoad) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setHasInitialLoad(true);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error(`❌ [${providerId}] Ошибка предзагрузки:`, errorMessage);
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
      const bannersData = await loadBanners(true);
      setBanners(bannersData);
    } catch (err) {
      console.error('Ошибка обновления баннеров:', err);
    }
  };

  // Функция для принудительной перезагрузки всех данных
  const forceReloadData = useCallback(async () => {
    console.log(`🔄 [${providerId}] Принудительная перезагрузка данных...`);
    
    // Очищаем кеш сессии
    sessionCache.clear();
    
    setHasInitialLoad(false);
    
    // Перезагружаем данные
    await preloadAllData(true, true);
  }, [preloadAllData, providerId]);

  const refreshUser = async () => {
    try {
      console.log('🔄 refreshUser: Начинаем обновление данных пользователя...');
      console.trace('🔍 refreshUser: Stack trace для понимания откуда вызывается');
      const oldBalance = user?.balance;
      console.log('💰 refreshUser: Текущий баланс:', oldBalance);
      
      const userData = await loadUser();
      console.log('📊 refreshUser: Получены новые данные пользователя:', userData);
      console.log('💰 refreshUser: Новый баланс:', userData?.balance);
      
      setUser(userData);
      setIsAuthenticated(hasAuthToken());
      
      console.log('✅ refreshUser: Данные пользователя успешно обновлены');
      if (oldBalance !== userData?.balance) {
        console.log(`💸 refreshUser: Баланс изменился с ${oldBalance} на ${userData?.balance}`);
      }
    } catch (err) {
      console.error('❌ refreshUser: Ошибка обновления пользователя:', err);
    }
  };

  const refreshCases = async () => {
    try {
      const casesData = await loadCases(true);
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
    console.log(`💰 updateBalanceLocally: Вызвана функция увеличения баланса на ${amount}`);
    console.trace('🔍 updateBalanceLocally: Stack trace для понимания откуда вызывается');
    
    setUser(prevUser => {
      if (!prevUser) {
        console.log('⚠️ updateBalanceLocally: Пользователь не найден, пропускаем обновление');
        return prevUser;
      }
      
      const oldBalance = prevUser.balance;
      const newBalance = oldBalance + amount;
      console.log(`💰 updateBalanceLocally: Увеличиваем баланс с ${oldBalance} на ${amount}, новый баланс: ${newBalance}`);
      
      return {
        ...prevUser,
        balance: newBalance
      };
    });
  }, []);

  // Функция для локального уменьшения баланса (при покупке кейса)
  const decreaseBalanceLocally = useCallback((amount: number) => {
    console.log(`💰 decreaseBalanceLocally: Вызвана функция уменьшения баланса на ${amount}`);
    console.trace('🔍 decreaseBalanceLocally: Stack trace для понимания откуда вызывается');
    
    setUser(prevUser => {
      if (!prevUser) {
        console.log('⚠️ decreaseBalanceLocally: Пользователь не найден, пропускаем обновление');
        return prevUser;
      }
      
      const oldBalance = prevUser.balance;
      const newBalance = Math.max(0, oldBalance - amount);
      console.log(`💰 decreaseBalanceLocally: Уменьшаем баланс с ${oldBalance} на ${amount}, новый баланс: ${newBalance}`);
      
      return {
        ...prevUser,
        balance: newBalance
      };
    });
  }, []);

  // Запускаем предзагрузку при монтировании только если есть токен или в dev режиме
  useEffect(() => {
    const token = getAuthToken();
    const shouldLoad = (token || (isDevelopment && DEV_CONFIG.skipAuth)) && !hasInitialLoad;
    
    console.log(`🔧 [${providerId}] useEffect #1 (монтирование): Инициализация, токен:`, !!token, 'dev режим:', isDevelopment && DEV_CONFIG.skipAuth);
    console.log(`🔧 [${providerId}] useEffect #1: shouldLoad =`, shouldLoad, '(токен:', !!token, 'hasInitialLoad =', hasInitialLoad, ')');
    
    if (shouldLoad) {
      console.log(`🚀 [${providerId}] useEffect #1: Вызываем preloadAllData(true) - первая загрузка`);
      preloadAllData(true);
    } else if ((token || (isDevelopment && DEV_CONFIG.skipAuth)) && hasInitialLoad) {
      console.log(`⚠️ [${providerId}] useEffect #1: Токен есть, но данные уже загружены - пропускаем загрузку`);
    } else {
      // Если токена нет, показываем состояние ожидания токена
      console.log(`⏳ [${providerId}] useEffect #1: Ожидаем получение токена авторизации...`);
      setIsLoading(true);
    }
  }, [preloadAllData, hasInitialLoad, providerId]);

  // Отслеживаем изменения токена и перезагружаем данные (оптимизированная версия)
  useEffect(() => {
    console.log(`🔧 [${providerId}] useEffect #2 (токен): Инициализация интервала проверки токена`);
    let isActive = true; // Флаг для предотвращения race conditions
    
    const checkTokenInterval = setInterval(() => {
      if (!isActive) return;
      
      const token = getAuthToken();
      
      // Проверяем, действительно ли токен изменился
      if (token !== currentToken) {
        console.log(`🔄 [${providerId}] useEffect #2: Токен изменился:`, {
          old: currentToken ? 'есть' : 'нет',
          new: token ? 'есть' : 'нет',
          hasInitialLoad,
          cacheInitialized: sessionCache.isInitialized
        });
        
        setCurrentToken(token);
        
        // Загружаем данные только если токен появился и мы еще не делали начальную загрузку
        if (token && !hasInitialLoad) {
          console.log(`🚀 [${providerId}] useEffect #2: Первая загрузка после получения токена`);
          preloadAllData(true);
        } else if (!token && hasInitialLoad) {
          // Токен исчез - сбрасываем состояние
          console.log(`🚪 [${providerId}] useEffect #2: Токен исчез, сбрасываем данные пользователя`);
          setUser(null);
          setIsAuthenticated(false);
          // Очищаем кеш при выходе пользователя
          sessionCache.clear();
          setHasInitialLoad(false);
        } else if (token && hasInitialLoad && !sessionCache.isInitialized) {
          // Токен есть, но кеш не инициализирован - загружаем данные
          console.log(`🔄 [${providerId}] useEffect #2: Токен есть, но кеш не инициализирован - загружаем данные`);
          preloadAllData(true);
        } else {
          // Токен есть и данные уже загружены - просто обновляем статус аутентификации
          console.log(`✅ [${providerId}] useEffect #2: Токен есть, данные загружены - обновляем только статус аутентификации`);
          setIsAuthenticated(hasAuthToken());
        }
      }
    }, 5000); // Увеличиваем интервал до 5 секунд для снижения нагрузки

    return () => {
      console.log(`🔧 [${providerId}] useEffect #2: Очистка интервала проверки токена`);
      isActive = false;
      clearInterval(checkTokenInterval);
    };
  }, [currentToken, hasInitialLoad, preloadAllData, providerId]);

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
    forceReloadData,
  };

  return (
    <DataPreloadContext.Provider value={contextValue}>
      {children}
    </DataPreloadContext.Provider>
  );
}