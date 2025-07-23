'use client';

import React from 'react';
import RarityCard, { RarityType } from './RarityCard';

// Демонстрационные данные для всех типов редкости
const rarityExamples = [
  {
    rarity: 'Common' as RarityType,
    percentage: '99.99%',
    itemImage: '/placeholder-item.svg',
    itemName: 'Обычный предмет',
    apValue: 12
  },
  {
    rarity: 'Uncommon' as RarityType,
    percentage: '99.99%',
    itemImage: '/placeholder-item.svg',
    itemName: 'Необычный предмет',
    apValue: 12
  },
  {
    rarity: 'Rare' as RarityType,
    percentage: '99.99%',
    itemImage: '/crystal-item.svg',
    itemName: 'Редкий кристалл',
    apValue: 12
  },
  {
    rarity: 'Epic' as RarityType,
    percentage: '99.99%',
    itemImage: '/shield-item.svg',
    itemName: 'Эпический щит',
    apValue: 12
  },
  {
    rarity: 'Legendary' as RarityType,
    percentage: '99.99%',
    itemImage: '/sword-legendary.svg',
    itemName: 'Легендарный меч',
    apValue: 12
  }
];

export default function RarityShowcase() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {/* Заголовок секции */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Типы редкости предметов
        </h2>
        <div className="w-full h-[1px] bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/50 to-transparent"></div>
      </div>

      {/* Сетка карточек */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-items-center">
        {rarityExamples.map((item, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <RarityCard
              rarity={item.rarity}
              percentage={item.percentage}
              itemImage={item.itemImage}
              itemName={item.itemName}
              apValue={item.apValue}
            />
            <span className="text-sm text-gray-300 text-center">
              {item.rarity}
            </span>
          </div>
        ))}
      </div>

      {/* Описание системы редкости */}
      <div className="mt-8 bg-[#19191D] rounded-lg p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">
          Система редкости
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-600 rounded"></div>
              <span className="text-gray-300">Common</span>
              <span className="text-gray-400">- Обычные предметы</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span className="text-green-300">Uncommon</span>
              <span className="text-gray-400">- Необычные предметы</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span className="text-blue-300">Rare</span>
              <span className="text-gray-400">- Редкие предметы</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-600 rounded"></div>
              <span className="text-purple-300">Epic</span>
              <span className="text-gray-400">- Эпические предметы</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-yellow-300">Legendary</span>
              <span className="text-gray-400">- Легендарные предметы</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}