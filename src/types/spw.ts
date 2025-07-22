/**
 * Типы для работы с SPWMini
 */

/**
 * Интерфейс пользователя SPWMini
 */
export interface SPWUser {
  /** Имя пользователя */
  username: string;
  /** UUID пользователя в Minecraft */
  minecraftUUID: string;
  /** Уровень пользователя */
  level?: number;
  /** Дополнительные данные пользователя */
  [key: string]: any;
}

/**
 * Интерфейс для опций запроса валидации
 */
export interface ValidateOptions extends RequestInit {
  // Дополнительные опции, если потребуются
}