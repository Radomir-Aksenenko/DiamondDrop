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
  mockCases: [
    {
      id: 'case-1',
      name: 'Стартовый кейс',
      description: 'Идеальный выбор для новичков',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 100,
    },
    {
      id: 'case-2',
      name: 'Золотой кейс',
      description: 'Кейс с редкими предметами',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 500,
    },
    {
      id: 'case-3',
      name: 'Платиновый кейс',
      description: 'Эксклюзивные награды ждут вас',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 1000,
    },
    {
      id: 'case-4',
      name: 'Алмазный кейс',
      description: 'Самые ценные предметы',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 2500,
    },
    {
      id: 'case-5',
      name: 'Легендарный кейс',
      description: 'Мифические сокровища',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 5000,
    },
    {
      id: 'case-6',
      name: 'Мистический кейс',
      description: 'Загадочные артефакты',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 750,
    },
    {
      id: 'case-7',
      name: 'Королевский кейс',
      description: 'Достойный королей',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 3000,
    },
    {
      id: 'case-8',
      name: 'Космический кейс',
      description: 'Предметы из далеких галактик',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 1500,
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