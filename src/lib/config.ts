/**
 * Конфигурация приложения
 */

// Определяем режим разработки
export const isDevelopment = process.env.NODE_ENV === 'development';

// Базовый URL API
export const API_BASE_URL = 'https://battle-api.chasman.engineer/api/v1';

// Эндпоинты API
export const API_ENDPOINTS = {
  validate: `${API_BASE_URL}/validate`,
  banners: `${API_BASE_URL}/banners`,
  cases: `${API_BASE_URL}/cases`,
  users: {
    me: `${API_BASE_URL}/users/me`,
  },
  stats: {
    bannerClick: `${API_BASE_URL}/stats/banner-click`,
  },
} as const;

// Настройки для dev режима
export const DEV_CONFIG = {
  // Пропускать авторизацию в dev режиме
  skipAuth: isDevelopment,
  // Мок данные для dev режима
  mockUser: {
    id: 'dev-user-123',
    nickname: 'DevUser',
    balance: 10000,
    level: 99,
    avatarUrl: 'https://avatars.spworlds.ru/face/DevUser?w=100',
    permission: 'admin',
  },
  mockBanners: [
    {
      id: 'dev-banner-1',
      imageUrl: '/Frame116.svg',
      url: '/news/1',
    },
    {
      id: 'dev-banner-2', 
      imageUrl: '/image27.svg',
      url: '/news/2',
    },
  ],
  // Мок токен для dev режима
  mockToken: 'dev-mock-token-12345',
} as const;

// Настройки запросов
export const REQUEST_CONFIG = {
  timeout: 10000, // 10 секунд
  retryCount: 3,
  retryDelay: 1000, // 1 секунда
} as const;