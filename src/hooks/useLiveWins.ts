'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RarityType } from '@/components/ui/RarityCard';
import { liveWinsSocket, LiveWinData as ManagerWinData } from '@/lib/liveWinsSocket';
import { useUserFaceAvatar } from '@/hooks/useUserAvatar';

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

// Интерфейс для обработанных данных выигрыша
export interface LiveWinData {
  id: string;
  playerName: string;
  username: string; // Имя пользователя для генерации аватара
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

// Функция для маппинга редкости из строки в тип
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
  }, [scheduleNext]);

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