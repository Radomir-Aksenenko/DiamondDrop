'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useBannersAPI from '@/hooks/useBannersAPI';
import useSPW from '@/hooks/useSPW';
import { API_ENDPOINTS } from '@/lib/config';

// Запасные данные для баннеров (используются, если API недоступен)
const fallbackBanners = [
  { id: '1', title: 'Новость 1', url: '/news/1', imageUrl: '/Frame 116.png' },
  { id: '2', title: 'Новость 2', url: '/news/2', imageUrl: '/image 27.png' }
];

export default function News() {
  const { banners: apiBanners, loading, error } = useBannersAPI();
  const { isAuthenticated, authToken, makeAuthenticatedRequest } = useSPW();
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Используем баннеры из API или запасные данные
  const banners = apiBanners.length > 0 ? apiBanners : fallbackBanners;
  
  // Пример использования авторизованного запроса
  const handleBannerClick = async (bannerId: string) => {
    if (isAuthenticated) {
      try {
        // Пример отправки статистики клика с авторизацией
        await makeAuthenticatedRequest(API_ENDPOINTS.stats.bannerClick, {
          method: 'POST',
          body: JSON.stringify({
            bannerId,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          })
        });
        console.log('Статистика клика отправлена');
      } catch (error) {
        console.error('Ошибка отправки статистики:', error);
      }
    }
  };
  
  // Функция для переключения на следующий баннер
  const goToNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };
  
  // Функция для переключения на предыдущий баннер
  const goToPrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };
  
  // Функция для переключения на конкретный баннер
  const goToIndex = (index: number) => {
    setActiveIndex(index);
  };
  
  // Обработчик события колесика мыши
  const handleWheel = (e: React.WheelEvent) => {
    // Предотвращаем прокрутку основной страницы
    e.preventDefault();
    
    // Инвертируем логику прокрутки
    if (e.deltaY > 0) {
      goToPrev();
    } else {
      goToNext();
    }
  };
  
  // Автоматическое переключение баннеров каждые 15 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 15000); // 15 секунд
    
    return () => clearInterval(interval);
  }, []);
  
  // Сбрасываем индекс активного баннера при изменении списка баннеров
  useEffect(() => {
    setActiveIndex(0);
  }, [apiBanners]);
  
  // Прокрутка к активному баннеру при изменении activeIndex
  useEffect(() => {
    if (sliderRef.current) {
      const scrollPosition = activeIndex * (770 + 16); // ширина баннера + отступ
      sliderRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        {/* Слайдер с баннерами */}
        <div 
          className="flex overflow-x-auto pb-4 space-x-4 no-scrollbar" 
          ref={sliderRef}
          onWheel={handleWheel}
          style={{ overscrollBehavior: 'none' }}
        >
          {banners.map((banner) => (
            <Link 
              href={banner.url} 
              key={banner.id} 
              className="flex-shrink-0"
              onClick={() => handleBannerClick(banner.id)}
            >
              <div 
                className="w-[770px] h-[200px] bg-[#19191D] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full">
                  <Image 
                    src={banner.imageUrl} 
                    alt={`Баннер ${banners.indexOf(banner) + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority={activeIndex === banners.indexOf(banner)}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Индикаторы (точки) поверх слайдера */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-20">
          {banners.map((_, dotIndex) => (
            <button
              key={dotIndex}
              onClick={() => goToIndex(dotIndex)}
              className={`w-3 h-3 rounded-full transition-opacity cursor-pointer ${dotIndex === activeIndex ? 'bg-white' : 'bg-white opacity-30'}`}
              aria-label={`Перейти к баннеру ${dotIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}