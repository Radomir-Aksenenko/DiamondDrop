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
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);
  
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

    console.log(`📦 Обрабатываем пакет из ${newWins.length} выигрышей`);

    setWins(prevWins => {
      // Создаем Set существующих ID для быстрой проверки
      const existingIds = new Set(prevWins.map(win => win.id));
      
      // Фильтруем только действительно новые выигрыши
      const uniqueNewWins = newWins.filter(newWin => !existingIds.has(newWin.id));
      
      if (uniqueNewWins.length === 0) {
        console.log('🔄 Все выигрыши в пакете уже существуют, пропускаем');
        return prevWins;
      }

      // Добавляем новые выигрыши в начало списка и ограничиваем до 10 элементов
      const updatedWins = [...uniqueNewWins, ...prevWins].slice(0, 10);
      console.log(`✅ Добавлено ${uniqueNewWins.length} новых выигрышей, всего: ${updatedWins.length}`);
      
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
            
            // Увеличиваем счетчик сообщений
            messageCounterRef.current += 1;
            
            const newWin = transformWSData(message.data, messageCounterRef.current);
            console.log('🔄 Преобразованный выигрыш:', newWin);
            
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
  }, []);

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
  }, [connectWebSocket]);

  // Эффект для обновления соединения при возвращении на страницу
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        const timeSinceLastVisit = now - lastPageVisitRef.current;
        
        // Если прошло более 5 секунд с последнего посещения, обновляем соединение
        if (timeSinceLastVisit > 5000) {
          console.log('🔄 Страница стала видимой после длительного отсутствия, обновляем WebSocket соединение');
          
          // Принудительно переподключаемся для получения свежих данных
          if (wsRef.current) {
            disconnect();
            setTimeout(() => {
              if (hasAuthToken()) {
                connectWebSocket();
              }
            }, 500);
          }
        }
        
        lastPageVisitRef.current = now;
      }
    };

    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastVisit = now - lastPageVisitRef.current;
      
      // Если прошло более 3 секунд с последнего фокуса, обновляем соединение
      if (timeSinceLastVisit > 3000) {
        console.log('🔄 Окно получило фокус после отсутствия, обновляем WebSocket соединение');
        
        // Принудительно переподключаемся для получения свежих данных
        if (wsRef.current && hasAuthToken()) {
          disconnect();
          setTimeout(() => {
            connectWebSocket();
          }, 500);
        }
      }
      
      lastPageVisitRef.current = now;
    };

    // Добавляем слушатели событий
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [connectWebSocket]);

  // Функция для принудительного обновления соединения
  const forceRefresh = useCallback(() => {
    console.log('🔄 Принудительное обновление WebSocket соединения');
    
    if (wsRef.current) {
      disconnect();
      setTimeout(() => {
        if (hasAuthToken()) {
          connectWebSocket();
        }
      }, 500);
    } else if (hasAuthToken()) {
      connectWebSocket();
    }
    
    lastPageVisitRef.current = Date.now();
  }, [connectWebSocket]);

  return {
    wins,
    isConnected,
    error,
    reconnect: connectWebSocket,
    disconnect,
    forceRefresh
  };
}