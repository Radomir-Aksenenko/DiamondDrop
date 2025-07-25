'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { APIBanner } from '@/hooks/useBannersAPI';
import { APIUser } from '@/hooks/useUserAPI';
import { LiveWinData } from '@/hooks/useLiveWins';
import { getAuthToken, hasAuthToken } from '@/lib/auth';
import { API_ENDPOINTS, DEV_CONFIG, isDevelopment } from '@/lib/config';

// Интерфейс для контекста предзагруженных данных
interface PreloadedData {
  banners: APIBanner[];
  user: APIUser | null;
  liveWins: LiveWinData[];
  isLoading: boolean;
  loadingStage: string;
  error: string | null;
  isAuthenticated: boolean;
}

// Интерфейс для контекста с методами
interface DataPreloadContextType extends PreloadedData {
  refreshBanners: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
    apValue: 999,
    timestamp: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: 'mock-2',
    playerName: 'GamerPro',
    rarity: 'Epic',
    percentage: '0.5%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond_chestplate/icon',
    itemName: 'Магический щит',
    apValue: 250,
    timestamp: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: 'mock-3',
    playerName: 'LuckyOne',
    rarity: 'Rare',
    percentage: '2.5%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond/icon',
    itemName: 'Редкий кристалл',
    apValue: 100,
    timestamp: new Date(Date.now() - 1000 * 60 * 30)
  }
];

interface DataPreloadProviderProps {
  children: ReactNode;
}

export default function DataPreloadProvider({ children }: DataPreloadProviderProps) {
  const [banners, setBanners] = useState<APIBanner[]>([]);
  const [user, setUser] = useState<APIUser | null>(null);
  const [liveWins, setLiveWins] = useState<LiveWinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('Инициализация');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  const preloadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingStage('Проверка авторизации');

      console.log('🚀 Начинаем предзагрузку всех данных...');

      // Проверяем аутентификацию
      const authenticated = hasAuthToken();
      setIsAuthenticated(authenticated);

      // Загружаем баннеры
      setLoadingStage('Загрузка баннеров');
      console.log('📰 Загружаем баннеры...');
      const bannersData = await loadBanners();
      setBanners(bannersData);
      console.log('✅ Баннеры загружены:', bannersData.length);

      // Загружаем данные пользователя
      setLoadingStage('Загрузка профиля пользователя');
      console.log('👤 Загружаем данные пользователя...');
      const userData = await loadUser();
      setUser(userData);
      console.log('✅ Данные пользователя загружены:', userData?.nickname || 'Не авторизован');

      // Загружаем начальные выигрыши
      setLoadingStage('Загрузка последних выигрышей');
      console.log('🎰 Загружаем начальные выигрыши...');
      const liveWinsData = await loadInitialLiveWins();
      setLiveWins(liveWinsData);
      console.log('✅ Выигрыши загружены:', liveWinsData.length);

      setLoadingStage('Завершение загрузки');
      console.log('✅ Предзагрузка завершена');

      // Небольшая задержка для плавности (минимум 500мс для показа финального этапа)
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      setLoadingStage('Ошибка загрузки');
      console.error('❌ Ошибка предзагрузки:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
      const userData = await loadUser();
      setUser(userData);
      setIsAuthenticated(hasAuthToken());
    } catch (err) {
      console.error('Ошибка обновления пользователя:', err);
    }
  };

  const refreshAllData = async () => {
    await preloadAllData();
  };

  // Запускаем предзагрузку при монтировании
  useEffect(() => {
    preloadAllData();
  }, []);

  // Значение контекста
  const contextValue: DataPreloadContextType = {
    banners,
    user,
    liveWins,
    isLoading,
    loadingStage,
    error,
    isAuthenticated,
    refreshBanners,
    refreshUser,
    refreshAllData,
  };

  return (
    <DataPreloadContext.Provider value={contextValue}>
      {children}
    </DataPreloadContext.Provider>
  );
}