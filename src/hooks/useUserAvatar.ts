import { useMemo } from 'react';

/**
 * Типы аватаров пользователя
 */
export type AvatarType = 'face' | 'frontbust';

/**
 * Интерфейс для параметров аватара
 */
interface AvatarOptions {
  /** Тип аватара - лицо или тело */
  type: AvatarType;
  /** Размер изображения (по умолчанию 512 для лучшего качества) */
  size?: number;
}

/**
 * Хук для получения URL аватара пользователя
 * @param username - имя пользователя
 * @param options - опции для аватара
 * @returns URL аватара пользователя
 */
export const useUserAvatar = (username: string | null | undefined, options: AvatarOptions) => {
  const { type, size = 512 } = options;

  const avatarUrl = useMemo(() => {
    // Если имя пользователя не указано, возвращаем дефолтный аватар
    if (!username) {
      return `https://avatar.spoverlay.ru/${type}/Steve?w=${size}`;
    }

    // Формируем URL для аватара пользователя
    return `https://avatar.spoverlay.ru/${type}/${username}?w=${size}`;
  }, [username, type, size]);

  return avatarUrl;
};

/**
 * Хук для получения аватара лица пользователя
 * @param username - имя пользователя
 * @param size - размер изображения (по умолчанию 512)
 * @returns URL аватара лица пользователя
 */
export const useUserFaceAvatar = (username: string | null | undefined, size: number = 512) => {
  return useUserAvatar(username, { type: 'face', size });
};

/**
 * Хук для получения аватара тела пользователя
 * @param username - имя пользователя
 * @param size - размер изображения (по умолчанию 512)
 * @returns URL аватара тела пользователя
 */
export const useUserBodyAvatar = (username: string | null | undefined, size: number = 512) => {
  return useUserAvatar(username, { type: 'frontbust', size });
};