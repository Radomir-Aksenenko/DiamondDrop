/**
 * Типы для работы с SPWMini
 */

/**
 * Интерфейс пользователя SPWMini
 * Соответствует типу UserData из библиотеки SPWMini
 */
export interface SPWUser {
  /** Имя пользователя */
  username: string;
  /** UUID пользователя в Minecraft */
  minecraftUUID: string;
  /** Уровень пользователя */
  level?: number;
  /** Другие возможные поля */
  avatar?: string;
  email?: string;
  roles?: string[];
  // Удаляем индексную сигнатуру, так как она отсутствует в типе UserData
}

/**
 * Интерфейс для опций запроса валидации
 */
export interface ValidateOptions extends RequestInit {
  /** Таймаут запроса в миллисекундах */
  timeout?: number;
  /** Повторять запрос при ошибке */
  retry?: boolean;
  /** Количество повторов запроса */
  retryCount?: number;
}