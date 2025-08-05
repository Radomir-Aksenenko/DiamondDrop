/**
 * Конфигурация приложения
 */

import type { APIUser } from '@/types/user';

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
    inventory: `${API_BASE_URL}/users/me/inventory`,
  },

} as const;

// Настройки для dev режима
export const DEV_CONFIG: {
  skipAuth: boolean;
  mockUser: APIUser;
  mockBanners: Array<{
    id: string;
    imageUrl: string;
    url: string;
  }>;
  mockCases: Array<{
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    items?: Array<{
      id: string;
      name: string;
      description: string;
      imageUrl: string;
      amount: number;
      price: number;
      percentChance: number;
      rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
    }>;
  }>;
  mockToken: string;
} = {
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
    inventory: [
      {
        id: 'netherite_ingot',
        name: 'Незеритовый слиток',
        description: 'подписан великим игроком fupir...',
        imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/netherite_ingot/icon',
        amount: 2,
        price: 12,
        percentChance: 0.5,
        rarity: 'Legendary'
      },
      {
        id: 'diamond_sword',
        name: 'Алмазный меч',
        description: 'подписан великим игроком alex123...',
        imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond_sword/icon',
        amount: 1,
        price: 8,
        percentChance: 1.2,
        rarity: 'Epic'
      },
      {
        id: 'golden_apple',
        name: 'Золотое яблоко',
        description: 'подписан великим игроком steve...',
        imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/golden_apple/icon',
        amount: 3,
        price: 5,
        percentChance: 2.5,
        rarity: 'Rare'
      },
      {
        id: 'enchanted_book',
        name: 'Зачарованная книга',
        description: 'подписан великим игроком wizard...',
        imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/enchanted_book/icon',
        amount: 1,
        price: 15,
        percentChance: 0.8,
        rarity: 'Legendary'
      },
      {
        id: 'iron_pickaxe',
        name: 'Железная кирка',
        description: 'подписан великим игроком miner...',
        imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/iron_pickaxe/icon',
        amount: 1,
        price: 3,
        percentChance: 5.0,
        rarity: 'Uncommon'
      },
      {
        id: 'emerald',
        name: 'Изумруд',
        description: 'подписан великим игроком trader...',
        imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/emerald/icon',
        amount: 5,
        price: 7,
        percentChance: 3.2,
        rarity: 'Rare'
      }
    ]
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
      id: 'mammoth',
      name: 'Мамонт',
      description: 'Каменный век, дикие земли, первобытные люди и... МАМОНТЫ! Да-да, именно с них началась история самого первого кейса.',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 16,
      items: [
        {
          id: 'cobblestone-1',
          name: 'Булыжник',
          description: 'Обычный булыжник',
          imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/cobblestone/icon',
          amount: 64,
          price: 0.5,
          percentChance: 45.0,
          rarity: 'Common' as const
        },
        {
          id: 'iron-ingot-1',
          name: 'Железный слиток',
          description: 'Полезный металл',
          imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/iron_ingot/icon',
          amount: 16,
          price: 8.0,
          percentChance: 25.0,
          rarity: 'Uncommon' as const
        },
        {
          id: 'gold-ingot-1',
          name: 'Золотой слиток',
          description: 'Драгоценный металл',
          imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/gold_ingot/icon',
          amount: 8,
          price: 24.0,
          percentChance: 15.0,
          rarity: 'Rare' as const
        },
        {
          id: 'diamond-1',
          name: 'Алмаз',
          description: 'Редкий драгоценный камень',
          imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond/icon',
          amount: 4,
          price: 64.0,
          percentChance: 10.0,
          rarity: 'Epic' as const
        },
        {
          id: 'netherite-1',
          name: 'Незеритовый слиток',
          description: 'Самый прочный материал',
          imageUrl: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/netherite_ingot/icon',
          amount: 1,
          price: 256.0,
          percentChance: 5.0,
          rarity: 'Legendary' as const
        }
      ]
    },
    {
      id: '6836d58aed445deeaeda5ca1',
      name: 'Стартовый кейс',
      description: 'Идеальный выбор для новичков',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 100,
    },
    {
      id: '6836d58aed445deeaeda5ca2',
      name: 'Золотой кейс',
      description: 'Кейс с редкими предметами',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 500,
    },
    {
      id: '6836d58aed445deeaeda5ca3',
      name: 'Платиновый кейс',
      description: 'Эксклюзивные награды ждут вас',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 1000,
    },
    {
      id: '6836d58aed445deeaeda5ca4',
      name: 'Алмазный кейс',
      description: 'Самые ценные предметы',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 2500,
    },
    {
      id: '6836d58aed445deeaeda5ca5',
      name: 'Легендарный кейс',
      description: 'Мифические сокровища',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 5000,
    },
    {
      id: '6836d58aed445deeaeda5ca6',
      name: 'Мистический кейс',
      description: 'Загадочные артефакты',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 750,
    },
    {
      id: '6836d58aed445deeaeda5ca7',
      name: 'Королевский кейс',
      description: 'Достойный королей',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 3000,
    },
    {
      id: '6836d58aed445deeaeda5ca8',
      name: 'Космический кейс',
      description: 'Предметы из далеких галактик',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      price: 1500,
    },
  ],
  // Мок токен для dev режима
  mockToken: 'dev-mock-token-12345',
};

// Настройки запросов
export const REQUEST_CONFIG = {
  timeout: 10000, // 10 секунд
  retryCount: 3,
  retryDelay: 1000, // 1 секунда
} as const;