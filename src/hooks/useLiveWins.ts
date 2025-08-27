'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RarityType } from '@/components/ui/RarityCard';
import { liveWinsSocket, LiveWinData as ManagerWinData } from '@/lib/liveWinsSocket';

// Интерфейс для данных пользователя из WebSocket
interface WSUser {
  Id: string;
  Username: string;
  AvatarUrl: string | null;
}

// Интерфейс для данных кейса из WebSocket
interface WSCase {
  Id: string;
  Name: string;
  Description: string;
  ImageUrl: string | null;
  Price: number;
}

// Интерфейс для данных предмета из WebSocket
interface WSItem {
  Id: string;
  Name: string;
  Description: string | null;
  ImageUrl: string;
  Amount: number;
  Price: number;
  PercentChance: number;
  Rarity: string;
}

// Интерфейс для данных выигрыша из WebSocket
interface WSWinData {
  user: WSUser;
  case: WSCase;
  item: WSItem;
}

// Интерфейс для сообщения WebSocket с данными выигрыша
interface WSWinMessage {
  type: 'message';
  channel: 'LiveWins';
  data: WSWinData;
}

// Интерфейс для сообщения KeepAlive
interface WSKeepAliveMessage {
  type: 'KeepAlive';
  timestamp: number;
}

// Общий тип для всех сообщений WebSocket (не используется напрямую)

// Интерфейс для обработанных данных выигрыша
export interface LiveWinData {
  id: string;
  playerName: string;
  playerAvatarUrl: string | null;
  rarity: RarityType;
  percentage: string;
  itemImage: string;
  itemName: string;
  apValue: number;
  amount: number;
  timestamp: Date;
  caseId: string;
  caseName: string;
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

// Функция для преобразования данных WebSocket в формат компонента
const transformWSData = (wsData: WSWinData, messageCounter: number): LiveWinData => {
  // Декодируем Unicode символы в именах
  const decodeUnicode = (str: string): string => {
    try {
      return JSON.parse(`"${str}"`);
    } catch {
      return str;
    }
  };

  // Создаем более уникальный ID с использованием счетчика сообщений
  const uniqueId = `ws-${wsData.user.Id}-${wsData.item.Id}-${wsData.case.Id}-${Date.now()}-${messageCounter}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: uniqueId,
    playerName: wsData.user.Username,
    playerAvatarUrl: wsData.user.Username ? `https://avatar.spoverlay.ru/face/${encodeURIComponent(wsData.user.Username)}?w=128` : null,
    rarity: mapRarityToType(wsData.item.Rarity),
    percentage: `${wsData.item.PercentChance.toFixed(2)}%`,
    itemImage: wsData.item.ImageUrl || 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/cobblestone/icon',
    itemName: decodeUnicode(wsData.item.Name),
    apValue: parseFloat(wsData.item.Price.toFixed(1)), // Сохраняем дробные значения до десятых
    amount: wsData.item.Amount || 1, // Извлекаем количество из данных
    timestamp: new Date(),
    caseId: wsData.case.Id,
    caseName: decodeUnicode(wsData.case.Name)
  };
};

interface UseLiveWinsOptions {
  initialData?: LiveWinData[];
}

export default function useLiveWins(options: UseLiveWinsOptions = {}) {
  const [wins, setWins] = useState<LiveWinData[]>(options.initialData || []);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const pendingQueueRef = useRef<ManagerWinData[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNext = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!isMountedRef.current) return;
      const next = pendingQueueRef.current.shift();
      if (next) {
        setWins(prev => {
          const existingIds = new Set(prev.map(w => w.id));
          if (existingIds.has(next.id)) {
            return prev;
          }
          return [next, ...prev].slice(0, 10);
        });
      }
      if (pendingQueueRef.current.length > 0) {
        scheduleNext();
      }
    }, 1000);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const unsubscribe = liveWinsSocket.subscribe({
      onWin: (win: ManagerWinData) => {
        if (!isMountedRef.current) return;
        // Кладём новое событие в очередь и запускаем обработчик с задержкой
        pendingQueueRef.current.push(win);
        scheduleNext();
      },
      onConnected: (connected) => {
        if (!isMountedRef.current) return;
        setIsConnected(connected);
      },
      onError: (msg) => {
        if (!isMountedRef.current) return;
        setError(msg);
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      pendingQueueRef.current = [];
    };
  }, []);

  const reconnect = useCallback(() => {
    liveWinsSocket.forceRefresh();
  }, []);

  const disconnect = useCallback(() => {
    // No-op: keep connection persistent; consumer should not close global socket
  }, []);

  const forceRefresh = useCallback(() => {
    liveWinsSocket.forceRefresh();
  }, []);

  return {
    wins,
    isConnected,
    error,
    reconnect,
    disconnect,
    forceRefresh
  };
}