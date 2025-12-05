'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
// Убран импорт Image из next/image - заменен на обычные img теги
import { motion, useAnimation } from 'framer-motion';
import useCaseAPI from '@/hooks/useCaseAPI';
import CaseItemCard from '@/components/ui/CaseItemCard';
import CaseSlotItemCard from '@/components/ui/CaseSlotItemCard';
import ItemDescriptionModal from '@/components/ui/ItemDescriptionModal';
import { API_BASE_URL } from '@/lib/config';
import { CaseItem } from '@/hooks/useCasesAPI';
import { useBalanceUpdater } from '@/hooks/useBalanceUpdater';
import { getAuthToken } from '@/lib/auth';
import { useWalletModal } from '@/contexts/WalletModalContext';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';

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
  isWithdrawable: boolean
}

/**
 * Страница отдельного кейса
 */
export default function CasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  
  const { caseData, loading, error } = useCaseAPI(caseId);
  const { decreaseBalance } = useBalanceUpdater();
  const { openWalletModal } = useWalletModal();
  const { user } = usePreloadedData();
  
  const [isFastMode, setIsFastMode] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(1);

  // Определяем, нужен ли компактный режим для карточек
  const [isCompactCards, setIsCompactCards] = useState(false);

  // Состояние для сохранения расположения предметов
  const [savedLayouts, setSavedLayouts] = useState<{[key: string]: CaseItem[]}>({});
  
  // Состояния для анимации рулетки
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Состояние для модального окна описания предмета
  const [isItemDescriptionModalOpen, setIsItemDescriptionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CaseItem | null>(null);
  
  // Функции для управления модальным окном описания предмета
  const handleOpenItemDescriptionModal = (item: CaseItem) => {
    setSelectedItem(item);
    setIsItemDescriptionModalOpen(true);
  };

  const handleCloseItemDescriptionModal = () => {
    setIsItemDescriptionModalOpen(false);
  };

  // useEffect для определения compact режима - всегда компактный на мобильных
  useEffect(() => {
    const checkCompactMode = () => {
      const isMobile = window.innerWidth < 768;
      setIsCompactCards(isMobile); // На мобильных всегда используем compact
    };

    checkCompactMode();
    window.addEventListener('resize', checkCompactMode);

    return () => window.removeEventListener('resize', checkCompactMode);
  }, [selectedNumber]);
  
  // Motion controls для каждого поля рулетки
  const field1Controls = useAnimation();
  const field2Controls = useAnimation();
  const field3Controls = useAnimation();
  const field4Controls = useAnimation();

  // Refs для контейнеров рулетки - для точного измерения размеров
  const rouletteContainerRef = useRef<HTMLDivElement>(null);

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

  // Функция для проверки баланса и открытия кейса
  const handleOpenCase = async (isDemo: boolean = false) => {
    // Для демо режима не проверяем баланс
    if (isDemo) {
      await openCase(true);
      return;
    }

    // Проверяем баланс пользователя
    if (!user || !caseData) {
      console.error('Данные пользователя или кейса не загружены');
      return;
    }

    const totalCost = caseData.price * selectedNumber;
    
    // Если баланса недостаточно, открываем модалку пополнения с предустановленной суммой
    if (user.balance < totalCost) {
      const neededAmount = totalCost - user.balance;
      // Округляем недостающую сумму вверх до целого числа
      const roundedNeededAmount = Math.ceil(neededAmount);
      openWalletModal(roundedNeededAmount);
      return;
    }

    // Если баланса достаточно, открываем кейс
    await openCase(false);
  };

  // Функция для открытия кейсов через API
  const openCase = async (isDemo: boolean = false) => {
    // Дополнительная защита от повторного вызова
    if (isSpinning || !caseData) {
      // Логирование удалено
      return;
    }
    
    try {
      // Логирование удалено
      setIsSpinning(true);
      
      // Сбрасываем предыдущие анимации
      field1Controls.stop();
      field2Controls.stop();
      field3Controls.stop();
      field4Controls.stop();
      
      // Получаем токен авторизации из системы аутентификации
      const token = getAuthToken();
      if (!token && !isDemo) {
        throw new Error('Токен авторизации не найден');
      }
      
      const headers: Record<string, string> = {
        'accept': '*/*',
        'Content-Type': 'application/json'
      };
      
      // Добавляем токен авторизации только если он есть (для не-демо режима)
      if (token) {
        headers['Authorization'] = token;
      }
      
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/opens?amount=${selectedNumber}&demo=${isDemo}`, {
        method: 'POST',
        headers,
        body: ''
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const results: CaseOpenResult[] = await response.json();
      // Логирование удалено
      
      // Локально уменьшаем баланс сразу после получения результатов (только для не демо режима)
      if (!isDemo && caseData) {
        const totalCost = caseData.price * selectedNumber;
        // Логирование удалено
        decreaseBalance(totalCost);
      }
      
      // Запускаем анимацию рулетки
      startSpinAnimation(results);
      
    } catch (error) {
      console.error('Error opening case:', error);
      setIsSpinning(false);
    }
  };

  // Функция для запуска анимации рулетки (адаптированная из оригинальной рулетки)
  const startSpinAnimation = async (results: CaseOpenResult[]) => {
    // Логирование удалено
    // Разные duration для горизонтальной и вертикальной прокрутки
    const baseDuration = isFastMode ? 1.5 : 6; // Ускоренный быстрый режим
    const horizontalDuration = baseDuration; // Одинаковая продолжительность
    const verticalDuration = baseDuration;

    // Определяем, мобильное ли устройство
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
          rarity: targetItem.rarity,
          isWithdrawable: true // По умолчанию предметы доступны для вывода
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

        // Вычисляем размеры карточек в зависимости от устройства
        // На мобильных всегда используем compact размеры (56x74), на desktop - обычные (76x100)
        const cardWidth = isMobile ? 56 : 76;
        const cardHeight = isMobile ? 74 : 100;
        const gap = isMobile ? 6 : 8;

        let animationPromise;

        if (selectedNumber === 1) {
          // Горизонтальная прокрутка для одного кейса
          const itemWidth = cardWidth + gap;

          // Получаем реальную ширину контейнера для мобильных
          let containerWidth;
          if (isMobile && rouletteContainerRef.current) {
            // Используем реальную ширину контейнера
            const rect = rouletteContainerRef.current.getBoundingClientRect();
            containerWidth = rect.width;
          } else {
            containerWidth = 663; // Desktop
          }

          // Начальная позиция
          const initialOffset = 0;

          // Генерируем случайное смещение в пределах карточки
          const randomOffset = (Math.random() - 0.5) * (isMobile ? 30 : 60);

          // Финальная позиция - центрируем выигрышный предмет + случайное смещение
          const finalOffset = -(targetIndex * itemWidth) + (containerWidth / 2) - (cardWidth / 2) + randomOffset;

          // Устанавливаем начальную позицию
          fieldControl.set({ x: initialOffset });

          // Создаем анимацию с плавной остановкой для горизонтальной прокрутки
          animationPromise = fieldControl.start({
            x: finalOffset,
            transition: {
              duration: horizontalDuration,
              ease: [0.23, 1, 0.32, 1],
            }
          });

        } else {
          // Вертикальная прокрутка для нескольких кейсов
          const itemHeight = cardHeight + gap;

          // Получаем реальную высоту контейнера для мобильных
          let containerHeight;
          if (isMobile && rouletteContainerRef.current) {
            // Используем реальную высоту контейнера
            const rect = rouletteContainerRef.current.getBoundingClientRect();
            containerHeight = rect.height;
          } else {
            containerHeight = 272; // Desktop
          }

          // Начальная позиция
          const initialOffset = 0;

          // Генерируем случайное смещение в пределах карточки
          const randomOffset = (Math.random() - 0.5) * (isMobile ? 40 : 80);

          // Финальная позиция - центрируем выигрышный предмет + случайное смещение
          const finalOffset = -(targetIndex * itemHeight) + (containerHeight / 2) - (cardHeight / 2) + randomOffset;

          // Устанавливаем начальную позицию
          fieldControl.set({ y: initialOffset });

          // Создаем анимацию с плавной остановкой для вертикальной прокрутки
          animationPromise = fieldControl.start({
            y: finalOffset,
            transition: {
              duration: verticalDuration,
              ease: [0.23, 1, 0.32, 1],
            }
          });
        }

        animationPromises.push(animationPromise);
      }
    }

    // Ждем завершения всех анимаций
    try {
      await Promise.all(animationPromises);
      // Логирование удалено
      setIsSpinning(false);
    } catch (error) {
      console.error('Animation error:', error);
      setIsSpinning(false);
    }
  };

  // Компонент для кнопок с цифрами
  const NumberButton = ({ number }: { number: number }) => (
    <motion.button
      onClick={() => {
        // Блокируем переключение во время прокрутки
        if (isSpinning) return;

        if (selectedNumber !== number) {
          setSelectedNumber(number);
          // Сбрасываем позиции анимации при смене количества кейсов
          setTimeout(() => resetAnimationPositions(), 50);
        }
      }}
      disabled={isSpinning}
      className={`flex w-[32px] h-[32px] md:w-[36px] md:h-[36px] justify-center items-center rounded-[8px] font-unbounded text-xs md:text-sm font-medium transition-all duration-200 ${
        isSpinning
          ? 'cursor-not-allowed opacity-50 bg-[#F9F8FC]/[0.05] text-[#F9F8FC]'
          : selectedNumber === number
            ? 'border border-[#5C5ADC] bg-[#6563EE]/[0.10] text-[#F9F8FC] cursor-pointer'
            : 'bg-[#F9F8FC]/[0.05] text-[#F9F8FC] hover:bg-[#F9F8FC]/[0.08] cursor-pointer'
      }`}
      whileHover={!isSpinning ? { scale: 1.05 } : {}}
      whileTap={!isSpinning ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {number}
    </motion.button>
  );




  // Обработка состояний загрузки и ошибки
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-xl mb-4">Error: {error}</div>
          <button 
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!caseData) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-85px-1rem)] md:h-[calc(100vh-85px-1rem)] flex flex-col items-start gap-2 md:gap-4 flex-1 self-stretch overflow-hidden px-2 md:px-0">
      {/* Кнопка назад */}
      <button
        onClick={() => router.back()}
        className="flex w-full h-[36px] md:h-[42px] items-center gap-2 md:gap-4 cursor-pointer"
      >
        <motion.div
          className="flex w-[36px] h-[36px] md:w-[42px] md:h-[42px] flex-col justify-center items-center gap-[10px] flex-shrink-0 rounded-[8px] bg-[#F9F8FC]/[0.05]"
          whileHover={{ backgroundColor: "rgba(249, 248, 252, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <img
            src="/Arrow - Left.svg"
            alt="Назад"
            width={18}
            height={12}
            className="w-[14px] h-[10px] md:w-[18px] md:h-[12px]"
          />
        </motion.div>
        <p className='text-[#F9F8FC] font-unbounded text-lg md:text-2xl font-medium'>Кейсы</p>
      </button>

      {/* Основной контент */}
      <div className='flex flex-col md:flex-row items-start gap-2 flex-[1_0_0] self-stretch'>
        <div className='flex flex-col items-start gap-2 flex-1 w-full md:w-auto'>
          {/* Блок с информацией о кейсе */}
          <div className="flex flex-col items-start gap-2 self-stretch p-3 md:p-4 rounded-xl bg-[#F9F8FC]/[0.05] w-full md:w-[679px] h-auto md:h-[288px]">
            <div className='flex flex-col md:flex-row h-auto md:h-[256px] items-center gap-3 md:gap-4 self-stretch'>
              {/* Изображение кейса */}
              <img
                src={getCaseImageUrl()}
                alt={`Изображение кейса ${caseData.name}`}
                width={256}
                height={256}
                className="object-cover rounded-lg w-[160px] h-[160px] md:w-[256px] md:h-[256px] flex-shrink-0"
              />

              {/* Информация о кейсе */}
              <div className='flex py-2 flex-col justify-between items-start flex-1 self-stretch w-full md:w-auto'>
                {/* Заголовок и описание */}
                <div className='flex flex-col items-start gap-1 md:gap-2 self-stretch'>
                  <h1 className='text-[#F9F8FC] font-unbounded text-base md:text-xl font-medium'>{caseData.name}</h1>
                  <p className="text-[#F9F8FC] font-['Actay_Wide'] text-xs md:text-sm font-bold opacity-30 leading-relaxed line-clamp-2 md:line-clamp-none">
                    {caseData.description || 'Case description not available'}
                  </p>
                </div>

                {/* Кнопки выбора количества */}
                <div className='flex items-center gap-1.5 md:gap-2'>
                  {[1, 2, 3, 4].map((number) => (
                    <NumberButton key={number} number={number} />
                  ))}
                </div>
                
                {/* Быстрый режим */}
                <div className='flex items-center gap-2 md:gap-4 self-stretch'>
                  <div className='flex items-center gap-1.5 md:gap-2'>
                    <img
                      src="/Fast.svg"
                      alt="Иконка быстрого режима"
                      width={10}
                      height={14}
                      className="flex-shrink-0 w-[8px] h-[11px] md:w-[10px] md:h-[14px]"
                    />
                    <p className="text-[#F9F8FC] font-['Actay_Wide'] text-xs md:text-base font-bold">Быстрый режим</p>
                    <motion.button
                      onClick={() => {
                        // Блокируем переключение быстрого режима во время прокрутки
                        if (isSpinning) return;
                        setIsFastMode(!isFastMode);
                      }}
                      disabled={isSpinning}
                      className={`flex w-[27px] h-[15px] p-[2px] ${
                        isSpinning
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer'
                      } ${
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
                <div className='flex items-center gap-1.5 md:gap-2 w-full md:w-auto'>
                  <motion.button
                    onClick={() => handleOpenCase(false)}
                    disabled={isSpinning}
                    className={`flex px-3 py-2 md:px-4 md:py-3 justify-center items-center gap-1.5 md:gap-2 rounded-xl transition-colors duration-200 flex-1 md:flex-initial ${
                      isSpinning
                        ? 'bg-[#5C5ADC]/50 cursor-not-allowed'
                        : 'bg-[#5C5ADC] cursor-pointer'
                    }`}
                    whileHover={!isSpinning ? { backgroundColor: "#6462DE" } : {}}
                    whileTap={!isSpinning ? { scale: 0.98 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <span className="text-[#F9F8FC] font-unbounded text-xs md:text-sm font-medium">
                      {isSpinning ? 'Открываем...' : `Открыть ${selectedNumber} ${selectedNumber === 1 ? 'кейс' : 'кейса'}`}
                    </span>
                    {!isSpinning && (
                      <>
                        <span className="text-[#F9F8FC] font-unbounded text-xs md:text-sm font-medium opacity-50">·</span>
                        <span className='text-[#F9F8FC] font-unbounded text-xs md:text-sm font-medium opacity-50'>
                          {selectedNumber * caseData.price}
                        </span>
                        <span className='text-[#F9F8FC] font-unbounded text-[9px] md:text-[10px] font-medium opacity-50'>АР</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    onClick={() => handleOpenCase(true)}
                    disabled={isSpinning}
                    className={`flex px-3 py-2 md:px-4 md:py-3 justify-center items-center gap-[10px] rounded-[8px] bg-[#F9F8FC]/[0.05] text-[#F9F8FC] font-unbounded text-xs md:text-sm font-medium transition-colors duration-200 ${
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
          <div className="flex p-2 md:p-[10px] items-start rounded-xl bg-[#F9F8FC]/[0.05] w-full md:w-[679px] h-[200px] md:h-[288px]">
            {/* Контейнер для полей кейсов */}
            <div className="flex w-full h-full gap-1.5 md:gap-[8px]">
              {selectedNumber === 1 && (
                // Одно поле на всю ширину с предметами расположенными горизонтально
                <div ref={rouletteContainerRef} className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden flex justify-center items-center">
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
                        compact={isCompactCards}
                      />
                    ))}
                  </motion.div>
                  
                  {/* Белая палочка по центру */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
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
                          compact={isCompactCards}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
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
                          compact={isCompactCards}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                     <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
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
                          compact={isCompactCards}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
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
                          compact={isCompactCards}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
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
                          compact={isCompactCards}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
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
                          compact={isCompactCards}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
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
                          compact={isCompactCards}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
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
                          compact={isCompactCards}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
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
                          compact={isCompactCards}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Белая палочка по центру */}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Правый сайдбар - скрыт на мобильных */}
        <div className='hidden md:flex w-[221px] flex-col rounded-xl bg-[#F9F8FC]/[0.05] overflow-hidden' style={{ height: '585px' }}>
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
                        onClick={() => handleOpenItemDescriptionModal(item)}
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
      
      {/* Модальное окно описания предмета */}
      <ItemDescriptionModal
        isOpen={isItemDescriptionModalOpen}
        onClose={handleCloseItemDescriptionModal}
        item={selectedItem}
      />
    </div>
  );
}