'use client';

import React from 'react';
import RarityCard, { RarityType } from './RarityCard';

// Интерфейс для данных выигрыша
interface WinData {
  id: string;
  playerName: string;
  rarity: RarityType;
  percentage: string;
  itemImage: string;
  itemName: string;
  apValue: number;
  timestamp: Date;
}

// Моковые данные для демонстрации (в реальном проекте будут приходить из API)
const mockWins: WinData[] = [
  {
    id: '1',
    playerName: 'Player123',
    rarity: 'Legendary',
    percentage: '99.99%',
    itemImage: '/sword-legendary.svg', // Заменить на реальное изображение
    itemName: 'Золотой меч',
    apValue: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 минут назад
  },
  {
    id: '2',
    playerName: 'GamerPro',
    rarity: 'Epic',
    percentage: '99.99%',
    itemImage: '/shield-item.svg',
    itemName: 'Магический щит',
    apValue: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 минут назад
  },
  {
    id: '3',
    playerName: 'LuckyOne',
    rarity: 'Rare',
    percentage: '99.99%',
    itemImage: '/crystal-item.svg',
    itemName: 'Редкий кристалл',
    apValue: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 минут назад
  },
  {
    id: '4',
    playerName: 'Winner2024',
    rarity: 'Uncommon',
    percentage: '99.99%',
    itemImage: '/placeholder-item.svg',
    itemName: 'Необычный артефакт',
    apValue: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 минут назад
  },
  {
    id: '5',
    playerName: 'NewPlayer',
    rarity: 'Common',
    percentage: '99.99%',
    itemImage: '/placeholder-item.svg',
    itemName: 'Обычный предмет',
    apValue: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 час назад
  }
];

// Функция для форматирования времени
const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'только что';
  if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ч назад`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} д назад`;
};

export default function RecentWins() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {/* Заголовок секции */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Последние выигрыши
        </h2>
        <div className="w-full h-[1px] bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/50 to-transparent"></div>
      </div>

      {/* Список выигрышей */}
      <div className="space-y-4">
        {mockWins.map((win) => (
          <div 
            key={win.id}
            className="bg-[#19191D] rounded-lg p-4 border border-gray-700/50 hover:border-[var(--accent)]/30 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              {/* Левая часть - информация об игроке и времени */}
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">
                    {win.playerName}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatTimeAgo(win.timestamp)}
                  </span>
                </div>
                <div className="text-gray-300 text-sm">
                  выиграл
                </div>
              </div>

              {/* Центральная часть - карточка предмета */}
              <div className="flex-shrink-0">
                <RarityCard
                  rarity={win.rarity}
                  percentage={win.percentage}
                  itemImage={win.itemImage}
                  itemName={win.itemName}
                  apValue={win.apValue}
                  className="scale-75" // Уменьшаем размер для компактности
                />
              </div>

              {/* Правая часть - название предмета */}
              <div className="flex flex-col items-end">
                <span className="text-white font-medium text-sm">
                  {win.itemName}
                </span>
                <span className="text-[var(--accent)] text-xs">
                  {win.rarity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка "Показать больше" */}
      <div className="mt-6 text-center">
        <button className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors duration-300 font-medium">
          Показать больше
        </button>
      </div>
    </div>
  );
}