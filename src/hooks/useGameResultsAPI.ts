'use client';

import { useState, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/config';
import { LiveWinData } from './useLiveWins';
import { RarityType } from '@/components/ui/RarityCard';

// Интерфейс для данных предмета из API
interface APIGameResultItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  amount: number;
  price: number;
  percentChance: number;
  rarity: string;
}

// Интерфейс для данных пользователя из API
interface APIGameResultUser {
  id?: string;
  username?: string;
  avatarUrl?: string | null;
}

// Интерфейс для данных кейса из API
interface APIGameResultCase {
  id?: string;
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number;
}

// Интерфейс для одного результата игры
interface APIGameResult {
  user: APIGameResultUser | null;
  case: APIGameResultCase | null;
  item: APIGameResultItem;
}

// Интерфейс для ответа API
interface APIGameResultsResponse {
  wins: APIGameResult[];
}

// Функция для преобразования редкости из API в тип компонента
const mapRarityToType = (rarity: string): RarityType => {
  switch (rarity.toLowerCase()) {
    case 'common':
      return 'Common';
    case 'uncommon':
      return 'Uncommon';
    case 'rare':
      return 'Rare';
    case 'epic':
      return 'Epic';
    case 'legendary':
      return 'Legendary';
    default:
      return 'Common';
  }
};

// Функция для преобразования данных API в формат компонента
const transformAPIGameResult = (apiResult: APIGameResult, index: number): LiveWinData => {
  // Декодируем Unicode символы в именах
  const decodeUnicode = (str: string): string => {
    try {
      return JSON.parse(`"${str}"`);
    } catch {
      return str;
    }
  };

  return {
    id: `api-${apiResult.item.id}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    playerName: apiResult.user?.username || 'Анонимный игрок',
    username: apiResult.user?.username || 'Steve', // Используем Steve как дефолтное имя
    rarity: mapRarityToType(apiResult.item.rarity),
    percentage: `${apiResult.item.percentChance.toFixed(2)}%`,
    itemImage: apiResult.item.imageUrl || 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/cobblestone/icon',
    itemName: decodeUnicode(apiResult.item.name),
    apValue: parseFloat(apiResult.item.price.toFixed(1)),
    amount: apiResult.item.amount || 1,
    timestamp: new Date(Date.now() - index * 1000 * 60), // Создаем временные метки с интервалом в минуту
    caseId: apiResult.case?.id || '',
    caseName: decodeUnicode(apiResult.case?.name || 'Неизвестный кейс')
  };
};

export default function useGameResultsAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функция для загрузки результатов игр
  const fetchGameResults = useCallback(async (): Promise<LiveWinData[]> => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch(`${API_BASE_URL}/game-results`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
      }

      const data: APIGameResultsResponse = await response.json();
      
      // Преобразуем данные API в формат компонента
      const transformedResults = data.wins.map((result, index) => 
        transformAPIGameResult(result, index)
      );

      console.log('Game results loaded:', transformedResults.length, 'items');
      return transformedResults;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при загрузке результатов игр';
      setError(errorMessage);
      console.error('Error loading game results:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchGameResults,
    loading,
    error
  };
}