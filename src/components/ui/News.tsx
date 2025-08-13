'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
// Убран импорт Image из next/image - заменен на обычные img теги
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';
import { useLinkHandler, isExternalLink } from '@/lib/linkUtils';

export default function News() {
  const { banners } = usePreloadedData();
  const { handleLinkClick } = useLinkHandler();
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Обработчик клика по баннеру
  const handleBannerClick = (bannerId: string, url: string, event: React.MouseEvent) => {
    // Обрабатываем ссылку через SPM если это внешняя ссылка
    handleLinkClick(url, event);
  };
  
  // Функция для переключения на следующий баннер
  const goToNext = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
  }, [banners.length]);
  
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
  }, [goToNext]);
  
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
          className="flex overflow-x-auto space-x-4 no-scrollbar" 
          ref={sliderRef}
          onWheel={handleWheel}
          style={{ overscrollBehavior: 'none' }}
        >
          {banners.map((banner) => {
            // Для внутренних ссылок используем Link, для внешних - обычную ссылку с обработчиком
            const isExternal = isExternalLink(banner.url);
            
            if (isExternal) {
              return (
                <a
                  href="#"
                  key={banner.id}
                  className="flex-shrink-0"
                  onClick={(e) => handleBannerClick(banner.id, banner.url, e)}
                  style={{ cursor: 'pointer' }}
                >
                  <div 
                    className="w-[770px] h-[200px] bg-[#19191D] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity relative overflow-hidden"
                  >
                    <div className="absolute inset-0 w-full h-full">
                      <img 
                        src={banner.imageUrl} 
                        alt={`Баннер ${banners.indexOf(banner) + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </a>
              );
            } else {
              return (
                <Link 
                  href={banner.url} 
                  key={banner.id} 
                  className="flex-shrink-0"
                  onClick={(e) => handleBannerClick(banner.id, banner.url, e)}
                >
                  <div 
                    className="w-[770px] h-[200px] bg-[#19191D] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity relative overflow-hidden"
                  >
                    <div className="absolute inset-0 w-full h-full">
                    <img 
                      src={banner.imageUrl} 
                      alt={`Баннер ${banners.indexOf(banner) + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  </div>
                </Link>
              );
            }
          })}
        </div>
        
        {/* Индикаторы (точки) поверх слайдера */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5 z-20">
          {banners.map((_, dotIndex) => (
            <button
              key={dotIndex}
              onClick={() => goToIndex(dotIndex)}
              className={`w-2 h-2 rounded-full transition-opacity cursor-pointer ${dotIndex === activeIndex ? 'bg-white' : 'bg-white opacity-30'}`}
              aria-label={`Перейти к баннеру ${dotIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}