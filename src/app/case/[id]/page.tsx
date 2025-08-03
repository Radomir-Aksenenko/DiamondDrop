'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import useCaseAPI from '@/hooks/useCaseAPI';
import CaseItemCard from '@/components/ui/CaseItemCard';
import CaseSlotItemCard from '@/components/ui/CaseSlotItemCard';
import { API_BASE_URL } from '@/lib/config';
import { CaseItem } from '@/hooks/useCasesAPI';

// Динамический импорт RoulettePro для SSR совместимости
const RoulettePro = dynamic(() => import('react-roulette-pro'), {
  ssr: false,
});

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
  
  // Состояния для анимации рулетки с react-roulette-pro
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteStates, setRouletteStates] = useState<{
    [key: string]: {
      start: boolean;
      prizeList: Array<{id: string; image: string; text?: string; component?: React.ReactNode}>;
      prizeIndex: number;
    }
  }>({});
  
  // Результаты открытия кейсов
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [openResults, setOpenResults] = useState<CaseOpenResult[]>([]);

  // Функция для сброса состояний рулетки
  const resetRouletteStates = () => {
    setRouletteStates({});
    setOpenResults([]);
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

  // Функция для генерации случайных предметов для превью
  const generateRandomItems = (fieldId: string) => {
    if (!caseData?.items || caseData.items.length === 0) return [];
    
    const items = [];
    for (let i = 0; i < 20; i++) {
      const randomItem = getRandomItem();
      if (randomItem) {
        items.push({
          ...randomItem,
          id: `${fieldId}-preview-${i}-${randomItem.id}`
        });
      }
    }
    return items;
  };

  // Функция для создания списка призов для react-roulette-pro
  const createPrizeList = (targetItem: CaseOpenResult) => {
    if (!caseData?.items || caseData.items.length === 0) return [];
    
    // Создаем базовый массив случайных предметов
    const baseItems = caseData.items.map(item => ({
      id: item.id,
      image: item.imageUrl && item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE_URL}${item.imageUrl || ''}`,
      text: item.name,
      component: <CaseSlotItemCard item={item} />
    }));
    
    // Функция для генерации случайного предмета
    const getRandomPrize = () => {
      const randomIndex = Math.floor(Math.random() * baseItems.length);
      return { ...baseItems[randomIndex], id: `${baseItems[randomIndex].id}-${Date.now()}-${Math.random()}` };
    };
    
    // Создаем массив призов для рулетки
    const prizeList = [];
    
    // Добавляем случайные предметы в начало (для создания эффекта прокрутки)
    for (let i = 0; i < 20; i++) {
      prizeList.push(getRandomPrize());
    }
    
    // Преобразуем результат API в формат CaseItem для выигрышного предмета
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
    
    // Добавляем выигрышный предмет
    const winningPrize = {
      id: `${targetItem.id}-winning`,
      image: targetItem.imageUrl && targetItem.imageUrl.startsWith('http') ? targetItem.imageUrl : `${API_BASE_URL}${targetItem.imageUrl || ''}`,
      text: targetItem.name,
      component: <CaseSlotItemCard item={targetCaseItem} />
    };
    prizeList.push(winningPrize);
    
    // Добавляем случайные предметы в конец
    for (let i = 0; i < 10; i++) {
      prizeList.push(getRandomPrize());
    }
    
    return prizeList;
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
      
      // Сбрасываем предыдущие состояния рулетки
      resetRouletteStates();
      
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
      
      // Сохраняем результаты
      setOpenResults(results);
      
      // Запускаем анимацию рулетки
      startRouletteAnimation(results);
      
    } catch (error) {
      console.error('Ошибка при открытии кейса:', error);
      setIsSpinning(false);
    }
  };

  // Функция для запуска анимации рулетки с react-roulette-pro
  const startRouletteAnimation = async (results: CaseOpenResult[]) => {
    console.log('Запуск анимации рулетки для результатов:', results);
    
    // Создаем состояния рулетки для каждого поля
    const newRouletteStates: {
      [key: string]: {
        start: boolean;
        prizeList: Array<{id: string; image: string; text?: string; component?: React.ReactNode}>;
        prizeIndex: number;
      }
    } = {};
    
    for (let i = 0; i < selectedNumber; i++) {
      const targetItem = results[i];
      
      if (targetItem) {
        // Создаем список призов для рулетки
        const prizeList = createPrizeList(targetItem);
        
        // Находим индекс выигрышного приза (он всегда в центре списка)
        const prizeIndex = Math.floor(prizeList.length / 2);
        
        newRouletteStates[i] = {
          start: true,
          prizeList,
          prizeIndex
        };
      }
    }
    
    // Обновляем состояния рулетки
    setRouletteStates(newRouletteStates);
  };

  // Обработчик завершения анимации рулетки
  const handlePrizeDefined = (prizeIndex: number, fieldIndex: number) => {
    console.log(`Рулетка ${fieldIndex + 1} завершена, приз с индексом:`, prizeIndex);
    
    // Проверяем, завершились ли все рулетки
    const completedCount = Object.keys(rouletteStates).length;
    
    if (completedCount === selectedNumber) {
      console.log('Все рулетки завершены');
      setIsSpinning(false);
    }
  };

  // Компонент для кнопок с цифрами
  const NumberButton = ({ number }: { number: number }) => (
    <motion.button 
      onClick={() => {
        if (selectedNumber !== number) {
          setSelectedNumber(number);
          // Сбрасываем состояния рулетки при смене количества кейсов
          setTimeout(() => resetRouletteStates(), 50);
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
              {/* Рендерим рулетки для каждого выбранного поля */}
              {Array.from({ length: selectedNumber }, (_, index) => {
                const rouletteState = rouletteStates[index];
                const isHorizontal = selectedNumber === 1;
                
                return (
                  <div 
                    key={`roulette-${index}`}
                    className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden"
                  >
                    {rouletteState ? (
                      <RoulettePro
                        prizes={rouletteState.prizeList}
                        prizeIndex={rouletteState.prizeIndex}
                        start={rouletteState.start}
                        onPrizeDefined={() => handlePrizeDefined(rouletteState.prizeIndex, index)}
                        type={isHorizontal ? 'horizontal' : 'vertical'}
                        options={{
                          stopInCenter: true,
                          withoutAnimation: false,
                        }}
                      />
                    ) : (
                      // Показываем случайные предметы до начала анимации
                      <div className={`flex ${isHorizontal ? 'items-center gap-2 p-2' : 'flex-col items-center gap-2 p-2'} w-full h-full justify-center`}>
                        {generateRandomItems(`field${index + 1}`).slice(0, isHorizontal ? 8 : 6).map((item, itemIndex) => (
                          <CaseSlotItemCard 
                            key={`preview-${item.id}-${itemIndex}`} 
                            item={item} 
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Белая палочка по центру */}
                    <div className={`absolute ${isHorizontal 
                      ? 'top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b' 
                      : 'top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-gradient-to-r'
                    } from-white/90 via-white to-white/90 z-10 pointer-events-none shadow-lg shadow-white/20`}>
                    </div>
                  </div>
                );
              })}
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