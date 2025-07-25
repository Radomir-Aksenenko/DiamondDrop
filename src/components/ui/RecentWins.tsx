'use client';

import React, { useEffect, useState } from 'react';
import RarityCard, { RarityType } from './RarityCard';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';
import useLiveWins, { LiveWinData } from '@/hooks/useLiveWins';

export default function RecentWins() {
  const { liveWins: preloadedWins } = usePreloadedData();
  const { wins: liveWins, isConnected, error } = useLiveWins();
  const [displayWins, setDisplayWins] = useState<LiveWinData[]>(preloadedWins);

  // Обновляем отображаемые выигрыши при получении новых данных из WebSocket
  useEffect(() => {
    if (liveWins.length > 0) {
      // Если есть живые данные, используем их
      setDisplayWins(liveWins);
    } else {
      // Иначе используем предзагруженные данные
      setDisplayWins(preloadedWins);
    }
  }, [liveWins, preloadedWins]);

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
            {error}. Показаны предзагруженные данные.
          </p>
        </div>
      )}

      {/* Индикатор подключения WebSocket */}
      {!isConnected && !error && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-sm">
            Подключение к серверу... Показаны предзагруженные данные.
          </p>
        </div>
      )}
    </div>
  );
}