'use client';

import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  loadingStage?: string;
}

/**
 * Компонент красивой загрузки с анимацией в цветах сайта
 */
export default function LoadingScreen({ loadingStage = 'Загрузка приложения' }: LoadingScreenProps) {
  const [dots, setDots] = useState('');
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Анимация точек
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    // Таймаут на 15 секунд (увеличен для предзагрузки)
    const timeoutTimer = setTimeout(() => {
      setIsTransitioning(true);
      // Небольшая задержка для плавного перехода
      setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 300);
    }, 15000);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(timeoutTimer);
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  if (showTimeoutMessage) {
    return (
      <div className="fixed inset-0 bg-[#0D0D11] flex items-center justify-center z-50 animate-fade-in">
        {/* Фоновая анимация в цветах сайта */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5C5ADC] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#5C5ADC] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-[#5C5ADC] rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Сообщение об ошибке */}
        <div className="relative z-10 text-center max-w-md mx-auto px-6 animate-slide-up">
          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-[#F9F8FC] mb-4 font-unbounded">
            Хмм... Что-то пошло не так
          </h1>

          {/* Описание */}
          <p className="text-[#F9F8FC]/70 mb-6 leading-relaxed">
            Упс! Кажется, что-то пошло не так.
            Сервер решил вздремнуть или просто задумался.
            Проверьте интернет и попробуйте снова.
          </p>

          {/* Кнопка перезагрузки */}
          <button 
            onClick={handleReload}
            className="bg-[#5C5ADC] cursor-pointer hover:bg-[#4A48B0] text-[#F9F8FC] font-bold py-3 px-6 rounded-lg transition-all duration-200 font-unbounded hover:scale-105 hover:shadow-lg hover:shadow-[#5C5ADC]/30"
          >
            Попробовать ещё раз
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-[#0D0D11] flex items-center justify-center z-50 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {/* Фоновая анимация в цветах сайта */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5C5ADC] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#5C5ADC] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-[#5C5ADC] rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Основной контент */}
      <div className={`relative z-10 text-center transition-all duration-300 ${isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Логотип/иконка */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto relative">
            {/* Анимированный алмаз в цветах сайта */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#5C5ADC] to-[#4A48B0] transform rotate-45 rounded-lg animate-spin-slow shadow-2xl shadow-[#5C5ADC]/50"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-[#F9F8FC] to-[#5C5ADC]/30 transform rotate-45 rounded-lg opacity-80"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-[#F9F8FC]/90 to-[#5C5ADC]/20 transform rotate-45 rounded-lg"></div>
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-4xl font-bold text-[#F9F8FC] mb-4 font-unbounded">
          DiamondDrop
        </h1>

        {/* Текст загрузки с этапом */}
        <p className="text-xl text-[#F9F8FC]/70 mb-2">
          {loadingStage}{dots}
        </p>
        
        {/* Дополнительная информация */}
        <p className="text-sm text-[#F9F8FC]/50">
          Подготавливаем всё самое лучшее для вас
        </p>
      </div>
    </div>
  );
}