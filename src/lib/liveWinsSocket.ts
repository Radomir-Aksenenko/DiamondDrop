'use client';

import { hasAuthToken } from '@/lib/auth';

export type RarityType = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

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
}

type Listener = {
  onWin?: (win: LiveWinData) => void;
  onBroadcast?: (payload: BroadcastPayload) => void;
  onConnected?: (connected: boolean) => void;
  onError?: (message: string | null) => void;
};

type WSUser = { Id: string; Username: string; AvatarUrl: string | null };
type WSCase = { Id: string; Name: string; Description: string; ImageUrl: string | null; Price: number };
type WSItem = { Id: string; Name: string; Description: string | null; ImageUrl: string; Amount: number; Price: number; PercentChance: number; Rarity: string };
type WSWinData = { user: WSUser; case: WSCase; item: WSItem };
type WSWinMessage = { type: 'message'; channel: 'LiveWins'; data: WSWinData };
type WSKeepAliveMessage = { type: 'KeepAlive'; timestamp: number };
export type BroadcastPayload = { title: string; text: string; imageUrl: string | null };
type WSBroadcastMessage = { type: 'broadcast'; data: BroadcastPayload };
type WSMessage = WSWinMessage | WSKeepAliveMessage | WSBroadcastMessage;

function mapRarityToType(rarity: string): RarityType {
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
}

function transformWSData(wsData: WSWinData, messageCounter: number): LiveWinData {
  const decodeUnicode = (str: string): string => {
    try {
      return JSON.parse(`"${str}"`);
    } catch {
      return str;
    }
  };

  const uniqueId = `ws-${wsData.user.Id}-${wsData.item.Id}-${wsData.case.Id}-${Date.now()}-${messageCounter}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: uniqueId,
    playerName: wsData.user.Username,
    playerAvatarUrl: wsData.user.AvatarUrl,
    rarity: mapRarityToType(wsData.item.Rarity),
    percentage: `${wsData.item.PercentChance.toFixed(2)}%`,
    itemImage: wsData.item.ImageUrl || 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/cobblestone/icon',
    itemName: decodeUnicode(wsData.item.Name),
    apValue: parseFloat(wsData.item.Price.toFixed(1)),
    amount: wsData.item.Amount || 1,
    timestamp: new Date()
  };
}

class LiveWinsSocketManager {
  private ws: WebSocket | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<Listener> = new Set();
  private _isConnected: boolean = false;
  private _error: string | null = null;
  private messageCounter: number = 0;

  get isConnected(): boolean { return this._isConnected; }
  get error(): string | null { return this._error; }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Inform current state
    listener.onConnected?.(this._isConnected);
    listener.onError?.(this._error);

    // Ensure connection exists
    this.connectOnce();

    return () => {
      this.listeners.delete(listener);
      // Do not disconnect on unsubscribe to persist across pages
    };
  }

  forceRefresh(): void {
    this.reconnectAttempts = 0;
    if (this.ws) {
      try { this.ws.close(1000, 'Force refresh'); } catch {}
      this.ws = null;
    }
    this._isConnected = false;
    this._error = null;
    this.notifyConnected();
    this.notifyError();
    this.connectOnce();
  }

  private notifyWin(win: LiveWinData) {
    this.listeners.forEach(l => l.onWin?.(win));
  }

  private notifyConnected() {
    this.listeners.forEach(l => l.onConnected?.(this._isConnected));
  }

  private notifyError() {
    this.listeners.forEach(l => l.onError?.(this._error));
  }

  private notifyBroadcast(payload: BroadcastPayload) {
    this.listeners.forEach(l => l.onBroadcast?.(payload));
  }

  private setConnected(connected: boolean) {
    this._isConnected = connected;
    this.notifyConnected();
  }

  private setError(message: string | null) {
    this._error = message;
    this.notifyError();
  }

  private connectOnce(): void {
    if (typeof window === 'undefined') return;
    if (!hasAuthToken()) return;
    if (this.isConnecting) return;
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) return;

    this.isConnecting = true;
    const wsUrl = 'wss://battle-api.chasman.engineer/ws';
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.setConnected(true);
        this.setError(null);
        this.reconnectAttempts = 0;
        try {
          this.ws?.send(JSON.stringify({ type: 'subscribe', channel: 'LiveWins' }));
        } catch {}
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          if ((message as WSKeepAliveMessage).type === 'KeepAlive') {
            return;
          }
          if ((message as WSBroadcastMessage).type === 'broadcast') {
            const b = message as WSBroadcastMessage;
            if (b.data && typeof b.data.title === 'string' && typeof b.data.text === 'string') {
              this.notifyBroadcast({ title: b.data.title, text: b.data.text, imageUrl: b.data.imageUrl ?? null });
            }
            return;
          }
          const winMsg = message as WSWinMessage;
          if (winMsg.type === 'message' && winMsg.channel === 'LiveWins' && winMsg.data) {
            this.messageCounter += 1;
            const win = transformWSData(winMsg.data, this.messageCounter);
            this.notifyWin(win);
          }
        } catch (err) {
          // swallow
        }
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false;
        this.setConnected(false);

        let errorMessage = 'Соединение с сервером потеряно';
        if (event.code === 1006) errorMessage = 'Сервер недоступен или заблокирован';
        else if (event.code === 1002) errorMessage = 'Ошибка протокола WebSocket';
        else if (event.code === 1003) errorMessage = 'Неподдерживаемый тип данных';

        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts && hasAuthToken()) {
          this.reconnectAttempts += 1;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = setTimeout(() => {
            this.connectOnce();
          }, delay);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.setError(`${errorMessage}. Превышено количество попыток переподключения`);
        } else {
          this.setError(errorMessage);
        }
      };

      this.ws.onerror = () => {
        this.isConnecting = false;
        this.setError('Ошибка подключения к серверу');
      };
    } catch (err) {
      this.isConnecting = false;
      this.setError('Не удалось создать подключение');
    }
  }
}

export const liveWinsSocket = new LiveWinsSocketManager();


