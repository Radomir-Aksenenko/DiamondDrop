'use client';

import { useState, useEffect, useRef } from 'react';
import { RarityType } from '@/components/ui/RarityCard';
import { hasAuthToken } from '@/lib/auth';

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

// Общий тип для всех сообщений WebSocket
type WSMessage = WSWinMessage | WSKeepAliveMessage;

// Интерфейс для обработанных данных выигрыша
export interface LiveWinData {
  id: string;
  playerName: string;
  rarity: RarityType;
  percentage: string;
  itemImage: string;
  itemName: string;
  apValue: number;
  timestamp: Date;
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
const transformWSData = (wsData: WSWinData): LiveWinData => {
  // Декодируем Unicode символы в именах
  const decodeUnicode = (str: string): string => {
    try {
      return JSON.parse(`"${str}"`);
    } catch {
      return str;
    }
  };

  return {
    id: `${wsData.user.Id}-${wsData.item.Id}-${wsData.case.Id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    playerName: wsData.user.Username,
    rarity: mapRarityToType(wsData.item.Rarity),
    percentage: `${wsData.item.PercentChance.toFixed(2)}%`,
    itemImage: wsData.item.ImageUrl || 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/cobblestone/icon',
    itemName: decodeUnicode(wsData.item.Name),
    apValue: Math.round(wsData.item.Price),
    timestamp: new Date()
  };
};

export default function useLiveWins() {
  const [wins, setWins] = useState<LiveWinData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);

  const connectWebSocket = () => {
    try {
      // Проверяем поддержку WebSocket в браузере
      if (typeof WebSocket === 'undefined') {
        console.error('WebSocket не поддерживается в этом браузере');
        setError('WebSocket не поддерживается в этом браузере');
        return;
      }

      // URL WebSocket из примера
      const wsUrl = 'wss://battle-api.chasman.engineer/ws';
      console.log('Попытка подключения к WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket подключен');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Подписываемся на канал LiveWins
        const subscribeMessage = {
          type: 'subscribe',
          channel: 'LiveWins'
        };
        wsRef.current?.send(JSON.stringify(subscribeMessage));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          
          // Обрабатываем сообщения KeepAlive для поддержания соединения
          if (message.type === 'KeepAlive') {
            console.log('Получен KeepAlive:', new Date(message.timestamp * 1000));
            return;
          }
          
          // Обрабатываем только сообщения канала LiveWins с данными выигрышей
          if (message.type === 'message' && message.channel === 'LiveWins' && message.data) {
            console.log('Получен новый выигрыш:', message.data);
            const newWin = transformWSData(message.data);
            
            setWins(prevWins => {
              // Проверяем, нет ли уже такого выигрыша (по ID пользователя, предмета и времени)
              const isDuplicate = prevWins.some(win => 
                win.id === newWin.id || 
                (win.playerName === newWin.playerName && 
                 win.itemName === newWin.itemName && 
                 Math.abs(win.timestamp.getTime() - newWin.timestamp.getTime()) < 1000) // в пределах 1 секунды
              );
              
              if (isDuplicate) {
                console.log('Дублирующий выигрыш проигнорирован:', newWin.playerName, newWin.itemName);
                return prevWins;
              }
              
              // Добавляем новый выигрыш в начало списка и ограничиваем до 10 элементов
              const updatedWins = [newWin, ...prevWins].slice(0, 10);
              console.log('Обновлен список выигрышей:', updatedWins.length, 'элементов');
              return updatedWins;
            });
          }
        } catch (err) {
          console.error('Ошибка при обработке сообщения WebSocket:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket отключен:', {
          code: event.code,
          reason: event.reason || 'Причина не указана',
          wasClean: event.wasClean,
          timestamp: new Date().toISOString()
        });
        setIsConnected(false);
        
        // Определяем причину отключения для более понятного сообщения
        let errorMessage = 'Соединение с сервером потеряно';
        if (event.code === 1006) {
          errorMessage = 'Сервер недоступен или заблокирован';
        } else if (event.code === 1002) {
          errorMessage = 'Ошибка протокола WebSocket';
        } else if (event.code === 1003) {
          errorMessage = 'Неподдерживаемый тип данных';
        }
        
        // Попытка переподключения, если это не было намеренное закрытие
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          console.log(`Попытка переподключения ${reconnectAttempts.current}/${maxReconnectAttempts} через ${delay}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError(`${errorMessage}. Превышено количество попыток переподключения`);
        } else {
          setError(errorMessage);
        }
      };

      wsRef.current.onerror = (event) => {
        const ws = event.target as WebSocket;
        const readyStateNames = {
          0: 'CONNECTING',
          1: 'OPEN', 
          2: 'CLOSING',
          3: 'CLOSED'
        };
        
        console.error('Ошибка WebSocket:', {
          type: event.type,
          readyState: ws?.readyState,
          readyStateName: readyStateNames[ws?.readyState as keyof typeof readyStateNames] || 'UNKNOWN',
          url: wsUrl,
          timestamp: new Date().toISOString()
        });
        setError('Ошибка подключения к серверу');
      };

    } catch (err) {
      console.error('Ошибка при создании WebSocket соединения:', {
        message: err instanceof Error ? err.message : 'Неизвестная ошибка',
        name: err instanceof Error ? err.name : 'Unknown',
        stack: err instanceof Error ? err.stack : undefined,
        url: 'wss://battle-api.chasman.engineer/ws'
      });
      setError('Не удалось создать подключение');
    }
  };

  const disconnect = () => {
    // Очищаем все таймауты
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Намеренное отключение');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttempts.current = 0;
  };

  useEffect(() => {
    // Функция для проверки авторизации и инициализации подключения
    const initializeConnection = () => {
      // Проверяем, авторизован ли пользователь
      if (!hasAuthToken()) {
        console.log('Пользователь не авторизован, WebSocket подключение отложено');
        return;
      }

      // Предотвращаем создание множественных соединений
      if (wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket уже подключен или подключается, пропускаем создание нового соединения');
        return;
      }

      console.log('Пользователь авторизован, инициализируем WebSocket подключение через 1 секунду');
      
      // Ждем 1 секунду после запуска приложения перед подключением к WebSocket
      initTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 1000);
    };

    // Проверяем авторизацию каждые 100ms до тех пор, пока пользователь не авторизуется
    const authCheckInterval = setInterval(() => {
      if (hasAuthToken()) {
        clearInterval(authCheckInterval);
        initializeConnection();
      }
    }, 100);

    // Очищаем интервал через 10 секунд, если авторизация так и не произошла
    const authTimeout = setTimeout(() => {
      clearInterval(authCheckInterval);
      console.log('Таймаут ожидания авторизации, WebSocket подключение не будет установлено');
    }, 10000);

    return () => {
      clearInterval(authCheckInterval);
      clearTimeout(authTimeout);
      disconnect();
    };
  }, []);

  return {
    wins,
    isConnected,
    error,
    reconnect: connectWebSocket,
    disconnect
  };
}