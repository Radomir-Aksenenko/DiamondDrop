'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CaseCard from './CaseCard';
import { CaseData } from '@/hooks/useCasesAPI';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';
import styles from './CasesGrid.module.css';

/**
 * Компонент сетки кейсов использующий предзагруженные данные
 */
export default function CasesGrid() {
  const { cases, loading, error } = usePreloadedData();
  const router = useRouter();

  /**
   * Обработчик клика по кейсу
   */
  const handleCaseClick = useCallback((caseData: CaseData) => {
    console.log('Клик по кейсу:', caseData);
    // Переходим на страницу кейса используя ID
    router.push(`/case/${caseData.id}`);
  }, [router]);

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
              <CaseCard caseData={caseItem} onClick={handleCaseClick} />
            </div>
          ))}
        </div>

    </div>
  );
}