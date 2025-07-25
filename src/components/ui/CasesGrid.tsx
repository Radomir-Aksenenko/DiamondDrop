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
      <div className="w-full max-w-7xl mx-auto mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div 
              key={index}
              className="bg-gradient-to-b from-[#1A1A24] to-[#0F0F16] rounded-2xl p-4 border border-[#2A2A3A] animate-pulse"
            >
              {/* Скелетон изображения */}
              <div className="w-full h-48 mb-4 rounded-xl bg-[#2A2A3A]" />
              
              {/* Скелетон текста */}
              <div className="space-y-3">
                <div className="h-6 bg-[#2A2A3A] rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-[#2A2A3A] rounded w-full" />
                  <div className="h-4 bg-[#2A2A3A] rounded w-2/3" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 bg-[#2A2A3A] rounded w-16" />
                  <div className="h-8 bg-[#2A2A3A] rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error && cases.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-6">
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
      <div className="w-full max-w-4xl mx-auto mt-6">
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
    <div className="w-full max-w-7xl mx-auto mt-6">
      {/* Сетка кейсов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {cases.map((caseData) => (
          <CaseCard 
            key={caseData.id} 
            case={caseData} 
            onClick={handleCaseClick}
          />
        ))}
      </div>

      {/* Индикатор загрузки дополнительных кейсов */}
      {loadingMore && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-3 text-[#5C5ADC]">
            <div className="w-6 h-6 border-2 border-[#5C5ADC] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Загружаем еще кейсы...</span>
          </div>
        </div>
      )}

      {/* Элемент для отслеживания прокрутки */}
      {hasMore && !loadingMore && (
        <div 
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center mt-8"
        >
          <div className="text-gray-500 text-sm">
            Прокрутите вниз для загрузки еще
          </div>
        </div>
      )}

      {/* Сообщение о том, что все кейсы загружены */}
      {!hasMore && cases.length > 0 && (
        <div className="text-center mt-8 py-6">
          <div className="text-gray-400 text-sm">
            Все кейсы загружены
          </div>
        </div>
      )}

      {/* Сообщение об ошибке при загрузке дополнительных кейсов */}
      {error && cases.length > 0 && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm text-center">
            Ошибка при загрузке дополнительных кейсов: {error}
          </p>
        </div>
      )}
    </div>
  );
}