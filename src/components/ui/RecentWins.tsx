'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import RarityCard from './RarityCard';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';
import useLiveWins, { LiveWinData } from '@/hooks/useLiveWins';

export default function RecentWins() {
  const router = useRouter();
  const { liveWins: preloadedWins, refreshLiveWins } = usePreloadedData();
  const { wins: liveWins, isConnected, error } = useLiveWins({ initialData: preloadedWins });
  const [displayWins, setDisplayWins] = useState<LiveWinData[]>(liveWins);
  const [animatingWins, setAnimatingWins] = useState<Set<string>>(new Set());
  const [isShifting, setIsShifting] = useState(false);
  const prevWinsRef = useRef<LiveWinData[]>(liveWins);
  const mountTimeRef = useRef<number>(Date.now());

  // Функция для перехода на профиль пользователя
  const handlePlayerClick = (playerName: string) => {
    // Переходим на профиль пользователя, используя никнейм вместо ID
    router.push(`/profile/${encodeURIComponent(playerName)}`);
  };

  const handleCaseClick = (caseId: string) => {
    router.push(`/case/${caseId}`);
  };

  // Эффект для обновления лайв-винов по API при каждом монтировании (возврат на главную)
  useEffect(() => {
    const doRefresh = async () => {
      try {
        await refreshLiveWins();
      } catch {}
    };
    doRefresh();
  }, [refreshLiveWins]);

  // Обновляем отображаемые выигрыши при получении новых данных из WebSocket
  useEffect(() => {
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
  }, [liveWins]);

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
                playerName={win.playerName}
                playerAvatarUrl={win.playerAvatarUrl}
                showPlayerOnHover={true}
                onPlayerClick={() => handlePlayerClick(win.playerName)}
                onCardClick={() => handleCaseClick(win.caseId)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Индикатор подключения в правом нижнем углу */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[rgba(21,21,25,0.9)] border border-red-500/40 rounded-full px-3 py-2 shadow-lg">
          <span className="relative inline-flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs text-red-400 font-['Actay_Wide']">Подключение...</span>
        </div>
      )}
    </div>
  );
}