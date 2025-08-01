/**
 * Система управления токеном авторизации
 * Токен хранится только в памяти на время сессии
 */

import { API_ENDPOINTS, DEV_CONFIG, isDevelopment } from './config';

let authToken: string | null = null;

/**
 * Устанавливает токен авторизации для текущей сессии
 * @param token - JWT токен авторизации
 */
export function setAuthToken(token: string): void {
  authToken = token;
}

/**
 * Получает текущий токен авторизации
 * @returns JWT токен или null если не установлен
 */
export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Очищает токен авторизации
 */
export function clearAuthToken(): void {
  authToken = null;
}

/**
 * Проверяет, установлен ли токен авторизации
 * @returns true если токен установлен
 */
export function hasAuthToken(): boolean {
  return authToken !== null;
}

/**
 * Интерфейс ответа от API валидации
 */
export interface ValidationResponse {
  authToken: string;
}

/**
 * Интерфейс данных для валидации пользователя
 */
export interface ValidationData {
  hash: string;
  accountId: string;
  username: string;
  minecraftUUID: string;
  roles: string[];
  isAdmin: boolean;
  timestamp: number;
}

/**
 * Валидирует пользователя через API и сохраняет токен
 * @param userData - данные пользователя от SPWorlds
 * @returns Promise с токеном авторизации
 */
export async function validateUserAndSetToken(userData: ValidationData): Promise<string> {
  try {
    // В dev режиме пропускаем авторизацию и возвращаем мок токен
    if (isDevelopment && DEV_CONFIG.skipAuth) {
      console.log('🔧 Dev режим: пропускаем авторизацию, используем мок токен');
      setAuthToken(DEV_CONFIG.mockToken);
      return DEV_CONFIG.mockToken;
    }

    const response = await fetch(API_ENDPOINTS.validate, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Ошибка валидации: ${response.status} ${response.statusText}`);
    }

    const data: ValidationResponse = await response.json();
    
    // Сохраняем токен в памяти
    setAuthToken(data.authToken);
    
    return data.authToken;
  } catch (error) {
    console.error('Ошибка при валидации пользователя:', error);
    throw error;
  }
}