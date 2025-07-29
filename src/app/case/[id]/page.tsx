'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CaseData } from '@/hooks/useCasesAPI';
import { getAuthToken } from '@/lib/auth';
import { API_BASE_URL, isDevelopment, DEV_CONFIG } from '@/lib/config';

/**
 * Страница отдельного кейса
 */
export default function CasePage() {
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const caseId = params.id as string;

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // В режиме разработки используем моковые данные
        if (isDevelopment) {
          // Имитируем задержку загрузки
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Ищем кейс по ID в моковых данных
          const mockCase = DEV_CONFIG.mockCases.find(c => c.id === caseId);
          
          if (!mockCase) {
            setError('Кейс не найден');
            return;
          }
          
          // Создаем полные данные кейса с предметами
          const fullCaseData: CaseData = {
            ...mockCase,
            items: [
              { name: 'Редкий предмет 1', rarity: 'legendary', chance: 5 },
              { name: 'Эпический предмет 1', rarity: 'epic', chance: 15 },
              { name: 'Редкий предмет 2', rarity: 'rare', chance: 30 },
              { name: 'Обычный предмет 1', rarity: 'common', chance: 50 }
            ]
          };
          
          setCaseData(fullCaseData);
          return;
        }

        const token = getAuthToken();
        if (!token) {
          setError('Необходима авторизация');
          return;
        }

        // В продакшене получаем кейс по ID через API
        const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Кейс не найден');
          } else {
            throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
          }
          return;
        }

        const data = await response.json();
        setCaseData(data);
      } catch (err) {
        console.error('Ошибка при загрузке кейса:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCaseData();
    }
  }, [caseId]);

  // Функция для получения цвета редкости
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'epic':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'rare':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'common':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  // Функция для получения названия редкости на русском
  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'Легендарный';
      case 'epic':
        return 'Эпический';
      case 'rare':
        return 'Редкий';
      case 'common':
        return 'Обычный';
      default:
        return 'Неизвестный';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C5ADC]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center max-w-md">
          <div className="text-red-400 text-xl font-medium mb-4">
            Ошибка загрузки кейса
          </div>
          <p className="text-red-300 text-sm mb-6">
            {error}
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Попробовать снова
            </button>
            <button 
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-gray-400 text-xl">Кейс не найден</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Кнопка назад */}
      <button 
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Назад
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Основная информация о кейсе */}
        <div className="bg-[#151519] border border-[#19191D] rounded-[12px] p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Изображение кейса */}
            <div className="flex-shrink-0 flex justify-center lg:justify-start">
              {caseData.imageUrl ? (
                <Image 
                  src={caseData.imageUrl} 
                  alt={caseData.name} 
                  width={200} 
                  height={200} 
                  className="object-contain w-[200px] h-[200px]" 
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center bg-gradient-to-br from-[#2A2A3A] to-[#1A1A24] rounded-lg">
                  <div className="flex flex-col items-center justify-center text-[#5C5ADC]">
                    <svg 
                      width="60" 
                      height="60" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="mb-2"
                    >
                      <path 
                        d="M3 10V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V10M3 10V8C3 6.89543 3.89543 6 5 6H19C20.1046 6 21 6.89543 21 8V10M3 10H21M12 14V16" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm opacity-60">Изображение</span>
                  </div>
                </div>
              )}
            </div>

            {/* Информация о кейсе */}
            <div className="flex-1">
              <h1 className="text-white text-3xl font-bold font-actay mb-4">
                {caseData.name}
              </h1>
              
              {/* Цена */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-[#5C5ADC]">{caseData.price}</span>
                <span className="text-xl text-[#5C5ADC]">АР</span>
              </div>

              {/* Описание */}
              {caseData.description && (
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  {caseData.description}
                </p>
              )}

              {/* Кнопка открыть кейс */}
              <button className="bg-[#5C5ADC] hover:bg-[#4947b3] text-white px-8 py-3 rounded-lg font-medium font-unbounded transition-colors duration-200 text-lg">
                Открыть кейс
              </button>
            </div>
          </div>
        </div>

        {/* Содержимое кейса */}
        {caseData.items && caseData.items.length > 0 && (
          <div className="bg-[#151519] border border-[#19191D] rounded-[12px] p-6">
            <h2 className="text-white text-2xl font-bold font-actay mb-6">
              Содержимое кейса
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caseData.items.map((item, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${getRarityColor(item.rarity)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{item.name}</h3>
                    <span className="text-sm font-medium">
                      {item.chance}%
                    </span>
                  </div>
                  <div className="text-sm opacity-80">
                    {getRarityName(item.rarity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}