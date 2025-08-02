'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import useCaseAPI from '@/hooks/useCaseAPI';
import CaseItemCard from '@/components/ui/CaseItemCard';
import CaseSlotItemCard from '@/components/ui/CaseSlotItemCard';
import { API_BASE_URL } from '@/lib/config';
import { CaseItem } from '@/hooks/useCasesAPI';

// Константа для токена авторизации
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI2ODhjYWQ2YWJlNjU0MWU5ZTgzMWFiZTciLCJwZXJtaXNzaW9uIjoiVXNlciIsIm5iZiI6MTc1NDA0OTg5OCwiZXhwIjoxNzU0MDUzNDk4LCJpYXQiOjE3NTQwNDk4OTgsImlzcyI6Im1yLnJhZmFlbGxvIn0.wlwEt3aTPnizjaW0z0iG5cFImxh_MHsDV10D97UrPSU'

// Интерфейс для результата открытия кейса
interface CaseOpenResult {
  id: string
  name: string
  description: string
  imageUrl: string
  amount: number
  price: number
  percentChance: number
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
}

/**
 * Страница отдельного кейса
 */
export default function CasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  
  const { caseData, loading, error } = useCaseAPI(caseId);
  
  const [isFastMode, setIsFastMode] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(1);
  
  // Состояние для сохранения расположения предметов
  const [savedLayouts, setSavedLayouts] = useState<{[key: string]: CaseItem[]}>({});
  
  // Состояния для анимации рулетки
  const [isSpinning, setIsSpinning] = useState(false);
  const [animationOffsets, setAnimationOffsets] = useState<{[key: string]: number}>({});
  
  // Состояния для кастомного скроллбара
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);

  // Функция для сортировки предметов по цене (всегда от дорогих к дешевым)
  const getSortedItems = () => {
    if (!caseData?.items) return [];
    
    return [...caseData.items].sort((a, b) => b.price - a.price); // От дорогих к дешевым
  };

  // Функция для получения правильного URL картинки кейса
  const getCaseImageUrl = () => {
    if (!caseData?.imageUrl) {
      return "/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png"; // Дефолтная картинка
    }
    
    // Если URL уже полный (начинается с http/https), используем как есть
    if (caseData.imageUrl.startsWith('http://') || caseData.imageUrl.startsWith('https://')) {
      return caseData.imageUrl;
    }
    
    // Если URL относительный, добавляем базовый URL API
    if (caseData.imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${caseData.imageUrl}`;
    }
    
    // Если URL без слеша в начале, добавляем слеш и базовый URL
    return `${API_BASE_URL}/${caseData.imageUrl}`;
  };

  // Функция для получения случайного предмета из кейса
  const getRandomItem = () => {
    if (!caseData?.items || caseData.items.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * caseData.items.length);
    return caseData.items[randomIndex];
  };

  // Функция для генерации массива случайных предметов для слота с сохранением состояния
  const generateRandomItems = (count: number = 8, fieldKey: string) => {
    if (!caseData?.items || caseData.items.length === 0) return [];
    
    // Создаем уникальный ключ для сохранения расположения
    const layoutKey = `${selectedNumber}-${fieldKey}`;
    
    // Если расположение уже сохранено, возвращаем его
    if (savedLayouts[layoutKey]) {
      return savedLayouts[layoutKey];
    }
    
    // Генерируем новое расположение
    const items: CaseItem[] = [];
    for (let i = 0; i < count; i++) {
      const randomItem = getRandomItem();
      if (randomItem) {
        items.push({ ...randomItem, id: `${randomItem.id}-${fieldKey}-${i}` });
      }
    }
    
    // Сохраняем расположение
    setSavedLayouts(prev => ({
      ...prev,
      [layoutKey]: items
    }));
    
    return items;
  };

  // Функция для открытия кейсов через API
  const openCase = async (isDemo: boolean = false) => {
    // Дополнительная защита от повторного вызова
    if (isSpinning || !caseData) {
      console.log('Открытие заблокировано: isSpinning =', isSpinning, 'caseData =', !!caseData);
      return;
    }
    
    try {
      console.log('Начинаем открытие кейса...');
      setIsSpinning(true);
      
      // Сбрасываем предыдущие смещения перед новой анимацией
      setAnimationOffsets({});
      
      // Используем константу токена авторизации
      const token = AUTH_TOKEN;
      
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/opens?amount=${selectedNumber}&demo=${isDemo}`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: ''
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const results: CaseOpenResult[] = await response.json();
      console.log('Получены результаты:', results);
      
      // Запускаем анимацию рулетки
      startSpinAnimation(results);
      
    } catch (error) {
      console.error('Ошибка при открытии кейса:', error);
      setIsSpinning(false);
    }
  };

  // Функция для запуска анимации рулетки
  const startSpinAnimation = (results: CaseOpenResult[]) => {
    console.log('Запуск анимации для результатов:', results);
    const duration = isFastMode ? 3000 : 5000; // 3 или 5 секунд
    
    // Очищаем старые расположения для текущей конфигурации
    setSavedLayouts(prev => {
      const newLayouts = { ...prev };
      for (let i = 0; i < selectedNumber; i++) {
        const fieldKey = `field${i + 1}`;
        const layoutKey = `${selectedNumber}-${fieldKey}`;
        delete newLayouts[layoutKey];
      }
      return newLayouts;
    });
    
    // Сбрасываем предыдущие смещения
    const initialOffsets: { [key: string]: number } = {};
    
    // Для каждого поля создаем анимацию
    for (let i = 0; i < selectedNumber; i++) {
      const fieldKey = `field${i + 1}`;
      const targetItem = results[i];
      
      if (targetItem) {
        // Генерируем больше предметов для эффекта рулетки (бесконечная прокрутка)
        const itemCount = selectedNumber === 1 ? 120 : 80; // Увеличиваем количество для бесконечности
        const currentItems: CaseItem[] = [];
        
        // Генерируем случайные предметы
        for (let j = 0; j < itemCount; j++) {
          const randomItem = getRandomItem();
          if (randomItem) {
            currentItems.push({ ...randomItem, id: `${randomItem.id}-${fieldKey}-${j}` });
          }
        }
        
        // Преобразуем результат API в формат CaseItem для совместимости
        const targetCaseItem: CaseItem = {
          id: targetItem.id,
          name: targetItem.name,
          description: targetItem.description,
          imageUrl: targetItem.imageUrl,
          amount: targetItem.amount,
          price: targetItem.price,
          percentChance: targetItem.percentChance,
          rarity: targetItem.rarity
        };
        
        // Размещаем выигрышный предмет в позиции для остановки
        const targetIndex = Math.floor(itemCount * 0.8); // 80% от длины списка для лучшего эффекта
        currentItems[targetIndex] = { ...targetCaseItem, id: `${targetCaseItem.id}-${fieldKey}-${targetIndex}` };
        
        // Обновляем сохраненные расположения
        setSavedLayouts(prev => ({
          ...prev,
          [`${selectedNumber}-${fieldKey}`]: currentItems
        }));
        
        // Вычисляем размеры карточек
        const cardWidth = selectedNumber === 1 ? 120 : 100;
        const cardHeight = 100;
        const gap = 8;
        
        // Начальное смещение - начинаем с большого положительного значения для эффекта бесконечности
        let initialOffset;
        if (selectedNumber === 1) {
          // Горизонтальная прокрутка - начинаем справа
          initialOffset = cardWidth * 5; // Увеличиваем начальное смещение
        } else {
          // Вертикальная прокрутка - начинаем сверху
          initialOffset = cardHeight * 5; // Увеличиваем начальное смещение
        }
        
        initialOffsets[fieldKey] = initialOffset;
      }
    }
    
    // Устанавливаем начальные смещения сразу
    setAnimationOffsets(initialOffsets);
    
    // Запускаем анимацию с небольшой задержкой для плавности
    setTimeout(() => {
      const finalOffsets: { [key: string]: number } = {};
      
      for (let i = 0; i < selectedNumber; i++) {
        const fieldKey = `field${i + 1}`;
        const targetItem = results[i];
        
        if (targetItem) {
          const itemCount = selectedNumber === 1 ? 120 : 80;
          const targetIndex = Math.floor(itemCount * 0.8);
          
          // Вычисляем размеры карточек
          const cardWidth = selectedNumber === 1 ? 120 : 100;
          const cardHeight = 100;
          const gap = 8;
          
          // Вычисляем финальное смещение для остановки на выигрышном предмете
          let finalOffset;
          if (selectedNumber === 1) {
            // Горизонтальная прокрутка
            finalOffset = -(targetIndex * (cardWidth + gap)) + (cardWidth / 2);
          } else {
            // Вертикальная прокрутка
            finalOffset = -(targetIndex * (cardHeight + gap)) + (cardHeight / 2);
          }
          
          finalOffsets[fieldKey] = finalOffset;
        }
      }
      
      console.log('Устанавливаем финальные смещения:', finalOffsets);
      setAnimationOffsets(finalOffsets);
    }, 100); // Увеличиваем задержку для более плавного старта
    
    // Завершаем анимацию
    setTimeout(() => {
      console.log('Анимация завершена');
      setIsSpinning(false);
    }, duration + 500);
  };

  // Компонент для кнопок с цифрами
  const NumberButton = ({ number }: { number: number }) => (
    <motion.button 
      onClick={() => setSelectedNumber(number)}
      className={`flex cursor-pointer w-[36px] h-[36px] justify-center items-center rounded-[8px] font-unbounded text-sm font-medium transition-all duration-200 ${
        selectedNumber === number 
          ? 'border border-[#5C5ADC] bg-[#6563EE]/[0.10] text-[#F9F8FC]' 
          : 'bg-[#F9F8FC]/[0.05] text-[#F9F8FC] hover:bg-[#F9F8FC]/[0.08]'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {number}
    </motion.button>
  );

  // Функции для кастомного скроллбара
  const updateScrollInfo = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      setScrollTop(scrollTop);
      setScrollHeight(scrollHeight);
      setClientHeight(clientHeight);
      setIsScrollbarVisible(scrollHeight > clientHeight);
    }
  };

  const handleScroll = () => {
    updateScrollInfo();
  };

  const handleScrollbarClick = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const scrollRatio = clickY / rect.height;
    const newScrollTop = scrollRatio * (scrollHeight - clientHeight);
    
    scrollContainerRef.current.scrollTop = newScrollTop;
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;
      
      e.preventDefault();
      const scrollbarElement = document.querySelector('.custom-scrollbar-track') as HTMLElement;
      if (!scrollbarElement) return;
      
      const rect = scrollbarElement.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const scrollRatio = mouseY / rect.height;
      const newScrollTop = scrollRatio * (scrollHeight - clientHeight);
      
      scrollContainerRef.current.scrollTop = Math.max(0, Math.min(newScrollTop, scrollHeight - clientHeight));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scrollHeight, clientHeight]);

  useEffect(() => {
    updateScrollInfo();
    
    const resizeObserver = new ResizeObserver(updateScrollInfo);
    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [caseData?.items]);

  // Дополнительная инициализация скроллбара
  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollInfo();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);



  // Вычисляем параметры для ползунка скроллбара
  const thumbHeight = isScrollbarVisible && scrollHeight > 0 && clientHeight > 0 
    ? Math.max((clientHeight / scrollHeight) * clientHeight, 20) 
    : 0;
  const maxThumbTop = clientHeight - thumbHeight;
  const thumbTop = isScrollbarVisible && scrollHeight > clientHeight && clientHeight > 0
    ? Math.min(Math.max((scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight), 0), maxThumbTop) 
    : 0;



  // Обработка состояний загрузки и ошибки
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-[#F9F8FC] font-unbounded text-lg">Загрузка кейса...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-red-400 font-unbounded text-lg">Ошибка: {error}</div>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#5C5ADC] text-[#F9F8FC] rounded-lg font-unbounded"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-[#F9F8FC] font-unbounded text-lg">Кейс не найден</div>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#5C5ADC] text-[#F9F8FC] rounded-lg font-unbounded"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-85px-1rem)] flex flex-col items-start gap-4 flex-1 self-stretch overflow-hidden">
      {/* Кнопка назад */}
      <button 
        onClick={() => router.back()}
        className="flex w-full h-[42px] items-center gap-4 cursor-pointer"
      >
        <motion.div 
          className="flex w-[42px] h-[42px] flex-col justify-center items-center gap-[10px] flex-shrink-0 rounded-[8px] bg-[#F9F8FC]/[0.05]"
          whileHover={{ backgroundColor: "rgba(249, 248, 252, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Image 
            src="/Arrow - Left.svg" 
            alt="Назад" 
            width={18} 
            height={12} 
            className="w-[18px] h-[12px]"
          />
        </motion.div>
        <p className='text-[#F9F8FC] font-unbounded text-2xl font-medium'>Кейсы</p>
      </button>

      {/* Основной контент */}
      <div className='flex items-start gap-2 flex-[1_0_0] self-stretch'>
        <div className='flex flex-col items-start gap-2 flex-1'>
          {/* Блок с информацией о кейсе */}
          <div className="flex flex-col items-start gap-2 self-stretch p-4 rounded-xl bg-[#F9F8FC]/[0.05] w-[679px] h-[288px]">
            <div className='flex h-[256px] items-center gap-4 self-stretch'>
              {/* Изображение кейса */}
              <Image
                src={getCaseImageUrl()}
                alt={`Изображение кейса ${caseData.name}`}
                width={256}
                height={256}
                className="object-cover rounded-lg w-[256px] h-[256px] flex-shrink-0"
                priority
              />
              
              {/* Информация о кейсе */}
              <div className='flex py-2 flex-col justify-between items-start flex-1 self-stretch'>
                {/* Заголовок и описание */}
                <div className='flex flex-col items-start gap-2 self-stretch'>
                  <h1 className='text-[#F9F8FC] font-unbounded text-xl font-medium'>{caseData.name}</h1>
                  <p className="text-[#F9F8FC] font-['Actay_Wide'] text-sm font-bold opacity-30 leading-relaxed">
                    {caseData.description || 'Описание кейса отсутствует'}
                  </p>
                </div>
                
                {/* Кнопки выбора количества */}
                <div className='flex items-center gap-2'>
                  {[1, 2, 3, 4].map((number) => (
                    <NumberButton key={number} number={number} />
                  ))}
                </div>
                
                {/* Быстрый режим */}
                <div className='flex items-center gap-4 self-stretch'>
                  <div className='flex items-center gap-2'>
                    <Image
                      src="/Fast.svg"
                      alt="Иконка быстрого режима"
                      width={10}
                      height={14}
                      className="flex-shrink-0"
                      priority
                    />
                    <p className="text-[#F9F8FC] font-['Actay_Wide'] text-base font-bold">Быстрый режим</p>
                    <motion.button 
                      onClick={() => setIsFastMode(!isFastMode)}
                      className={`flex w-[27px] h-[15px] p-[2px] cursor-pointer ${
                        isFastMode ? 'justify-end bg-[#5C5ADC]' : 'justify-start bg-[#F9F8FC]/[0.10]'
                      } items-center rounded-[100px] transition-colors duration-200`}

                    >
                      <motion.div 
                        className='w-[11px] h-[11px] flex-shrink-0 rounded-[100px] bg-[#F9F8FC]'
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>
                </div>
                
                {/* Кнопки действий */}
                <div className='flex items-center gap-2'>
                  <motion.button 
                    onClick={() => openCase(false)}
                    disabled={isSpinning}
                    className={`flex px-4 py-3 justify-center items-center gap-2 rounded-xl transition-colors duration-200 ${
                      isSpinning 
                        ? 'bg-[#5C5ADC]/50 cursor-not-allowed' 
                        : 'bg-[#5C5ADC] cursor-pointer'
                    }`}
                    whileHover={!isSpinning ? { backgroundColor: "#6462DE" } : {}}
                    whileTap={!isSpinning ? { scale: 0.98 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <span className="text-[#F9F8FC] font-unbounded text-sm font-medium">
                      {isSpinning ? 'Открываем...' : `Открыть ${selectedNumber} ${selectedNumber === 1 ? 'кейс' : 'кейса'}`}
                    </span>
                    {!isSpinning && (
                      <>
                        <span className="text-[#F9F8FC] font-unbounded text-sm font-medium opacity-50">·</span>
                        <span className='text-[#F9F8FC] font-unbounded text-sm font-medium opacity-50'>
                          {selectedNumber * caseData.price}
                        </span>
                        <span className='text-[#F9F8FC] font-unbounded text-[10px] font-medium opacity-50'>АР</span>
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => openCase(true)}
                    disabled={isSpinning}
                    className={`flex px-4 py-3 justify-center items-center gap-[10px] rounded-[8px] bg-[#F9F8FC]/[0.05] text-[#F9F8FC] font-unbounded text-sm font-medium transition-colors duration-200 ${
                      isSpinning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                    whileHover={!isSpinning ? { backgroundColor: "#242428" } : {}}
                    whileTap={!isSpinning ? { scale: 0.98 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Демо
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Нижний блок - Поля для кейсов */}
          <div className="flex p-[10px] items-start rounded-xl bg-[#F9F8FC]/[0.05] w-[679px] h-[288px]">
            {/* Контейнер для полей кейсов */}
            <div className="flex w-full h-full gap-[8px]">
              {selectedNumber === 1 && (
                // Одно поле на всю ширину с предметами расположенными горизонтально
                <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                  {/* Контейнер для рулетки с анимацией */}
                  <div 
                    className="flex items-center gap-2 p-2 transition-transform duration-[5000ms] ease-out"
                    style={{
                      transform: `translateX(${animationOffsets['field1'] || 0}px)`,
                      transitionDuration: isSpinning ? (isFastMode ? '3000ms' : '5000ms') : '0ms'
                    }}
                  >
                    {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems(120, 'field1')).map((item, index) => (
                      <CaseSlotItemCard 
                        key={`field1-${item.id}-${index}`} 
                        item={item} 
                      />
                    ))}
                  </div>
                  
                  {/* Белая палочка по центру */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-white/80 z-10 pointer-events-none">
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                  </div>
                </div>
              )}
              
              {selectedNumber === 2 && (
                // Два поля горизонтально, предметы вертикально
                <>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <div 
                      className="flex flex-col items-center gap-2 p-2 transition-transform duration-[5000ms] ease-out"
                      style={{
                        transform: `translateY(${animationOffsets['field1'] || 0}px)`,
                        transitionDuration: isSpinning ? (isFastMode ? '3000ms' : '5000ms') : '0ms'
                      }}
                    >
                      {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems(80, 'field1')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field1-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-white/80 z-10 pointer-events-none">
                      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <div 
                      className="flex flex-col items-center gap-2 p-2 transition-transform duration-[5000ms] ease-out"
                      style={{
                        transform: `translateY(${animationOffsets['field2'] || 0}px)`,
                        transitionDuration: isSpinning ? (isFastMode ? '3000ms' : '5000ms') : '0ms'
                      }}
                    >
                      {(savedLayouts[`${selectedNumber}-field2`] || generateRandomItems(80, 'field2')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field2-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-white/80 z-10 pointer-events-none">
                      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                    </div>
                  </div>
                </>
              )}
              
              {selectedNumber === 3 && (
                // Три поля горизонтально, предметы вертикально
                <>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <div 
                      className="flex flex-col items-center gap-2 p-2 transition-transform duration-[5000ms] ease-out"
                      style={{
                        transform: `translateY(${animationOffsets['field1'] || 0}px)`,
                        transitionDuration: isSpinning ? (isFastMode ? '3000ms' : '5000ms') : '0ms'
                      }}
                    >
                      {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems(60, 'field1')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field1-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-white/80 z-10 pointer-events-none">
                      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <div 
                      className="flex flex-col items-center gap-2 p-2 transition-transform duration-[5000ms] ease-out"
                      style={{
                        transform: `translateY(${animationOffsets['field2'] || 0}px)`,
                        transitionDuration: isSpinning ? (isFastMode ? '3000ms' : '5000ms') : '0ms'
                      }}
                    >
                      {(savedLayouts[`${selectedNumber}-field2`] || generateRandomItems(60, 'field2')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field2-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-white/80 z-10 pointer-events-none">
                      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <div 
                      className="flex flex-col items-center gap-2 p-2 transition-transform duration-[5000ms] ease-out"
                      style={{
                        transform: `translateY(${animationOffsets['field3'] || 0}px)`,
                        transitionDuration: isSpinning ? (isFastMode ? '3000ms' : '5000ms') : '0ms'
                      }}
                    >
                      {(savedLayouts[`${selectedNumber}-field3`] || generateRandomItems(80, 'field3')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field3-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-white/80 z-10 pointer-events-none">
                      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                    </div>
                  </div>
                </>
              )}
              
              {selectedNumber === 4 && (
                // Четыре поля горизонтально, предметы вертикально
                <>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <div 
                      className="flex flex-col items-center gap-2 p-2 transition-transform duration-[5000ms] ease-out"
                      style={{
                        transform: `translateY(${animationOffsets['field1'] || 0}px)`,
                        transitionDuration: isSpinning ? (isFastMode ? '3000ms' : '5000ms') : '0ms'
                      }}
                    >
                      {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems(60, 'field1')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field1-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-white/80 z-10 pointer-events-none">
                      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <div 
                      className="flex flex-col items-center gap-2 p-2 transition-transform duration-[5000ms] ease-out"
                      style={{
                        transform: `translateY(${animationOffsets['field2'] || 0}px)`,
                        transitionDuration: isSpinning ? (isFastMode ? '3000ms' : '5000ms') : '0ms'
                      }}
                    >
                      {(savedLayouts[`${selectedNumber}-field2`] || generateRandomItems(60, 'field2')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field2-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-white/80 z-10 pointer-events-none">
                      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <div 
                      className="flex flex-col items-center gap-2 p-2 transition-transform duration-[5000ms] ease-out"
                      style={{
                        transform: `translateY(${animationOffsets['field3'] || 0}px)`,
                        transitionDuration: isSpinning ? (isFastMode ? '3000ms' : '5000ms') : '0ms'
                      }}
                    >
                      {(savedLayouts[`${selectedNumber}-field3`] || generateRandomItems(60, 'field3')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field3-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-white/80 z-10 pointer-events-none">
                      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <div 
                      className="flex flex-col items-center gap-2 p-2 transition-transform duration-[5000ms] ease-out"
                      style={{
                        transform: `translateY(${animationOffsets['field4'] || 0}px)`,
                        transitionDuration: isSpinning ? (isFastMode ? '3000ms' : '5000ms') : '0ms'
                      }}
                    >
                      {(savedLayouts[`${selectedNumber}-field4`] || generateRandomItems(80, 'field4')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field4-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-white/80 z-10 pointer-events-none">
                      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 bg-white/80 rotate-45"></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Правый сайдбар */}
        <div className='flex w-[221px] flex-col rounded-xl bg-[#F9F8FC]/[0.05] overflow-hidden' style={{ height: '585px' }}>
          {/* Заголовок */}
          <div className='flex p-4 pb-2 justify-center items-center flex-shrink-0'>
            <h1 className='text-[#F9F8FC] font-unbounded text-xl font-medium'>В кейсе</h1>
          </div>
          
          {/* Контейнер с предметами и скроллбаром */}
          <div className='flex-1 relative px-4 pb-4 min-h-0'>
            {/* Область прокрутки */}
            <div 
              ref={scrollContainerRef}
              className='h-full overflow-y-auto overflow-x-hidden'
              onScroll={handleScroll}
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                paddingRight: '8px'
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {/* Сетка предметов */}
              <div className='grid grid-cols-2 gap-2 w-full auto-rows-max'>
                {getSortedItems().length > 0 ? (
                  getSortedItems().map((item, index) => (
                    <div key={`${item.id}-${index}`} className='w-full flex justify-center items-start'>
                      <CaseItemCard 
                        item={item}
                        className='flex-shrink-0'
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-[#F9F8FC]/50 font-unbounded text-sm text-center w-full col-span-2 py-8">
                    Предметы не найдены
                  </div>
                )}
              </div>
            </div>
            
            {/* Кастомный скроллбар */}
            {isScrollbarVisible && (
              <div 
                className='absolute top-0 right-0 w-1 h-full cursor-pointer custom-scrollbar-track'
                onClick={handleScrollbarClick}
              >
                <div
                  className='absolute w-1 bg-[#F9F8FC] rounded-full transition-opacity duration-200 hover:opacity-30'
                  style={{
                    height: `${thumbHeight}px`,
                    top: `${thumbTop}px`,
                    opacity: 0.15
                  }}
                  onMouseDown={handleThumbMouseDown}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}