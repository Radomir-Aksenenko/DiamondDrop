'use client';

import { useState, useEffect } from 'react';

/**
 * Хук для определения мобильных устройств
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIsMobile = () => {
      // Проверяем ширину экрана
      const screenWidth = window.innerWidth <= 768;
      
      // Проверяем User Agent на мобильные устройства
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'android', 'webos', 'iphone', 'ipad', 'ipod', 
        'blackberry', 'windows phone', 'mobile', 'tablet'
      ];
      const userAgentMobile = mobileKeywords.some(keyword => 
        userAgent.includes(keyword)
      );
      
      // Проверяем поддержку touch событий
      const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Устройство считается мобильным если выполняется хотя бы одно из условий:
      // 1. Ширина экрана <= 768px
      // 2. User Agent содержит мобильные ключевые слова
      // 3. Поддерживаются touch события И ширина <= 1024px
      const mobile = screenWidth || userAgentMobile || (touchSupport && window.innerWidth <= 1024);
      
      setIsMobile(mobile);
      setIsLoading(false);
    };

    // Проверяем сразу после монтирования
    checkIsMobile();

    // Добавляем слушатель изменения размера окна
    const handleResize = () => {
      checkIsMobile();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { isMobile, isLoading };
}