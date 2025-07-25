'use client';

import React, { useEffect, useState, useRef } from 'react';
import RarityCard, { RarityType } from './RarityCard';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';
import useLiveWins, { LiveWinData } from '@/hooks/useLiveWins';

export default function RecentWins() {
  const { liveWins: preloadedWins } = usePreloadedData();
  const { wins: liveWins, isConnected, error } = useLiveWins();
  const [displayWins, setDisplayWins] = useState<LiveWinData[]>(preloadedWins);
  const [animatingWins, setAnimatingWins] = useState<Set<string>>(new Set());
  const [isShifting, setIsShifting] = useState(false);
  const prevWinsRef = useRef<LiveWinData[]>(preloadedWins);

  // Обновляем отображаемые выигрыши при получении новых данных из WebSocket
  useEffect(() => {
    if (liveWins.length > 0) {
      // Находим новые выигрыши для анимации
      const prevWinIds = new Set(prevWinsRef.current.map(win => win.id));
      const newWins = liveWins.filter(win => !prevWinIds.has(win.id));
      
      if (newWins.length > 0) {
        // Запускаем анимацию сдвига для всех карточек
        setIsShifting(true);
        
        // Добавляем новые выигрыши в состояние анимации
        setAnimatingWins(prev => new Set([...prev, ...newWins.map(win => win.id)]));
        
        // Убираем анимацию появления через 500ms
        setTimeout(() => {
          setAnimatingWins(prev => {
            const updated = new Set(prev);
            newWins.forEach(win => updated.delete(win.id));
            return updated;
          });
        }, 500);
        
        // Убираем состояние сдвига через 600ms
        setTimeout(() => {
          setIsShifting(false);
        }, 600);
      }
      
      setDisplayWins(liveWins);
      prevWinsRef.current = liveWins;
    } else {
      // Иначе используем предзагруженные данные
      setDisplayWins(preloadedWins);
      prevWinsRef.current = preloadedWins;
    }
  }, [liveWins, preloadedWins]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      {/* Горизонтальная прокрутка карточек */}
      <div className="relative">
        <div className={`flex gap-4 overflow-x-auto no-scrollbar transition-all duration-500 ease-out ${
          isShifting ? 'animate-container-shift' : ''
        }`}>
          {displayWins.map((win, index) => (
            <div 
              key={win.id} 
              className={`flex-shrink-0 transition-all duration-500 ease-out ${
                animatingWins.has(win.id) 
                  ? 'animate-slide-in-left' 
                  : isShifting 
                    ? 'animate-smooth-shift' 
                    : ''
              }`}
              style={{
                transitionDelay: animatingWins.has(win.id) 
                  ? '0ms' 
                  : isShifting 
                    ? `${Math.min(index * 30, 300)}ms` 
                    : '0ms'
              }}
            >
              <RarityCard
                rarity={win.rarity}
                percentage={win.percentage}
                itemImage={win.itemImage}
                itemName={win.itemName}
                apValue={win.apValue}
                amount={win.amount}
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
    </div>
  );
}