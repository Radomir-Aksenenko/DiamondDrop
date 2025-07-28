'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import CaseCard from './CaseCard';
import useCasesAPI, { CaseData } from '@/hooks/useCasesAPI';
import styles from './CasesGrid.module.css';

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
      <div className="w-full mt-2 mb-2">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <div 
              key={index}
              className={`bg-[#151519] border border-[#19191D] rounded-[12px] p-3 animate-pulse h-[280px] ${styles.caseItem}`}
            >
              {/* Скелетон названия */}
              <div className="h-6 bg-[#2A2A3A] rounded mb-2" />
              
              {/* Скелетон цены */}
              <div className="h-6 bg-[#2A2A3A] rounded-full w-20 mx-auto mb-2" />
              
              {/* Скелетон изображения */}
              <div className="w-[120px] h-[120px] bg-[#2A2A3A] rounded-lg mb-2 mx-auto" />
              
              {/* Скелетон кнопки */}
              <div className="h-8 bg-[#2A2A3A] rounded-lg mt-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error && cases.length === 0) {
    return (
      <div className="w-full mt-2 mb-2">
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
      <div className="w-full mt-2 mb-2">
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
    <div className="w-full mt-2 mb-2">
      <div className="flex flex-wrap gap-2">
        {cases.map((caseItem) => (
          <div key={caseItem.id} className={styles.caseItem}>
            <CaseCard caseData={caseItem} />
          </div>
        ))}
      </div>
      
      {/* Показываем индикатор загрузки при подгрузке */}
      {loading && cases.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}