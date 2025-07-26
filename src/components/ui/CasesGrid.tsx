'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import CaseCard from './CaseCard';
import useCasesAPI, { CaseData } from '@/hooks/useCasesAPI';

/**
 * Компонент сетки кейсов с бесконечной прокруткой
 */
export default function CasesGrid() {
  const { cases, loading, loadingMore, error, hasMore, loadMore } = useCasesAPI();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /**
   * Обработчик клика по кейсу
   */
  const handleCaseClick = useCallback((caseData: CaseData) => {
    console.log('Клик по кейсу:', caseData);
    // Здесь можно добавить логику открытия кейса
  }, []);

  /**
   * Настройка Intersection Observer для бесконечной прокрутки
   */
  useEffect(() => {
    if (loading || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loadingMore) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, loadMore]);

  // Показываем скелетон загрузки для первой загрузки
  if (loading && cases.length === 0) {
    return (
      <div className="w-full px-6 mt-2 mb-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <div 
              key={index}
              className="bg-[#151519] rounded-xl p-3 sm:p-4 animate-pulse w-full max-w-[175px] sm:max-w-[200px] md:max-w-[220px] h-[274px] sm:h-[300px] md:h-[320px] mx-auto"
            >
              {/* Скелетон названия */}
              <div className="h-6 sm:h-7 md:h-8 bg-[#2A2A3A] rounded mb-2 sm:mb-3" />
              
              {/* Скелетон цены */}
              <div className="h-6 sm:h-7 bg-[#2A2A3A] rounded-full w-20 sm:w-24 mx-auto mb-2 sm:mb-3" />
              
              {/* Скелетон изображения */}
              <div className="flex-1 bg-[#2A2A3A] rounded-lg mb-2 sm:mb-3 min-h-[120px] sm:min-h-[140px] md:min-h-[160px]" />
              
              {/* Скелетон кнопки */}
              <div className="h-8 sm:h-10 bg-[#2A2A3A] rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error && cases.length === 0) {
    return (
      <div className="w-full px-6 mt-2 mb-2">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <div className="text-red-400 text-lg font-medium mb-2">
            Ошибка загрузки кейсов
          </div>
          <p className="text-red-300 text-sm mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Показываем сообщение когда кейсов нет
  if (!loading && cases.length === 0 && !error) {
    return (
      <div className="w-full px-6 mt-2 mb-2">
        <div className="bg-[#1A1A24] border border-[#2A2A3A] rounded-lg p-8 text-center">
          <div className="text-gray-400 text-lg font-medium mb-2">
            Кейсы не найдены
          </div>
          <p className="text-gray-500 text-sm">
            В данный момент кейсы недоступны
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 mt-2 mb-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {cases.map((caseItem) => (
          <CaseCard key={caseItem.id} case={caseItem} />
        ))}
      </div>
      
      {/* Индикатор загрузки дополнительных кейсов */}
      {loading && cases.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD700]"></div>
        </div>
      )}
      
      {/* Элемент для отслеживания скролла */}
      <div ref={loadMoreRef} className="h-4" />
    </div>
  );
}