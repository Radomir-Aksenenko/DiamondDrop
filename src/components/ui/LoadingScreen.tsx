'use client';

import { useState, useEffect } from 'react';

/**
 * Компонент красивой загрузки с анимацией в цветах сайта
 */
export default function LoadingScreen() {
  const [dots, setDots] = useState('');
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(() => 
    Math.floor(Math.random() * 50) // Случайное начальное сообщение
  );

  // 50 креативных подписей для загрузки
  const loadingMessages = [
    'Вычисляем ваш IP-адрес...',
    'Покупаем новый процессор...',
    'Ставим сервер в гараже...',
    'Договариваемся с хомячками...',
    'Подключаем квантовый интернет...',
    'Загружаем алмазы из космоса...',
    'Настраиваем связь с Марсом...',
    'Ищем потерянные пиксели...',
    'Кормим серверных котиков...',
    'Разогреваем видеокарту...',
    'Собираем данные по крупицам...',
    'Договариваемся с провайдером...',
    'Чиним интернет-трубы...',
    'Заряжаем батарейки в мышке...',
    'Ищем WiFi пароль у соседей...',
    'Перезагружаем матрицу...',
    'Будим спящие серверы...',
    'Настраиваем гиперпространство...',
    'Загружаем обновления для воздуха...',
    'Синхронизируемся с облаками...',
    'Калибруем рандомайзер...',
    'Проверяем связь с будущим...',
    'Оптимизируем пространство-время...',
    'Загружаем дополнительную удачу...',
    'Настраиваем алгоритм везения...',
    'Подключаемся к серверу удачи...',
    'Генерируем случайные числа...',
    'Смешиваем виртуальные карты...',
    'Настраиваем магию алгоритмов...',
    'Загружаем базу данных снов...',
    'Синхронизируем параллельные миры...',
    'Настраиваем телепортацию данных...',
    'Ищем потерянные биты...',
    'Договариваемся с файерволом...',
    'Настраиваем антигравитацию...',
    'Загружаем секретные алгоритмы...',
    'Подключаемся к сети единорогов...',
    'Калибруем датчики везения...',
    'Настраиваем турбо-режим...',
    'Загружаем дополнительные пиксели...',
    'Синхронизируем с космосом...',
    'Настраиваем квантовую запутанность...',
    'Ищем баги в коде вселенной...',
    'Подключаемся к серверу мечты...',
    'Загружаем обновления реальности...',
    'Настраиваем связь с драконами...',
    'Калибруем генератор чудес...',
    'Подключаемся к облаку счастья...',
    'Загружаем дополнительную магию...',
    'Финальная настройка алмазов...'
  ];

  useEffect(() => {
    // Анимация точек
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    // Смена креативных сообщений каждые 2 секунды (случайно)
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * loadingMessages.length);
        } while (newIndex === prev && loadingMessages.length > 1); // Избегаем повторения одного и того же сообщения подряд
        return newIndex;
      });
    }, 2000);

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
      clearInterval(messageInterval);
      clearTimeout(timeoutTimer);
    };
  }, [loadingMessages.length]);

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

        {/* Креативный текст загрузки */}
        <div className="space-y-2">
          <p className="text-xl text-[#F9F8FC]/70 transition-all duration-500 ease-in-out">
            {loadingMessages[currentMessageIndex]}
          </p>
          <p className="text-sm text-[#F9F8FC]/50">
            Загрузка приложения{dots}
          </p>
        </div>
      </div>
    </div>
  );
}