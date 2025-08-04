'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import useCaseAPI from '@/hooks/useCaseAPI';
import CaseItemCard from '@/components/ui/CaseItemCard';
import CaseSlotItemCard from '@/components/ui/CaseSlotItemCard';
import { API_BASE_URL } from '@/lib/config';
import { CaseItem } from '@/hooks/useCasesAPI';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';

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
  const { refreshUser } = usePreloadedData();
  
  const [isFastMode, setIsFastMode] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(1);
  
  // Состояние для сохранения расположения предметов
  const [savedLayouts, setSavedLayouts] = useState<{[key: string]: CaseItem[]}>({});
  
  // Состояния для анимации рулетки
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Motion controls для каждого поля рулетки
  const field1Controls = useAnimation();
  const field2Controls = useAnimation();
  const field3Controls = useAnimation();
  const field4Controls = useAnimation();

  // Функция для сброса позиций анимации
  const resetAnimationPositions = () => {
    field1Controls.set(selectedNumber === 1 ? { x: 0 } : { y: 0 });
    field2Controls.set({ y: 0 });
    field3Controls.set({ y: 0 });
    field4Controls.set({ y: 0 });
  };

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
  const generateRandomItems = (fieldKey: string) => {
    if (!caseData?.items || caseData.items.length === 0) return [];
    
    // Создаем уникальный ключ для сохранения расположения
    const layoutKey = `${selectedNumber}-${fieldKey}`;
    
    // Если расположение уже сохранено, возвращаем его
    if (savedLayouts[layoutKey]) {
      return savedLayouts[layoutKey];
    }
    
    // Создаем достаточно предметов для отображения
    const baseItemCount = selectedNumber === 1 ? 50 : 40; // Меньше предметов для начального отображения
    const items: CaseItem[] = [];
    
    // Генерируем случайные предметы
    for (let i = 0; i < baseItemCount; i++) {
      const randomItem = getRandomItem();
      if (randomItem) {
        items.push({ ...randomItem, id: `${randomItem.id}-${fieldKey}-${i}` });
      }
    }
    
    // Создаем циклический массив для плавного отображения
    const cycleLength = Math.min(20, baseItemCount);
    const displayItems: CaseItem[] = [];
    
    // Добавляем несколько циклов для начального отображения
    for (let cycle = 0; cycle < 3; cycle++) {
      for (let j = 0; j < cycleLength; j++) {
        const sourceIndex = j % items.length;
        const cyclicItem = { ...items[sourceIndex], id: `${items[sourceIndex].id}-display-${cycle}-${j}` };
        displayItems.push(cyclicItem);
      }
    }
    
    // Добавляем основные предметы
    displayItems.push(...items);
    
    // Сохраняем расположение
    setSavedLayouts(prev => ({
      ...prev,
      [layoutKey]: displayItems
    }));
    
    return displayItems;
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
      
      // Сбрасываем предыдущие анимации
      field1Controls.stop();
      field2Controls.stop();
      field3Controls.stop();
      field4Controls.stop();
      
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
      
      // Обновляем баланс сразу после получения результатов (только для не демо режима)
      if (!isDemo) {
        console.log('🔄 Обновляем баланс пользователя сразу после открытия кейса');
        refreshUser();
      }
      
      // Запускаем анимацию рулетки
      startSpinAnimation(results);
      
    } catch (error) {
      console.error('Ошибка при открытии кейса:', error);
      setIsSpinning(false);
    }
  };

  // Функция для запуска анимации рулетки (адаптированная из оригинальной рулетки)
  const startSpinAnimation = async (results: CaseOpenResult[]) => {
    console.log('Запуск анимации для результатов:', results);
    // Увеличиваем продолжительность для создания интриги и драматического эффекта
    const baseDuration = isFastMode ? 3.5 : 8.5; // Увеличенная продолжительность для интриги
    const horizontalDuration = baseDuration; // Одинаковая продолжительность
    const verticalDuration = baseDuration;
    
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
    
    // Получаем массив controls для активных полей
    const controls = [field1Controls, field2Controls, field3Controls, field4Controls];
    
    // Для каждого поля создаем анимацию
    const animationPromises = [];
    
    for (let i = 0; i < selectedNumber; i++) {
      const fieldKey = `field${i + 1}`;
      const targetItem = results[i];
      const fieldControl = controls[i];
      
      if (targetItem && fieldControl) {
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
        
        // Создаем массив предметов для анимации (адаптированный алгоритм оригинальной рулетки)
        const infiniteItems: CaseItem[] = [];
        
        // Для горизонтальной рулетки нужно значительно больше карточек
        const baseItemCount = selectedNumber === 1 ? 150 : 60; // Увеличиваем для горизонтальной прокрутки
        
        // Добавляем циклы случайных предметов (как в оригинале - 2-4 цикла)
        const cycles = selectedNumber === 1 ? Math.floor(Math.random() * 3) + 4 : Math.floor(Math.random() * 3) + 2; // 4-6 циклов для горизонтальной, 2-4 для вертикальной
        for (let cycle = 0; cycle < cycles; cycle++) {
          for (let j = 0; j < baseItemCount; j++) {
            const randomItem = getRandomItem();
            if (randomItem) {
              infiniteItems.push({ ...randomItem, id: `${randomItem.id}-${fieldKey}-cycle-${cycle}-${j}` });
            }
          }
        }
        
        // Добавляем дополнительные случайные предметы перед выигрышным
        const additionalItemsBeforeWin = selectedNumber === 1 ? 
          Math.floor(Math.random() * 30) + 20 : // 20-49 предметов для горизонтальной
          Math.floor(Math.random() * 15) + 10;  // 10-24 предмета для вертикальной
        for (let j = 0; j < additionalItemsBeforeWin; j++) {
          const randomItem = getRandomItem();
          if (randomItem) {
            infiniteItems.push({ ...randomItem, id: `${randomItem.id}-${fieldKey}-before-${j}` });
          }
        }
        
        // Добавляем выигрышный предмет и запоминаем его позицию
        const targetIndex = infiniteItems.length; // Позиция выигрышного предмета
        infiniteItems.push({ ...targetCaseItem, id: `${targetCaseItem.id}-${fieldKey}-target` });
        
        // Добавляем дополнительные карточки после выигрышной (больше для горизонтальной прокрутки)
        const additionalCardsAfterWin = selectedNumber === 1 ? 30 : 10; // Больше карточек после выигрышной для горизонтальной
        for (let j = 0; j < additionalCardsAfterWin; j++) {
          const randomItem = getRandomItem();
          if (randomItem) {
            infiniteItems.push({ ...randomItem, id: `${randomItem.id}-${fieldKey}-after-${j}` });
          }
        }
        
        // Обновляем сохраненные расположения
        setSavedLayouts(prev => ({
          ...prev,
          [`${selectedNumber}-${fieldKey}`]: infiniteItems
        }));
        
        // Вычисляем размеры карточек
        const cardWidth = 76;
        const cardHeight = 100;
        const gap = 8;
        
        let animationPromise;
        
        if (selectedNumber === 1) {
          // Горизонтальная прокрутка для одного кейса (адаптированный алгоритм оригинальной рулетки)
          const itemWidth = cardWidth + gap;
          const containerWidth = 663; // Ширина контейнера
          
          // Начальная позиция - начинаем справа, чтобы всегда двигаться влево
          const initialOffset = containerWidth;
          
          // Генерируем случайное смещение в пределах карточки (-30px до +30px от центра)
          const randomOffset = (Math.random() - 0.5) * 60; // Случайное смещение от -30 до +30 пикселей
          
          // Финальная позиция - центрируем выигрышный предмет + случайное смещение
          const finalOffset = -(targetIndex * itemWidth) + (containerWidth / 2) - (cardWidth / 2) + randomOffset;
          
          // Промежуточная позиция - всегда между начальной и финальной (движение только вперед)
          const intermediateOffset = initialOffset + (finalOffset - initialOffset) * 0.85;
          
          console.log(`🎯 Горизонтальная анимация: случайное смещение ${randomOffset.toFixed(1)}px, движение ${initialOffset} → ${intermediateOffset.toFixed(1)} → ${finalOffset.toFixed(1)}`);
          
          // Устанавливаем начальную позицию
          fieldControl.set({ x: initialOffset });
          
          // Первый этап - быстрая прокрутка до промежуточной позиции
          animationPromise = fieldControl.start({
            x: intermediateOffset,
            transition: {
              duration: horizontalDuration * 0.7, // 70% времени на быструю прокрутку
              ease: [0.25, 0.46, 0.45, 0.94], // Быстрое ускорение
            }
          }).then(() => {
            // Второй этап - медленное движение к финальной позиции с сильным замедлением
            return fieldControl.start({
              x: finalOffset,
              transition: {
                duration: horizontalDuration * 0.3, // 30% времени на медленное завершение
                ease: [0.19, 1, 0.22, 1], // Очень сильное замедление в конце для интриги
              }
            });
          });
          
        } else {
          // Вертикальная прокрутка для нескольких кейсов
          const itemHeight = cardHeight + gap;
          const containerHeight = 272; // Высота контейнера
          
          // Начальная позиция - начинаем сверху, чтобы всегда двигаться вниз
          const initialOffset = containerHeight;
          
          // Генерируем случайное смещение в пределах карточки (-40px до +40px от центра)
          const randomOffset = (Math.random() - 0.5) * 80; // Случайное смещение от -40 до +40 пикселей
          
          // Финальная позиция - центрируем выигрышный предмет + случайное смещение
          const finalOffset = -(targetIndex * itemHeight) + (containerHeight / 2) - (cardHeight / 2) + randomOffset;
          
          // Промежуточная позиция - всегда между начальной и финальной (движение только вперед)
          const intermediateOffsetVertical = initialOffset + (finalOffset - initialOffset) * 0.85;
          
          console.log(`🎯 Вертикальная анимация поля ${i + 1}: случайное смещение ${randomOffset.toFixed(1)}px, движение ${initialOffset} → ${intermediateOffsetVertical.toFixed(1)} → ${finalOffset.toFixed(1)}`);
          
          // Устанавливаем начальную позицию
          fieldControl.set({ y: initialOffset });
          
          // Первый этап - быстрая прокрутка до промежуточной позиции
          animationPromise = fieldControl.start({
            y: intermediateOffsetVertical,
            transition: {
              duration: verticalDuration * 0.7, // 70% времени на быструю прокрутку
              ease: [0.25, 0.46, 0.45, 0.94], // Быстрое ускорение
            }
          }).then(() => {
            // Второй этап - медленное движение к финальной позиции с сильным замедлением
            return fieldControl.start({
              y: finalOffset,
              transition: {
                duration: verticalDuration * 0.3, // 30% времени на медленное завершение
                ease: [0.19, 1, 0.22, 1], // Очень сильное замедление в конце для интриги
              }
            });
          });
        }
        
        animationPromises.push(animationPromise);
      }
    }
    
    // Ждем завершения всех анимаций
    try {
      await Promise.all(animationPromises);
      console.log('Анимация завершена');
      setIsSpinning(false);
    } catch (error) {
      console.error('Ошибка анимации:', error);
      setIsSpinning(false);
    }
  };

  // Компонент для кнопок с цифрами
  const NumberButton = ({ number }: { number: number }) => (
    <motion.button 
      onClick={() => {
        if (selectedNumber !== number) {
          setSelectedNumber(number);
          // Сбрасываем позиции анимации при смене количества кейсов
          setTimeout(() => resetAnimationPositions(), 50);
        }
      }}
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
                <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden flex justify-center items-center">
                  {/* Контейнер для рулетки с анимацией */}
                  <motion.div 
                    className="flex items-center gap-2 p-2"
                    animate={field1Controls}
                    style={{
                      width: 'max-content',
                      minWidth: '100%'
                    }}
                  >
                    {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems('field1')).map((item, index) => (
                      <CaseSlotItemCard 
                        key={`field1-${item.id}-${index}`} 
                        item={item} 
                        className="flex-shrink-0"
                      />
                    ))}
                  </motion.div>
                  
                  {/* Белая палочка по центру */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-white/90 via-white to-white/90 z-10 pointer-events-none shadow-lg shadow-white/20">
                  </div>
                </div>
              )}
              
              {selectedNumber === 2 && (
                // Два поля горизонтально, предметы вертикально
                <>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                  <motion.div 
                    className="flex flex-col items-center gap-2 p-2"
                    animate={field1Controls}
                  >
                      {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems('field1')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field1-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-gradient-to-r from-white/90 via-white to-white/90 z-10 pointer-events-none shadow-lg shadow-white/20">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <motion.div 
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field2Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field2`] || generateRandomItems('field2')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field2-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-gradient-to-r from-white/90 via-white to-white/90 z-10 pointer-events-none shadow-lg shadow-white/20">
                    </div>
                  </div>
                </>
              )}
              
              {selectedNumber === 3 && (
                // Три поля горизонтально, предметы вертикально
                <>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <motion.div 
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field1Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems('field1')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field1-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-gradient-to-r from-white/90 via-white to-white/90 z-10 pointer-events-none shadow-lg shadow-white/20">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <motion.div 
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field2Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field2`] || generateRandomItems('field2')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field2-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-gradient-to-r from-white/90 via-white to-white/90 z-10 pointer-events-none shadow-lg shadow-white/20">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <motion.div 
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field3Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field3`] || generateRandomItems('field3')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field3-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-gradient-to-r from-white/90 via-white to-white/90 z-10 pointer-events-none shadow-lg shadow-white/20">
                    </div>
                  </div>
                </>
              )}
              
              {selectedNumber === 4 && (
                // Четыре поля горизонтально, предметы вертикально
                <>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <motion.div 
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field1Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems('field1')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field1-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-gradient-to-r from-white/90 via-white to-white/90 z-10 pointer-events-none shadow-lg shadow-white/20">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <motion.div 
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field2Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field2`] || generateRandomItems('field2')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field2-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-gradient-to-r from-white/90 via-white to-white/90 z-10 pointer-events-none shadow-lg shadow-white/20">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <motion.div 
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field3Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field3`] || generateRandomItems('field3')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field3-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-gradient-to-r from-white/90 via-white to-white/90 z-10 pointer-events-none shadow-lg shadow-white/20">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    {/* Контейнер для рулетки с анимацией */}
                    <motion.div 
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field4Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field4`] || generateRandomItems('field4')).map((item, index) => (
                        <CaseSlotItemCard 
                          key={`field4-${item.id}-${index}`} 
                          item={item} 
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-gradient-to-r from-white/90 via-white to-white/90 z-10 pointer-events-none shadow-lg shadow-white/20">
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
          
          {/* Контейнер с предметами */}
          <div className='flex-1 px-4 pb-4 min-h-0'>
            {/* Область прокрутки с motion.div */}
            <motion.div 
              className='h-full overflow-y-auto overflow-x-hidden pr-2'
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(249, 248, 252, 0.2) transparent'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 4px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background: rgba(249, 248, 252, 0.2);
                  border-radius: 2px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: rgba(249, 248, 252, 0.3);
                }
              `}</style>
              
              {/* Сетка предметов */}
              <div className='grid grid-cols-2 gap-2 w-full auto-rows-max'>
                {getSortedItems().length > 0 ? (
                  getSortedItems().map((item, index) => (
                    <motion.div 
                      key={`${item.id}-${index}`} 
                      className='w-full flex justify-center items-start'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                    >
                      <CaseItemCard 
                        item={item}
                        className='flex-shrink-0'
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    className="text-[#F9F8FC]/50 font-unbounded text-sm text-center w-full col-span-2 py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Предметы не найдены
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}