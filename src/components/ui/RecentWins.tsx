'use client';

import React from 'react';
import RarityCard, { RarityType } from './RarityCard';
import useLiveWins from '@/hooks/useLiveWins';

// Моковые данные для демонстрации (используются как fallback)
const mockWins = [
  {
    id: 'mock-1',
    playerName: 'Player123',
    rarity: 'Legendary' as RarityType,
    percentage: '0.01%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/netherite_sword/icon',
    itemName: 'Золотой меч',
    apValue: 999,
    timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 минут назад
  },
  {
    id: 'mock-2',
    playerName: 'GamerPro',
    rarity: 'Epic' as RarityType,
    percentage: '0.5%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond_chestplate/icon',
    itemName: 'Магический щит',
    apValue: 250,
    timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 минут назад
  },
  {
    id: 'mock-3',
    playerName: 'LuckyOne',
    rarity: 'Rare' as RarityType,
    percentage: '2.5%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/diamond/icon',
    itemName: 'Редкий кристалл',
    apValue: 100,
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 минут назад
  },
  {
    id: 'mock-4',
    playerName: 'Winner2024',
    rarity: 'Uncommon' as RarityType,
    percentage: '15.0%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/iron_ingot/icon',
    itemName: 'Необычный артефакт',
    apValue: 50,
    timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 минут назад
  },
  {
    id: 'mock-5',
    playerName: 'NewPlayer',
    rarity: 'Common' as RarityType,
    percentage: '82.0%',
    itemImage: 'https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/cobblestone/icon',
    itemName: 'Обычный предмет',
    apValue: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 час назад
  }
];

export default function RecentWins() {
  const { wins: liveWins, isConnected, error } = useLiveWins();

  // Используем живые данные, если они есть, иначе моковые
  const displayWins = liveWins.length > 0 ? liveWins : mockWins;

  return (
    <div className="w-full max-w-4xl mx-auto mt-4">

      {/* Горизонтальная прокрутка карточек */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {displayWins.map((win) => (
            <div key={win.id} className="flex-shrink-0">
              <RarityCard
                rarity={win.rarity}
                percentage={win.percentage}
                itemImage={win.itemImage}
                itemName={win.itemName}
                apValue={win.apValue}
                orientation="horizontal"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Сообщение об ошибке */}
      {error && !isConnected && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">
            {error}. Показаны демонстрационные данные.
          </p>
        </div>
      )}
    </div>
  );
}