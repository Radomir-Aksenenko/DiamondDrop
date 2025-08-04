'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { APIBanner } from '@/hooks/useBannersAPI';
import { APIUser } from '@/hooks/useUserAPI';
import { CaseData } from '@/hooks/useCasesAPI';
import { LiveWinData } from '@/hooks/useLiveWins';
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
  avatarUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/player_head/icon',
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
  const loadBanners = async (): Promise<APIBanner[]> => {
    try {
      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log('🔧 Dev режим: используем мок баннеры');
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
  };

  // Функция загрузки данных пользователя
  const loadUser = async (): Promise<APIUser | null> => {
    try {
      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log('🔧 Dev режим: используем мок пользователя');
        return { ...mockUser };
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
  };

  // Функция загрузки кейсов
  const loadCases = async (): Promise<CaseData[]> => {
    try {
      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log('🔧 Dev режим: используем мок кейсы');
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
  };

  // Функция загрузки живых выигрышей (начальные данные)
  const loadInitialLiveWins = async (): Promise<LiveWinData[]> => {
    // Для живых выигрышей мы используем WebSocket, 
    // но можем загрузить начальные данные из API или использовать моки
    try {
      // В dev режиме или как fallback используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        console.log('🔧 Dev режим: используем мок выигрыши');
        return [...mockLiveWins];
      }

      // Здесь можно добавить загрузку начальных выигрышей из API
      // Пока используем моки как fallback
      return [...mockLiveWins];
    } catch (err) {
      console.error('Ошибка при загрузке начальных выигрышей:', err);
      return [...mockLiveWins];
    }
  };

  // Функция предзагрузки всех данных
  const preloadAllData = useCallback(async (isInitialLoad = false) => {
    try {
      // Устанавливаем состояние загрузки только для первоначальной загрузки
      if (isInitialLoad || !hasInitialLoad) {
        setIsLoading(true);
        setError(null);
      }

      console.log('🚀 Начинаем предзагрузку всех данных...');

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

      console.log('✅ Предзагрузка завершена');

      // Небольшая задержка для плавности только при первоначальной загрузке
      if (isInitialLoad || !hasInitialLoad) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setHasInitialLoad(true);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('❌ Ошибка предзагрузки:', errorMessage);
    } finally {
      // Убираем состояние загрузки только после первоначальной загрузки
      if (isInitialLoad || !hasInitialLoad) {
        setIsLoading(false);
      }
    }
  }, [hasInitialLoad]);

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
      console.log('🔄 refreshUser: Начинаем обновление данных пользователя...');
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
      const casesData = await loadCases();
      setCases(casesData);
    } catch (err) {
      console.error('Ошибка обновления кейсов:', err);
    }
  };

  const refreshAllData = async () => {
    await preloadAllData(true); // Принудительная перезагрузка с показом состояния загрузки
  };

  // Запускаем предзагрузку при монтировании только если есть токен или в dev режиме
  useEffect(() => {
    const token = getAuthToken();
    const shouldLoad = token || (isDevelopment && DEV_CONFIG.skipAuth);
    
    if (shouldLoad) {
      preloadAllData(true);
    } else {
      // Если токена нет, показываем состояние ожидания токена
      console.log('⏳ Ожидаем получение токена авторизации...');
      setIsLoading(true);
    }
  }, [preloadAllData]);

  // Отслеживаем изменения токена и перезагружаем данные
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      const token = getAuthToken();
      if (token !== currentToken) {
        console.log('🔄 Токен изменился, перезагружаем данные...');
        setCurrentToken(token);
        
        if (token && !hasInitialLoad) {
          // Первая загрузка после получения токена
          preloadAllData(true);
        } else if (token && hasInitialLoad) {
          // Обновление данных при изменении токена
          preloadAllData(false);
        }
      }
    }, 1000);

    return () => clearInterval(checkTokenInterval);
  }, [currentToken, hasInitialLoad, preloadAllData]);

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
  };

  return (
    <DataPreloadContext.Provider value={contextValue}>
      {children}
    </DataPreloadContext.Provider>
  );
}