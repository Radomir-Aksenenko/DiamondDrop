/**
 * Утилиты для работы с изображениями предметов
 */

// URL стандартной иконки barrier для fallback
const DEFAULT_ITEM_ICON = 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/barrier/icon';

/**
 * Обрабатывает ошибку загрузки изображения предмета
 * Заменяет неработающую ссылку на стандартную иконку barrier
 * 
 * @param event - событие ошибки загрузки изображения
 */
export const handleItemImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = event.target as HTMLImageElement;
  
  // Проверяем, что это не уже fallback изображение, чтобы избежать бесконечного цикла
  if (target.src !== DEFAULT_ITEM_ICON) {
    target.src = DEFAULT_ITEM_ICON;
  }
};

/**
 * Возвращает URL изображения предмета с fallback на стандартную иконку
 * 
 * @param imageUrl - URL изображения предмета из API
 * @returns URL изображения или стандартная иконка barrier
 */
export const getItemImageUrl = (imageUrl: string | null | undefined): string => {
  return imageUrl || DEFAULT_ITEM_ICON;
};

/**
 * Получает стандартную иконку barrier
 * 
 * @returns URL стандартной иконки barrier
 */
export const getDefaultItemIcon = (): string => {
  return DEFAULT_ITEM_ICON;
};