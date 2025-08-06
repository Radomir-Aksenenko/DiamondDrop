'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  amount: number;
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
    rarity: mapRarityToType(wsData.item.Rarity),
    percentage: `${wsData.item.PercentChance.toFixed(2)}%`,
    itemImage: wsData.item.ImageUrl || 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/cobblestone/icon',
    itemName: decodeUnicode(wsData.item.Name),
    apValue: parseFloat(wsData.item.Price.toFixed(1)), // Сохраняем дробные значения до десятых
    amount: wsData.item.Amount || 1, // Извлекаем количество из данных
    timestamp: new Date()
  };
};

interface UseLiveWinsOptions {
  initialData?: LiveWinData[];
}

export default function useLiveWins(options: UseLiveWinsOptions = {}) {
  const [wins, setWins] = useState<LiveWinData[]>(options.initialData || []);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);
  const isConnectingRef = useRef(false);
  const isMountedRef = useRef(true);
  
  // Добавляем счетчик для уникальных ID и очередь для обработки сообщений
  const messageCounterRef = useRef(0);
  const processingQueueRef = useRef<LiveWinData[]>([]);
  const isProcessingRef = useRef(false);
  const processMessageQueueRef = useRef<(() => void) | undefined>(undefined);
  const lastPageVisitRef = useRef<number>(Date.now());

  // Функция для обработки очереди сообщений
  const processMessageQueue = useCallback(() => {
    if (isProcessingRef.current || processingQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    
    // Берем все сообщения из очереди
    const newWins = [...processingQueueRef.current];
    processingQueueRef.current = [];

    console.log(`Processing batch of ${newWins.length} wins`);

    setWins(prevWins => {
      // Создаем Set существующих ID для быстрой проверки
      const existingIds = new Set(prevWins.map(win => win.id));
      
      // Фильтруем только действительно новые выигрыши
      const uniqueNewWins = newWins.filter(newWin => !existingIds.has(newWin.id));
      
      if (uniqueNewWins.length === 0) {
        console.log('All wins in batch already exist, skipping');
        return prevWins;
      }

      // Добавляем новые выигрыши в начало списка и ограничиваем до 10 элементов
      const updatedWins = [...uniqueNewWins, ...prevWins].slice(0, 10);
      console.log(`Added ${uniqueNewWins.length} new wins, total: ${updatedWins.length}`);
      
      return updatedWins;
    });

    // Сбрасываем флаг обработки через небольшую задержку
    setTimeout(() => {
      isProcessingRef.current = false;
      // Проверяем, не появились ли новые сообщения в очереди
      if (processingQueueRef.current.length > 0) {
        processMessageQueueRef.current?.();
      }
    }, 50);
  }, []);

  // Сохраняем функцию в ref для использования в connectWebSocket
  processMessageQueueRef.current = processMessageQueue;

  const connectWebSocket = useCallback(() => {
    try {
      // Проверяем, что компонент еще смонтирован
      if (!isMountedRef.current) {
        console.log('Компонент размонтирован, отменяем подключение WebSocket');
        return;
      }

      // Проверяем, что пользователь авторизован
      if (!hasAuthToken()) {
        console.log('Пользователь не авторизован, отменяем подключение WebSocket');
        return;
      }

      // Предотвращаем множественные соединения
      if (isConnectingRef.current) {
        console.log('WebSocket уже подключается, пропускаем новое подключение');
        return;
      }

      if (wsRef.current?.readyState === WebSocket.CONNECTING || wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket уже подключен или подключается, пропускаем создание нового соединения');
        return;
      }

      // Проверяем поддержку WebSocket в браузере
      if (typeof WebSocket === 'undefined') {
        console.error('WebSocket не поддерживается в этом браузере');
        setError('WebSocket не поддерживается в этом браузере');
        return;
      }

      // Устанавливаем флаг подключения
      isConnectingRef.current = true;

      // URL WebSocket из примера
      const wsUrl = 'wss://battle-api.chasman.engineer/ws';
      console.log('Попытка подключения к WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket подключен');
        isConnectingRef.current = false;
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
            // console.log('Получен KeepAlive:', new Date(message.timestamp * 1000)); // Убрано для предотвращения спама в консоли
            return;
          }
          
          // Обрабатываем только сообщения канала LiveWins с данными выигрышей
          if (message.type === 'message' && message.channel === 'LiveWins' && message.data) {
            console.log('Получен новый выигрыш:', message.data);
            
            // Увеличиваем счетчик сообщений
            messageCounterRef.current += 1;
            
            const newWin = transformWSData(message.data, messageCounterRef.current);
            console.log('Transformed win:', newWin);
            
            // Добавляем выигрыш в очередь для обработки
            processingQueueRef.current.push(newWin);
            
            // Запускаем обработку очереди с небольшой задержкой для накопления сообщений
            setTimeout(() => {
              processMessageQueueRef.current?.();
            }, 10);
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
        isConnectingRef.current = false;
        setIsConnected(false);
        
        // Проверяем, что компонент еще смонтирован
        if (!isMountedRef.current) {
          console.log('Компонент размонтирован, отменяем переподключение');
          return;
        }
        
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
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts && hasAuthToken()) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          console.log(`Попытка переподключения ${reconnectAttempts.current}/${maxReconnectAttempts} через ${delay}ms`);
          
          // Очищаем предыдущий таймаут переподключения
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && hasAuthToken()) {
              connectWebSocket();
            }
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
        
        isConnectingRef.current = false;
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
  }, []);

  const disconnect = useCallback(() => {
    console.log('Отключение WebSocket соединения');
    
    // Очищаем все таймауты и интервалы
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    if (authCheckIntervalRef.current) {
      clearInterval(authCheckIntervalRef.current);
      authCheckIntervalRef.current = null;
    }
    
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
      authTimeoutRef.current = null;
    }
    
    // Сбрасываем флаги состояния
    isConnectingRef.current = false;
    reconnectAttempts.current = 0;
    
    // Закрываем WebSocket соединение
    if (wsRef.current) {
      wsRef.current.close(1000, 'Намеренное отключение');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setError(null);
  }, []);

  useEffect(() => {
    // Устанавливаем флаг монтирования
    isMountedRef.current = true;
    
    // Функция для проверки авторизации и инициализации подключения
    const initializeConnection = () => {
      if (!isMountedRef.current) {
        console.log('Компонент размонтирован, отменяем инициализацию');
        return;
      }

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
      
      // Очищаем предыдущий таймаут инициализации
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      
      // Ждем 1 секунду после запуска приложения перед подключением к WebSocket
      initTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && hasAuthToken()) {
          connectWebSocket();
        }
      }, 1000);
    };

    // Проверяем авторизацию каждые 500ms до тех пор, пока пользователь не авторизуется
    authCheckIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        return;
      }
      
      if (hasAuthToken()) {
        if (authCheckIntervalRef.current) {
          clearInterval(authCheckIntervalRef.current);
          authCheckIntervalRef.current = null;
        }
        initializeConnection();
      }
    }, 500);

    // Очищаем интервал через 10 секунд, если авторизация так и не произошла
    authTimeoutRef.current = setTimeout(() => {
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current);
        authCheckIntervalRef.current = null;
      }
      console.log('Таймаут ожидания авторизации, WebSocket подключение не будет установлено');
    }, 10000);

    return () => {
      // Устанавливаем флаг размонтирования
      isMountedRef.current = false;
      disconnect();
    };
  }, [connectWebSocket, disconnect]);

  // Эффект для обновления соединения при возвращении на страницу
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isMountedRef.current) {
        const now = Date.now();
        const timeSinceLastVisit = now - lastPageVisitRef.current;
        
        // Если прошло более 30 секунд с последнего посещения и соединение не активно, пытаемся переподключиться
        if (timeSinceLastVisit > 30000 && !isConnected && hasAuthToken()) {
          console.log('Page became visible after long absence, checking WebSocket connection');
          
          // Пытаемся переподключиться только если соединение не активно
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            setTimeout(() => {
              if (isMountedRef.current && hasAuthToken() && !isConnected) {
                connectWebSocket();
              }
            }, 1000);
          }
        }
        
        lastPageVisitRef.current = now;
      }
    };

    // Добавляем слушатель события
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectWebSocket, isConnected]);

  // Функция для принудительного обновления соединения
  const forceRefresh = useCallback(() => {
    if (!isMountedRef.current) {
      console.log('Компонент размонтирован, отменяем принудительное обновление');
      return;
    }
    
    console.log('Force refreshing WebSocket connection');
    
    // Сбрасываем счетчик попыток переподключения
    reconnectAttempts.current = 0;
    
    if (wsRef.current) {
      disconnect();
      setTimeout(() => {
        if (isMountedRef.current && hasAuthToken()) {
          connectWebSocket();
        }
      }, 1000);
    } else if (hasAuthToken()) {
      connectWebSocket();
    }
    
    lastPageVisitRef.current = Date.now();
  }, [connectWebSocket, disconnect]);

  return {
    wins,
    isConnected,
    error,
    reconnect: connectWebSocket,
    disconnect,
    forceRefresh
  };
}