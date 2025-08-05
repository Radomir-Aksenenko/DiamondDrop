/**
 * Конфигурация анимации рулетки
 * Содержит карту скоростей для создания плавной анимации с напряжением в конце
 */

export interface SpeedPoint {
  time: number; // Время в миллисекундах (относительно 1000мс)
  speed: number; // Скорость в пикселях за секунду
}

/**
 * Карта скоростей для анимации рулетки
 * Время указано в миллисекундах относительно 1000мс (будет масштабировано)
 * Скорость указана в пикселях за секунду
 * 
 * Логика анимации:
 * - Плавный старт с постепенным разгоном
 * - Поддержание высокой скорости в середине
 * - Постепенное замедление с созданием напряжения в конце
 * - Очень медленное пролистывание в последние моменты
 */
export const ROULETTE_SPEED_MAP: SpeedPoint[] = [
  { time: 30, speed: 45 },
  { time: 50, speed: 42.5 },
  { time: 70, speed: 40 },
  { time: 90, speed: 37.5 },
  { time: 110, speed: 35 },
  { time: 130, speed: 32.5 },
  { time: 150, speed: 30 },
  { time: 170, speed: 27.5 },
  { time: 190, speed: 25 },
  { time: 210, speed: 22.5 },
  { time: 230, speed: 20 },
  { time: 250, speed: 17.5 },
  { time: 270, speed: 15 },
  { time: 290, speed: 12.5 },
  { time: 310, speed: 12 },
  { time: 330, speed: 11 },
  { time: 350, speed: 10 },
  { time: 370, speed: 9 },
  { time: 390, speed: 8 },
  { time: 410, speed: 7 },
  { time: 430, speed: 6 },
  { time: 450, speed: 5 },
  { time: 480, speed: 4.5 },
  { time: 510, speed: 4 },
  { time: 540, speed: 3.5 },
  { time: 570, speed: 3 },
  { time: 600, speed: 2.8 },
  { time: 630, speed: 2.6 },
  { time: 660, speed: 2.4 },
  { time: 690, speed: 2.2 },
  { time: 720, speed: 2 },
  { time: 750, speed: 1.8 },
  { time: 780, speed: 1.6 },
  { time: 810, speed: 1.4 },
  { time: 840, speed: 1.2 },
  { time: 870, speed: 1 },
  { time: 890, speed: 0.8 },
  { time: 910, speed: 0.6 },
  { time: 925, speed: 0.45 },
  { time: 940, speed: 0.35 },
  { time: 950, speed: 0.25 },
  { time: 960, speed: 0.18 },
  { time: 970, speed: 0.12 },
  { time: 980, speed: 0.08 },
  { time: 987, speed: 0.05 },
  { time: 992, speed: 0.03 },
  { time: 995, speed: 0.02 },
  { time: 996.5, speed: 0.015 },
  { time: 997.5, speed: 0.012 },
  { time: 998.2, speed: 0.01 },
  { time: 998.7, speed: 0.008 },
  { time: 999.1, speed: 0.006 },
  { time: 999.4, speed: 0.004 },
  { time: 999.6, speed: 0.003 },
  { time: 999.75, speed: 0.002 },
  { time: 999.85, speed: 0.0015 },
  { time: 999.92, speed: 0.001 },
  { time: 999.96, speed: 0.0007 },
  { time: 999.98, speed: 0.0004 },
  { time: 999.99, speed: 0.0002 },
  { time: 1000, speed: 0.0001 }
];

/**
 * Получает карту скоростей для анимации рулетки
 * @returns Массив точек скорости для анимации
 */
export const getRouletteSpeedMap = (): SpeedPoint[] => {
  return ROULETTE_SPEED_MAP;
};