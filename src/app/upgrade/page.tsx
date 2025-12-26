'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useInventoryAPI, InventoryItem } from '@/hooks/useInventoryAPI';
import { ItemCard } from '@/components/ui/RarityCard';
import { CaseItem } from '@/hooks/useCasesAPI';
import useUpgradeAPI, { UpgradeInventoryItem } from '@/hooks/useUpgradeAPI';
import { useIsMobile } from '@/hooks/useIsMobile';
import Link from 'next/link'

// Константа процента удалена как неиспользуемая

// Максимальное количество предметов для апгрейда
const MAX_UPGRADE_ITEMS = 8;

// Единый параметр высоты нижних блоков (в пикселях)
const BOTTOM_SECTION_HEIGHT = 380;

// Интерфейс для выбранного предмета
interface SelectedItem {
  inventoryItem: InventoryItem;
  selectedAmount: number;
}

interface CircularProgressProps {
  percentage: number;
  hasSelectedUpgradeItem?: boolean;
  isSpinning?: boolean;
  currentRotation?: number;
  animationDuration?: number;
  formatPercentage?: (percentage: number) => string;
}

// Функция для форматирования процента с точными значениями
const formatPercentage = (percentage: number): string => {
  if (percentage < 0.001) {
    return '< 0.001';
  }
  
  // Определяем количество знаков после запятой
  if (percentage >= 100) {
    // Для больших значений показываем 2 знака после запятой
    return percentage.toFixed(2);
  } else if (percentage >= 1) {
    // Для значений от 1 до 100 показываем 2 знака
    return percentage.toFixed(2);
  } else if (percentage >= 0.01) {
    // Для значений от 0.01 до 1 показываем 2 знака
    return percentage.toFixed(2);
  } else {
    // Для значений от 0.001 до 0.01 показываем 3 знака
    return percentage.toFixed(3);
  }
};

// Функция для определения цвета и текста в зависимости от процента
const getPercentageStyle = (percentage: number) => {
  if (percentage >= 0 && percentage <= 29) {
    return {
      color: '#FF4444',
      text: 'Небольшой'
    };
  } else if (percentage >= 30 && percentage <= 59) {
    return {
      color: '#D79F37',
      text: 'Средний'
    };
  } else {
    return {
      color: '#11AB47',
      text: 'Большой'
    };
  }
};

// Маппер цвета текста по редкости предмета
const rarityTextColor = (rarity: CaseItem['rarity']) => {
  switch (rarity) {
    case 'Common':
      return 'text-[#9CA3AF]';
    case 'Uncommon':
      return 'text-[#618AF3]';
    case 'Rare':
      return 'text-[#11AB47]';
    case 'Epic':
      return 'text-[#A855F7]';
    case 'Legendary':
      return 'text-[#F59E0B]';
    default:
      return 'text-[#F9F8FC]';
  }
};

const CircularProgress = ({ percentage, hasSelectedUpgradeItem = false, isSpinning = false, currentRotation = 90, animationDuration = 3000, formatPercentage: formatPercentageProp }: CircularProgressProps) => {
  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  // Используем переданную функцию форматирования или дефолтную
  const formatFunc = formatPercentageProp || formatPercentage;
  const formattedPercentage = formatFunc(percentage);
  // Для визуального отображения прогресса используем ограниченное значение (максимум 100%)
  const displayPercentage = Math.min(percentage, 100);
  const strokeDasharray = `${(displayPercentage / 100) * circumference} ${circumference}`;

  return (
    <div className="relative w-[172px] h-[172px]">
      <svg 
        width="172" 
        height="172" 
        className="transform -rotate-90"
      >
        <circle
          cx="86"
          cy="86"
          r="78"
          className={hasSelectedUpgradeItem ? "fill-[#3A3A40]" : "fill-[#232328]"}
        />
        <circle
          cx="86"
          cy="86"
          r={radius}
          className="fill-none stroke-[#2F2F35]"
          strokeWidth="8"
        />
        <circle
          cx="86"
          cy="86"
          r={radius}
          className="fill-none stroke-[#5C5ADC]"
          strokeWidth="8"
          strokeLinecap="butt"
          strokeDasharray={strokeDasharray}
        />
        {/* Треугольник в верхней части круга */}
        <polygon
          points="86,8 92,15 80,15"
          fill="#F9F8FC"
          style={{
            transformOrigin: '86px 86px',
            transform: `rotate(${currentRotation}deg)`,
            transition: isSpinning ? `transform ${animationDuration}ms cubic-bezier(0.23, 1, 0.32, 1)` : 'none'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
           <span 
             className="text-center font-bold" 
             style={{ 
               color: getPercentageStyle(percentage).color,
               fontFamily: 'Actay Wide',
               fontSize: '20px',
               fontWeight: 700,
               lineHeight: 'normal'
             }}
           >
             {formattedPercentage}%
           </span>
           <div 
              className="text-center font-bold" 
              style={{ 
                color: getPercentageStyle(percentage).color,
                fontFamily: 'Actay Wide',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: 'normal',
                width: '123px',
                opacity: 0.5
              }}
            >
              <div>{getPercentageStyle(percentage).text}</div>
              <div>шанс</div>
            </div>
         </div>
    </div>
  );
};

// Компонент для отображения списка предметов с процентами
function CaseItemsList({
  items,
  loading,
  error,
  selectedUpgradeItem,
  onItemSelect,
  onItemRemove,
  calculateTotalPrice,
  rtp,
  hasSelectedItems,
  hasMore,
  onLoadMore,
  gridCols = 3
}: {
  items: CaseItem[],
  loading: boolean,
  error?: string | null,
  selectedUpgradeItem: CaseItem | null,
  onItemSelect: (item: CaseItem) => void,
  onItemRemove: () => void,
  calculateTotalPrice: () => number,
  rtp: number,
  hasSelectedItems: boolean,
  hasMore: boolean,
  onLoadMore: () => void,
  gridCols?: number
}) {
  // Функция для расчета успешного апгрейда для конкретного предмета (точное значение)
  const calculateItemUpgradePercentage = (upgradeItemPrice: number) => {
    const totalUserItemsPrice = calculateTotalPrice();
    
    if (upgradeItemPrice === 0 || rtp === 0) {
      return 0;
    }
    
    const percentage = (totalUserItemsPrice / upgradeItemPrice) * rtp;
    return percentage; // Возвращаем точное значение без округления
  };
  // Сортируем предметы по цене (по возрастанию для правого блока)
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => a.price - b.price);
  }, [items]);

  // Не показываем центральный индикатор загрузки — список остаётся стабильным

  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <p className='text-red-400 text-center font-["Actay_Wide"] text-sm'>
          Ошибка загрузки предметов:<br />{error}
        </p>
      </div>
    );
  }

  // Если нет выбранных предметов из инвентаря, показываем сообщение
  if (!hasSelectedItems) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <p className='text-[#5C5B60] text-center font-["Actay_Wide"] text-base'>Сначало выберите предметы<br/>для апгрейда</p>
      </div>
    );
  }

  // Фильтруем предметы на основе минимальной цены и выбранного предмета для улучшения
  const filteredItems = sortedItems.filter(item => item.price >= Math.max(calculateTotalPrice(), 0));

  if (filteredItems.length === 0 && hasSelectedItems && !loading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <p className='text-[#5C5B60] text-center font-["Actay_Wide"] text-base'>Нет доступных предметов<br/>для данной цены</p>
      </div>
    );
  }

  return (
    <div className='flex px-4 flex-col items-stretch gap-2 flex-1 self-stretch min-h-0'>
      <div 
        className="flex-1 w-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#F9F8FC]/20 scrollbar-track-[rgba(249,248,252,0.05)] hover:scrollbar-thumb-[#F9F8FC]/40 transition-colors"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(249, 248, 252, 0.2) transparent',
          paddingBottom: '10px'
        }}
        onScroll={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
          if (nearBottom && hasMore && !loading) {
            onLoadMore();
          }
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar { width: 4px; }
          div::-webkit-scrollbar-track { background: transparent; }
          div::-webkit-scrollbar-thumb { background: rgba(249, 248, 252, 0.2); border-radius: 2px; }
          div::-webkit-scrollbar-thumb:hover { background: rgba(249, 248, 252, 0.3); }
        `}</style>
        <div className={`grid ${gridCols === 2 ? 'grid-cols-2' : 'grid-cols-3'} ${gridCols === 2 ? 'auto-rows-[100px]' : 'auto-rows-[76px]'} ${gridCols === 2 ? 'gap-2' : 'gap-3'}`}>
          {filteredItems.map((item) => {
            const percentage = calculateItemUpgradePercentage(item.price);
            return (
              <div key={item.id} className="relative group">
                <ItemCard
                  item={item}
                  amount={percentage}
                  formattedAmount={formatPercentage(percentage)}
                  orientation="horizontal"
                  className="hover:brightness-110 transition-all"
                  fullWidth
                  showPercentage={true}
                  isSelected={selectedUpgradeItem?.id === item.id}
                  onRemove={selectedUpgradeItem?.id === item.id ? onItemRemove : undefined}
                  onClick={() => {
                    if (selectedUpgradeItem?.id === item.id) {
                      onItemRemove();
                    } else {
                      onItemSelect(item);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
        {/* Нижний индикатор: фиксированная высота для бесшовной подгрузки */}
        <div className='h-10 flex items-center justify-center'>
          {loading ? (
            <div className='w-6 h-6 border-2 border-[#F9F8FC]/20 border-t-[#F9F8FC] rounded-full animate-spin' aria-label='Загрузка...' />
          ) : (
            items.length > 0 && !hasMore ? (
              <div className='text-center text-[#F9F8FC]/40 font-["Actay_Wide"] text-xs'>Это всё</div>
            ) : null
          )}
        </div>
      </div>
    </div>
   );
}

// Компонент для отображения списка предметов инвентаря
function InventoryItemsList({ selectedItems, onItemSelect, inventoryUpdateRef, convertToCaseItem, gridCols = 3 }: {
  selectedItems: SelectedItem[],
  onItemSelect: (item: InventoryItem) => void,
  inventoryUpdateRef?: React.MutableRefObject<{
    updateItemAmounts: (updates: { itemId: string; amountChange: number }[]) => void;
    addItemToInventory: (newItem: InventoryItem) => void;
  } | null>,
  convertToCaseItem: (inventoryItem: InventoryItem) => CaseItem,
  gridCols?: number
}) {
  const { items, loading, error, updateItemAmounts, addItemToInventory } = useInventoryAPI();
  
  // Передаем функции обновления родительскому компоненту через ref
  React.useEffect(() => {
    if (inventoryUpdateRef) {
      inventoryUpdateRef.current = {
        updateItemAmounts,
        addItemToInventory
      };
    }
  }, [updateItemAmounts, addItemToInventory, inventoryUpdateRef]);

  // Сортируем предметы по цене (по убыванию)
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => b.item.price - a.item.price);
  }, [items]);



  if (loading && items.length === 0) {
    return (
      <div className='flex px-4 flex-col items-center justify-center gap-4 flex-1 self-stretch'>
        <div className="w-12 h-12 border-4 border-[#F9F8FC]/20 border-t-[#5C5ADC] rounded-full animate-spin"></div>
        <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-sm opacity-70'>Загрузка предметов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex px-4 flex-col items-center justify-center gap-2 flex-1 self-stretch'>
        <p className='text-[#FF4444] text-center font-["Actay_Wide"] text-sm'>Ошибка загрузки</p>
        <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-xs opacity-50'>{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='flex px-4 flex-col items-center justify-center gap-4 flex-1 self-stretch'>
        <p className='text-[#5C5B60] text-center font-["Actay_Wide"] text-base'>Предметы можно найти <Link href="/" className="text-[#5C5ADC] underline">в кейсах</Link></p>
        <Link href="/" className="inline-flex">
          <button className='px-6 py-3 rounded-xl bg-[rgba(249,248,252,0.05)] text-[#F9F8FC] font-["Actay_Wide"] text-base hover:bg-[rgba(249,248,252,0.1)] transition'>Перейти</button>
        </Link>
      </div>
    );
  }

  return (
    <div className='flex px-4 flex-col items-stretch gap-2 flex-1 self-stretch min-h-0'>
      {/* Область со скроллом для сетки предметов */}
      <div 
        className="flex-1 w-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#F9F8FC]/20 scrollbar-track-[rgba(249,248,252,0.05)] hover:scrollbar-thumb-[#F9F8FC]/40 transition-colors"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(249, 248, 252, 0.2) transparent',
          paddingBottom: '10px'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar { width: 4px; }
          div::-webkit-scrollbar-track { background: transparent; }
          div::-webkit-scrollbar-thumb { background: rgba(249, 248, 252, 0.2); border-radius: 2px; }
          div::-webkit-scrollbar-thumb:hover { background: rgba(249, 248, 252, 0.3); }
        `}</style>
        <div className={`grid ${gridCols === 2 ? 'grid-cols-2' : 'grid-cols-3'} ${gridCols === 2 ? 'auto-rows-[100px]' : 'auto-rows-[76px]'} ${gridCols === 2 ? 'gap-2' : 'gap-3'}`}>
          {sortedItems.map((inventoryItem) => {
            // Суммируем все selectedAmount для одинаковых предметов
            const totalSelectedAmount = selectedItems
              .filter(selected => selected.inventoryItem.item.id === inventoryItem.item.id)
              .reduce((sum, selected) => sum + selected.selectedAmount, 0);
            const availableAmount = inventoryItem.amount - totalSelectedAmount;
            
            return (
              <div key={inventoryItem.item.id} className="relative group">
                <ItemCard
                  item={convertToCaseItem(inventoryItem)}
                  amount={availableAmount}
                  orientation="horizontal"
                  className="hover:brightness-110 transition-all"
                  fullWidth
                  showPercentage={false}
                  onClick={() => {
                    if (availableAmount > 0) {
                      onItemSelect(inventoryItem);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  const { isMobile } = useIsMobile();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [isMinPriceManual, setIsMinPriceManual] = useState<boolean>(false);
  const [selectedUpgradeItem, setSelectedUpgradeItem] = useState<CaseItem | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [currentRotation, setCurrentRotation] = useState<number>(90); // Начальный угол 90°, чтобы указатель был сверху
  const [animationDuration, setAnimationDuration] = useState<number>(3000); // Длительность анимации в мс
  const [activeTab, setActiveTab] = useState<'upgrade' | 'inventory' | 'target'>('upgrade'); // Для мобильных вкладок

  // Ref для функций обновления инвентаря
  const inventoryUpdateFunctions = useRef<{
    updateItemAmounts: (updates: { itemId: string; amountChange: number }[]) => void;
    addItemToInventory: (newItem: InventoryItem) => void;
  } | null>(null);

  // Получаем данные из API
  const { 
    rtp, 
    executeUpgrade, 
    upgradeLoading, 
    upgradeItems, 
    upgradeItemsLoading, 
    upgradeItemsError, 
    fetchUpgradeItems,
    upgradeItemsHasMore,
    loadMoreUpgradeItems
  } = useUpgradeAPI();

  // Функция для расчета общей суммы выбранных предметов
  const calculateTotalPrice = useCallback(() => {
    return selectedItems.reduce((total, item) => {
      const price = Number(item.inventoryItem.item.price || 0);
      const count = Number(item.selectedAmount || 1);
      return total + price * count;
    }, 0);
  }, [selectedItems]);

  // Функция для расчета процента успешного апгрейда (точное значение без округления)
  const calculateUpgradeSuccessPercentage = useCallback(() => {
    const totalUserItemsPrice = calculateTotalPrice();
    const upgradeItemPrice = selectedUpgradeItem?.price || 0;
    
    if (upgradeItemPrice === 0 || rtp === 0) {
      return 0;
    }
    
    const percentage = (totalUserItemsPrice / upgradeItemPrice) * rtp;
    return percentage; // Возвращаем точное значение без округления
  }, [calculateTotalPrice, selectedUpgradeItem?.price, rtp]);

  // Функция для расчета округленного окупа (x9 формат)
  const calculateRoundedPayback = useCallback(() => {
    const totalUserItemsPrice = calculateTotalPrice();
    const upgradeItemPrice = Number(selectedUpgradeItem?.price || 0);

    if (!selectedUpgradeItem || totalUserItemsPrice <= 0 || upgradeItemPrice <= 0) {
      return 0;
    }

    const ratio = upgradeItemPrice / totalUserItemsPrice;
    // Всегда возвращаем хотя бы 1, чтобы не показывать x0 при валидных данных
    return Math.max(1, Math.round(ratio));
  }, [calculateTotalPrice, selectedUpgradeItem?.price]);

  // Разница цены: (цена цели − сумма выбранных), не отрицательная
  const calculatePriceDifference = useCallback(() => {
    const totalUserItemsPrice = calculateTotalPrice();
    const upgradeItemPrice = Number(selectedUpgradeItem?.price || 0);
    const diff = upgradeItemPrice - totalUserItemsPrice;
    return Math.max(0, Math.round(diff));
  }, [calculateTotalPrice, selectedUpgradeItem?.price]);

  // Преобразуем InventoryItem в CaseItem для совместимости с ItemCard
  const convertToCaseItem = useCallback((inventoryItem: InventoryItem): CaseItem => ({
    id: inventoryItem.item.id,
    name: inventoryItem.item.name,
    description: inventoryItem.item.description || null,
    imageUrl: inventoryItem.item.imageUrl || null,
    amount: inventoryItem.item.amount, // Количество единиц в ОДНОМ предмете для x на иконке
    price: inventoryItem.item.price,
    percentChance: inventoryItem.item.percentChance || 0,
    rarity: inventoryItem.item.rarity,
    isWithdrawable: inventoryItem.item.isWithdrawable
  }), []);

  // Обработчик выбора предмета для апгрейда
  const handleUpgradeItemSelect = (item: CaseItem) => {
    setSelectedUpgradeItem(item);
  };

  // Обработчик удаления предмета из апгрейда
  const handleUpgradeItemRemove = () => {
    setSelectedUpgradeItem(null);
  };

  // Обработчик клика по кнопке "Прокачать"
  const handleUpgradeClick = async () => {
    if (!selectedUpgradeItem || selectedItems.length === 0 || isSpinning || upgradeLoading) {
      return;
    }

    setIsSpinning(true);
    
    // Подготавливаем данные для API
    const upgradeData = {
      selectedItemIds: selectedItems.map(item => ({
        id: item.inventoryItem.item.id,
        amount: item.selectedAmount
      })),
      targetItemId: selectedUpgradeItem.id
    };
    
    // Выполняем запрос к API
    const result = await executeUpgrade(upgradeData);
    
    // Получаем текущий процент успеха для расчета позиций
    const currentPercentage = calculateUpgradeSuccessPercentage();
    
    // === ЕСТЕСТВЕННАЯ АНИМАЦИЯ С ТОЧНЫМ РЕЗУЛЬТАТОМ ===
    console.log('=== ЕСТЕСТВЕННАЯ АНИМАЦИЯ ===');
    console.log('Результат:', result?.success ? 'ВЫИГРЫШ' : 'ПРОИГРЫШ');
    console.log('Процент успеха:', currentPercentage + '%');
    
    // Рассчитываем размеры зон (0° = верх)
    const blueZoneSize = (currentPercentage / 100) * 360; // Синяя зона (шанс успеха) от 0° до blueZoneSize
    const grayZoneSize = 360 - blueZoneSize; // Серая зона от blueZoneSize до 360°
    
    // === СЛУЧАЙНОЕ ПОЗИЦИОНИРОВАНИЕ В НУЖНОЙ ЗОНЕ ===
    let targetAngle: number;
    if (result && result.success) {
      // Выигрыш: случайная позиция в синей зоне (цветная зона = выигрыш)
      const minBlue = 5; // Отступ от края
      const maxBlue = Math.max(minBlue + 1, blueZoneSize - 5);
      targetAngle = minBlue + Math.random() * (maxBlue - minBlue);
      console.log('🎯 СЛУЧАЙНАЯ ПОЗИЦИЯ В СИНЕЙ ЗОНЕ (ВЫИГРЫШ):', targetAngle.toFixed(2) + '°');
    } else {
      // Проигрыш: случайная позиция в серой зоне (серая зона = проигрыш)
      const minGray = blueZoneSize + 5; // Отступ от края
      const maxGray = Math.min(355, 360); // Отступ от края
      
      if (grayZoneSize < 20) { // Очень маленькая серая зона
        // Для очень маленьких зон используем центральную область
        const centerGray = blueZoneSize + (grayZoneSize / 2);
        const variance = Math.min(grayZoneSize * 0.3, 5); // Максимум 30% зоны или 5°
        targetAngle = centerGray + (Math.random() - 0.5) * variance;
        console.log('⚠️ ОЧЕНЬ МАЛЕНЬКАЯ СЕРАЯ ЗОНА! Центр с вариацией:', targetAngle.toFixed(2) + '°');
      } else {
        // Обычная случайная позиция в серой зоне
        targetAngle = minGray + Math.random() * (maxGray - minGray);
        console.log('🎯 СЛУЧАЙНАЯ ПОЗИЦИЯ В СЕРОЙ ЗОНЕ (ПРОИГРЫШ):', targetAngle.toFixed(2) + '°');
      }
    }
    
    // Убеждаемся, что угол находится в правильных границах
    if (result?.success) {
      // Выигрыш: ограничиваем синей зоной
      targetAngle = Math.max(1, Math.min(targetAngle, blueZoneSize - 1));
    } else {
      // Проигрыш: ограничиваем серой зоной
      targetAngle = Math.max(blueZoneSize + 1, Math.min(targetAngle, 359));
    }
    
    // === ОБЕСПЕЧЕНИЕ ВРАЩЕНИЯ ТОЛЬКО ПО ЧАСОВОЙ СТРЕЛКЕ ===
    // Корректируем текущий угол обратно к логической системе координат (убираем SVG коррекцию)
    const currentAngle = (currentRotation - 90) % 360; // Текущий угол треугольника в логической системе (0-360°)
    
    // Если целевой угол меньше текущего, добавляем полный оборот
    let adjustedTargetAngle = targetAngle;
    if (targetAngle < currentAngle) {
      adjustedTargetAngle = targetAngle + 360;
    }
    
    // === ТОЧНЫЙ АЛГОРИТМ ПОЗИЦИОНИРОВАНИЯ ===
    // Используем более точный подход для обеспечения правильной остановки
    const baseRotations = 3; // Базовое количество оборотов
    const extraRotations = Math.random() * 2; // От 0 до 2 дополнительных оборотов
    const totalRotations = baseRotations + extraRotations;
    
    // Вычисляем точный финальный угол с учетом особенностей CSS анимации
    // Используем модульную арифметику для точного позиционирования
    const rotationDistance = (adjustedTargetAngle - currentAngle) + (totalRotations * 360);
    const finalAngle = currentRotation + rotationDistance;
    
    // Проверяем, что финальная позиция будет точно в нужной зоне
    const predictedFinalPosition = finalAngle % 360;
    const maxDeviation = 5; // Максимальное допустимое отклонение от цели
    
    // Всегда корректируем для достижения точной цели
    let correctedFinalAngle = finalAngle;
    const deviation = Math.abs(predictedFinalPosition - targetAngle);
    
    if (deviation > maxDeviation) {
      // Большое отклонение - применяем полную коррекцию
      const correction = predictedFinalPosition - targetAngle;
      correctedFinalAngle = finalAngle - correction;
    } else if (deviation > 1) {
      // Малое отклонение - применяем частичную коррекцию для плавности
      const correction = (predictedFinalPosition - targetAngle) * 0.8;
      correctedFinalAngle = finalAngle - correction;
    }
    
    // Дополнительная проверка: убеждаемся, что результат в правильной зоне
    const finalPredictedPosition = correctedFinalAngle % 360;
    const isInCorrectZone = result?.success ? 
      (finalPredictedPosition >= 0 && finalPredictedPosition <= blueZoneSize) :
      (finalPredictedPosition > blueZoneSize || finalPredictedPosition < 0);
    
    if (!isInCorrectZone) {
      // Если после коррекции всё ещё в неправильной зоне, применяем экстренную коррекцию
      const emergencyCorrection = finalPredictedPosition - targetAngle;
      correctedFinalAngle = finalAngle - emergencyCorrection;
    }
    
    // === СТАНДАРТНАЯ ДЛИТЕЛЬНОСТЬ ДЛЯ ВСЕХ АНИМАЦИЙ ===
    const animationDuration = 4000; // Всегда 4 секунды
    
    console.log('🧭 Текущий угол:', currentAngle.toFixed(2) + '°');
    console.log('🎯 Целевой угол:', targetAngle.toFixed(2) + '°');
    console.log('🔄 Скорректированный угол:', adjustedTargetAngle.toFixed(2) + '°');
    console.log('🔄 Количество оборотов:', totalRotations.toFixed(2));
    console.log('🎯 Исходный финальный угол:', finalAngle.toFixed(2) + '°');
    console.log('🎯 Предсказанная позиция:', predictedFinalPosition.toFixed(2) + '°');
    console.log('📐 Отклонение от цели:', Math.abs(predictedFinalPosition - targetAngle).toFixed(2) + '°');
    console.log('🔧 Скорректированный финальный угол:', correctedFinalAngle.toFixed(2) + '°');
    console.log('🔧 Ожидаемая финальная позиция:', (correctedFinalAngle % 360).toFixed(2) + '°');
    console.log('📏 Синяя зона (шанс успеха): 0° → ' + blueZoneSize.toFixed(2) + '°');
    console.log('📏 Серая зона: ' + blueZoneSize.toFixed(2) + '° → 360°');
    console.log('⏱️ Длительность: ' + (animationDuration / 1000) + 'с');
    console.log('🚀 ЗАПУСК ТОЧНОЙ АНИМАЦИИ (ТОЛЬКО ПО ЧАСОВОЙ СТРЕЛКЕ)...');

    // Устанавливаем параметры анимации с скорректированным углом
    // Корректируем угол для SVG системы координат (SVG повернут на -90°)
    const svgCorrectedAngle = correctedFinalAngle + 90;
    setAnimationDuration(animationDuration);
    setCurrentRotation(svgCorrectedAngle);
    
    // Завершаем анимацию и обновляем инвентарь
    setTimeout(() => {
      setIsSpinning(false);
      
      // === ПРОВЕРКА РЕЗУЛЬТАТА ===
      const actualFinalPosition = correctedFinalAngle % 360;
      const isInBlueZone = actualFinalPosition >= 0 && actualFinalPosition <= blueZoneSize;
      const isCorrect = (result?.success && isInBlueZone) || (!result?.success && !isInBlueZone);
      
      console.log('🏁 Точная анимация завершена! Позиция:', actualFinalPosition.toFixed(1) + '°');
      console.log('📍 В синей зоне:', isInBlueZone ? 'ДА' : 'НЕТ');
      console.log('✅ Результат корректен:', isCorrect ? 'ДА' : 'НЕТ');
      console.log('🎯 Отклонение от цели:', Math.abs(actualFinalPosition - targetAngle).toFixed(1) + '°');
      
      // Обновляем инвентарь после завершения анимации
      if (inventoryUpdateFunctions.current) {
        // Уменьшаем количество потраченных предметов
        const itemCounts = selectedItems.reduce((acc, selectedItem) => {
          const itemId = selectedItem.inventoryItem.item.id;
          acc[itemId] = (acc[itemId] || 0) + selectedItem.selectedAmount;
          return acc;
        }, {} as Record<string, number>);
        
        const itemUpdates = Object.entries(itemCounts).map(([itemId, count]) => ({
          itemId,
          amountChange: -count
        }));
        
        inventoryUpdateFunctions.current.updateItemAmounts(itemUpdates);
        
        // Если апгрейд успешен, добавляем выигранный предмет
        if (result && result.success && selectedUpgradeItem) {
          const wonItem: InventoryItem = {
            item: {
              id: selectedUpgradeItem.id,
              name: selectedUpgradeItem.name,
              description: selectedUpgradeItem.description || null,
              imageUrl: selectedUpgradeItem.imageUrl || '',
              amount: selectedUpgradeItem.amount,
              price: selectedUpgradeItem.price,
              percentChance: selectedUpgradeItem.percentChance,
              rarity: selectedUpgradeItem.rarity,
              isWithdrawable: selectedUpgradeItem.isWithdrawable
            },
            amount: 1 // Добавляем 1 экземпляр выигранного предмета
          };
          
          inventoryUpdateFunctions.current.addItemToInventory(wonItem);
        }
      }
      
      // Очищаем выбранные предметы
      setSelectedItems([]);
    }, animationDuration);
  };

  // Функция для преобразования UpgradeInventoryItem в CaseItem
  const convertUpgradeItemToCaseItem = useCallback((upgradeInventoryItem: UpgradeInventoryItem): CaseItem | null => {
    // Проверяем, что upgradeInventoryItem и его item существуют
    if (!upgradeInventoryItem || !upgradeInventoryItem.item) {
      return null;
    }

    const item = upgradeInventoryItem.item;
    
    // Приводим rarity к правильному типу, с fallback на 'Common'
    const validRarities: readonly string[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    const rarity = item.rarity && validRarities.includes(item.rarity) 
      ? item.rarity as 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
      : 'Common';

    return {
      id: item.id || '',
      name: item.name || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      amount: item.amount || 0, // Количество единиц в одном предмете для оверлея x
      price: item.price || 0,
      percentChance: item.percentChance || 0,
      rarity: rarity,
      isWithdrawable: true // По умолчанию true для предметов апгрейда
    };
  }, []);

  // Преобразуем данные из API в формат CaseItem
  const convertedUpgradeItems = React.useMemo(() => {
    return upgradeItems
      .map(convertUpgradeItemToCaseItem)
      .filter((item): item is CaseItem => item !== null);
  }, [upgradeItems, convertUpgradeItemToCaseItem]);

  // Загружаем предметы для апгрейда при изменении минимальной цены
  React.useEffect(() => {
    // При изменении минимальной цены сбрасываем пагинацию и грузим первую страницу
    fetchUpgradeItems(minPrice, 1, false);
  }, [minPrice, fetchUpgradeItems]);

  // Обновляем минимальную цену при изменении выбранных предметов (авто-режим)
  React.useEffect(() => {
    if (isMinPriceManual) return; // Пользователь ввёл вручную — не трогаем
    const total = calculateTotalPrice();
    if (selectedItems.length === 0) {
      if (minPrice !== 0) setMinPrice(0);
    } else {
      const autoMinPrice = total > 0 ? (Number.isInteger(total) ? total + 1 : Math.ceil(total)) : 0; // целые => +1, дробные => округление до целого (вверх)
      if (minPrice !== autoMinPrice) setMinPrice(autoMinPrice);
    }
  }, [selectedItems, calculateTotalPrice, isMinPriceManual, minPrice]);

  // Сбрасываем ручной режим и минимальную цену, когда все предметы удалены
  React.useEffect(() => {
    if (selectedItems.length === 0) {
      if (isMinPriceManual) setIsMinPriceManual(false);
      if (minPrice !== 0) setMinPrice(0);
    }
  }, [selectedItems.length, isMinPriceManual, minPrice]);

  // Подгружаем предметы при изменении минимальной цены
  React.useEffect(() => {
    fetchUpgradeItems(minPrice, 1, false);
  }, [minPrice, fetchUpgradeItems]);

  // Если пользователь полностью очистил окно апгрейда (нет выбранных предметов),
  // то сбрасываем также и целевой предмет для улучшения
  React.useEffect(() => {
    if (selectedItems.length === 0 && selectedUpgradeItem) {
      setSelectedUpgradeItem(null);
    }
  }, [selectedItems.length, selectedUpgradeItem]);

  const handleItemSelect = (inventoryItem: InventoryItem) => {
    if (selectedItems.length >= MAX_UPGRADE_ITEMS) {
      return; // Максимум 8 предметов
    }

    setSelectedItems(prev => {
      // Проверяем, сколько раз уже выбран этот предмет
      const selectedCount = prev.filter(item => item.inventoryItem.item.id === inventoryItem.item.id).length;

      if (selectedCount < inventoryItem.amount) {
        // Добавляем новый экземпляр предмета в отдельную ячейку
        return [...prev, { inventoryItem, selectedAmount: 1 }];
      }
      return prev;
    });
  };

  // Мобильная версия с вкладками
  if (isMobile) {
    return (
      <div className="flex flex-col w-full h-full pt-2">
        {/* Навигация вкладок */}
        <div className="flex gap-2 mx-4 mb-4 p-2 rounded-xl bg-[#18181D]">
          <button
            onClick={() => setActiveTab('upgrade')}
            className={`flex-1 py-3 px-4 rounded-lg font-["Actay_Wide"] text-sm font-bold transition-all ${
              activeTab === 'upgrade'
                ? 'bg-[#232329] text-[#F9F8FC]'
                : 'bg-transparent text-[#F9F8FC] opacity-50 hover:bg-[#232329]'
            }`}
          >
            Апгрейд
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-3 px-4 rounded-lg font-["Actay_Wide"] text-sm font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-[#232329] text-[#F9F8FC]'
                : 'bg-transparent text-[#F9F8FC] opacity-50 hover:bg-[#232329]'
            }`}
          >
            Инвентарь
          </button>
          <button
            onClick={() => setActiveTab('target')}
            className={`flex-1 py-3 px-4 rounded-lg font-["Actay_Wide"] text-sm font-bold transition-all ${
              activeTab === 'target'
                ? 'bg-[#232329] text-[#F9F8FC]'
                : 'bg-transparent text-[#F9F8FC] opacity-50 hover:bg-[#232329]'
            }`}
          >
            Цель
          </button>
        </div>

        {/* Контент вкладок */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Вкладка "Апгрейд" */}
          {activeTab === 'upgrade' && (
            <div className="flex flex-col gap-4">
              {/* Выбранные предметы */}
              <div className="flex flex-col rounded-xl bg-[rgba(249,248,252,0.05)] p-4">
                <p className="text-[#F9F8FC] font-['Actay_Wide'] text-base font-bold mb-3">Выбранные предметы</p>
                {selectedItems.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-[#5C5B60] text-center font-['Actay_Wide'] text-sm">
                      Выберите до 8 предметов<br/>из инвентаря
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from({ length: 8 }, (_, i) => {
                      const item = selectedItems[i];
                      return (
                        <div key={i} className="aspect-[78/124.75]">
                          {item ? (
                            <ItemCard
                              item={convertToCaseItem(item.inventoryItem)}
                              amount={item.inventoryItem.item.amount}
                              orientation="vertical"
                              className="w-full h-full"
                              isSelected={true}
                              hideAmountInPieces={true}
                              upgradeMode={true}
                              onClick={() => {
                                setSelectedItems(prev => prev.filter((_, index) => index !== i));
                              }}
                              onRemove={() => {
                                setSelectedItems(prev => prev.filter((_, index) => index !== i));
                              }}
                            />
                          ) : (
                            <div className="w-full h-full rounded-lg border border-[rgba(249,248,252,0.05)]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Круговой прогресс */}
              <div className="flex flex-col items-center rounded-xl bg-[rgba(249,248,252,0.05)] p-6">
                <CircularProgress
                  percentage={calculateUpgradeSuccessPercentage()}
                  hasSelectedUpgradeItem={selectedUpgradeItem !== null}
                  isSpinning={isSpinning}
                  currentRotation={currentRotation}
                  animationDuration={animationDuration}
                  formatPercentage={formatPercentage}
                />
              </div>

              {/* Статистика */}
              <div className="flex gap-2">
                <div className="flex-1 flex items-center justify-center h-12 rounded-lg bg-[rgba(249,248,252,0.05)]">
                  <p className="text-[#F9F8FC] font-['Actay_Wide'] text-base font-bold opacity-30">
                    x{calculateRoundedPayback()}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center gap-1 h-12 rounded-lg bg-[rgba(17,171,71,0.10)]">
                  <span className="text-[#11AB47] font-['Actay_Wide'] text-base font-bold">
                    + {calculatePriceDifference()}
                  </span>
                  <span className="text-[#11AB47] font-['Actay_Wide'] text-sm font-bold">АР</span>
                </div>
              </div>

              {/* Целевой предмет */}
              <div className="flex flex-col rounded-xl bg-[rgba(249,248,252,0.05)] p-4">
                <p className="text-[#F9F8FC] font-['Actay_Wide'] text-base font-bold mb-3">Целевой предмет</p>
                {!selectedUpgradeItem ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-[#5C5B60] text-center font-['Actay_Wide'] text-sm">
                      Выберите предмет,<br/>который хотите получить
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-20 h-20 bg-center bg-cover bg-no-repeat rounded-lg"
                      style={{ backgroundImage: `url(${selectedUpgradeItem.imageUrl})` }}
                    />
                    <div className="flex-1">
                      <p className={`font-['Actay_Wide'] text-sm font-bold ${rarityTextColor(selectedUpgradeItem.rarity)}`}>
                        {selectedUpgradeItem.name}
                      </p>
                      <div className="mt-1">
                        <span className="text-[#F9F8FC] font-['Actay_Wide'] text-base font-bold">
                          {selectedUpgradeItem.price}
                        </span>
                        <span className="text-[rgba(249,248,252,0.50)] font-['Actay_Wide'] text-xs font-bold"> АР</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Кнопка апгрейда */}
              {(() => {
                const isDisabled = !selectedUpgradeItem || selectedItems.length === 0 || isSpinning || upgradeLoading;
                return (
                  <button
                    onClick={isDisabled ? undefined : handleUpgradeClick}
                    disabled={isDisabled}
                    className={`w-full py-4 rounded-lg font-['Actay_Wide'] text-base font-bold transition-all ${
                      isDisabled
                        ? 'bg-gray-500 text-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-[#5C5ADC] text-[#F9F8FC] active:scale-[0.98]'
                    }`}
                  >
                    {isSpinning || upgradeLoading ? 'Прокачиваем...' : 'Прокачать'}
                  </button>
                );
              })()}
            </div>
          )}

          {/* Вкладка "Инвентарь" */}
          {activeTab === 'inventory' && (
            <div className="flex flex-col gap-4">
              <InventoryItemsList
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                inventoryUpdateRef={inventoryUpdateFunctions}
                convertToCaseItem={convertToCaseItem}
                gridCols={2}
              />
            </div>
          )}

          {/* Вкладка "Цель" */}
          {activeTab === 'target' && (
            <div className="flex flex-col gap-4">
              {/* Фильтр минимальной цены */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(249,248,252,0.05)]">
                <span className="text-[#F9F8FC] font-['Actay_Wide'] text-sm font-bold">Минимальная цена</span>
                <div className="flex items-center gap-2">
                  <span className="text-[rgba(249,248,252,0.50)] font-['Actay_Wide'] text-sm">от</span>
                  <input
                    type="number"
                    value={minPrice}
                    disabled={selectedItems.length === 0}
                    onChange={(e) => {
                      setIsMinPriceManual(true);
                      const value = parseFloat(e.target.value);
                      const normalized = isNaN(value) ? 0 : value;
                      setMinPrice(Math.max(normalized, 0));
                    }}
                    onKeyDown={(e) => {
                      if (!/[0-9.,]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    min={0}
                    className={`w-16 bg-transparent font-['Actay_Wide'] text-sm font-bold text-center border-none outline-none ${
                      selectedItems.length === 0
                        ? 'text-[rgba(249,248,252,0.15)] cursor-not-allowed'
                        : 'text-[rgba(249,248,252,0.30)]'
                    }`}
                    style={{ appearance: 'textfield' }}
                  />
                  <span className="text-[rgba(249,248,252,0.50)] font-['Actay_Wide'] text-sm">АР</span>
                </div>
              </div>

              {/* Список предметов для апгрейда */}
              <CaseItemsList
                items={convertedUpgradeItems}
                loading={upgradeItemsLoading}
                error={upgradeItemsError}
                selectedUpgradeItem={selectedUpgradeItem}
                onItemSelect={handleUpgradeItemSelect}
                onItemRemove={handleUpgradeItemRemove}
                calculateTotalPrice={calculateTotalPrice}
                rtp={rtp}
                hasSelectedItems={selectedItems.length > 0}
                hasMore={upgradeItemsHasMore}
                onLoadMore={() => loadMoreUpgradeItems(minPrice)}
                gridCols={2}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Десктопная версия
  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex flex-col md:flex-row gap-2 w-full flex-1 min-h-0">
        <div className='flex flex-col justify-center items-center flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)] py-4 min-h-0 max-h-full overflow-visible'>
          {selectedItems.length === 0 ? (
            <p className='text-[#5C5B60] text-center font-["Actay_Wide"] text-base'>Выберите до 8 предметов<br/>для апгрейда</p>
          ) : (
            <div className="flex flex-col gap-2 w-full overflow-visible">
              {/* Новый макет 2x4 ячеек по ТЗ */}
              <div className="flex px-3 flex-col items-start gap-1 flex-1 self-stretch min-h-0 overflow-visible">
                {(() => {
                  const slots = Array.from({ length: 8 }, (_, i) => selectedItems[i] || null);
                  const rows = [slots.slice(0, 4), slots.slice(4, 8)];
                  return rows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex items-center gap-1 overflow-visible">
                      {row.map((slot, idx) => (
                        <div key={idx} style={{ width: '78px', height: '124.75px' }} className="overflow-visible">
                          {slot ? (
                            <ItemCard
                              item={convertToCaseItem(slot.inventoryItem)}
                              amount={slot.inventoryItem.item.amount}
                              orientation="vertical"
                              className="w-[78px] h-[124.75px]"
                              isSelected={true}
                              hideAmountInPieces={true}
                              upgradeMode={true}
                              onRemove={() => {
                                setSelectedItems(prev => {
                                  // Удаляем конкретный экземпляр предмета из этой позиции
                                  const slotIndex = rowIdx * 4 + idx;
                                  return prev.filter((_, index) => index !== slotIndex);
                                });
                              }}
                            />
                          ) : (
                            // Пустой прямоугольник
                            <div className="w-full h-full rounded-lg border border-[rgba(249,248,252,0.05)]" />
                          )}
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        <div className='flex p-2 flex-col justify-between items-center self-stretch rounded-xl bg-[rgba(249,248,252,0.05)] min-w-[200px]'>
          <div className='flex h-[180px] flex-col justify-between items-center'>
            <CircularProgress 
              percentage={calculateUpgradeSuccessPercentage()} 
              hasSelectedUpgradeItem={selectedUpgradeItem !== null}
              isSpinning={isSpinning}
              currentRotation={currentRotation}
              animationDuration={animationDuration}
              formatPercentage={formatPercentage}
            />
          </div>
          <div className='flex flex-col items-start gap-2 self-stretch'>
            <div className='flex items-start gap-2 self-stretch'>
              <div className='flex h-[36px] px-2 py-[6px] pb-[6px] justify-center items-center gap-2 flex-1 rounded-lg bg-[rgba(249,248,252,0.05)]'>
                <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold opacity-30 overflow-hidden text-ellipsis line-clamp-1' style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 }}>x{calculateRoundedPayback()}</p>
              </div>
              <div className='flex w-[140px] h-[36px] px-2 py-[6px] pb-[6px] justify-center items-center gap-2 rounded-lg bg-[rgba(17,171,71,0.10)]'>
                <span className='text-[#11AB47] font-["Actay_Wide"] text-base font-bold overflow-hidden text-ellipsis line-clamp-1' style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, textOverflow: 'ellipsis' }}>+ {calculatePriceDifference()}</span>
                <span className='overflow-hidden text-[#11AB47] font-["Actay_Wide"] text-sm font-bold leading-normal' style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, textOverflow: 'ellipsis' }}> АР</span>
              </div>
            </div>
            {(() => {
              const isDisabled = !selectedUpgradeItem || selectedItems.length === 0 || isSpinning || upgradeLoading;
              return (
                <div 
                  className={`flex px-4 py-[10px] flex-col justify-center items-center gap-2 self-stretch rounded-lg transition-all duration-200 ${
                    isDisabled
                      ? 'bg-gray-500 cursor-not-allowed opacity-60 pointer-events-none'
                      : 'bg-[#5C5ADC] cursor-pointer hover:bg-[#4A48C4] hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                  onClick={isDisabled ? undefined : handleUpgradeClick}
                >
                  <p className={`text-center font-['Actay_Wide'] text-base font-bold transition-colors ${
                    isDisabled
                      ? 'text-gray-400'
                      : 'text-[#F9F8FC]'
                  }`}>
                    {isSpinning || upgradeLoading ? 'Прокачиваем...' : 'Прокачать'}
                  </p>
                </div>
              );
            })()}


          </div>
        </div>
        
        <div className='flex pt-3 flex-col justify-between items-center flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)] min-h-0'>
          {!selectedUpgradeItem ? (
            <div className='flex flex-col items-center justify-center h-full'>
              <p className='text-[#5C5B60] text-center font-["Actay_Wide"] text-base font-bold'>Выберите предмет,<br/>который хотите получить</p>
            </div>
          ) : (
            <>
              <p className='text-[#5C5B60] text-center font-["Actay_Wide"] text-base font-bold'>Предмет, <br/>который хотите получить</p>
              <div className='flex w-[160px] h-[160px] flex-col justify-end items-end aspect-square bg-center bg-cover bg-no-repeat' style={{ backgroundImage: `url(${selectedUpgradeItem.imageUrl})` }}>
                <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-2xl font-bold opacity-30'>x{selectedUpgradeItem.amount}</p>
              </div>
              <div className='flex py-3 px-4 justify-between items-center self-stretch border-t border-[rgba(249,248,252,0.05)]'>
                <p className={`text-center font-["Actay_Wide"] text-base font-bold ${rarityTextColor(selectedUpgradeItem.rarity)}`}>{selectedUpgradeItem.name}</p>
                <div>
                  <span className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold'>{selectedUpgradeItem.price}</span>
                  <span className='text-[rgba(249,248,252,0.50)] font-["Actay_Wide"] text-xs font-bold'> АР</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className='flex items-stretch gap-2 self-stretch min-h-0' style={{ height: `${BOTTOM_SECTION_HEIGHT}px` }}>
        <div className='flex box-border h-full flex-col items-center gap-3 flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)] min-h-0 overflow-hidden'>
          <div className='flex h-[52px] px-4 justify-between items-center self-stretch border-b border-[rgba(249,248,252,0.05)]'>
             <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold'>Мои предметы</p>
             <div className='flex items-center gap-[6px]'>
               <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold opacity-30'>по цене</p>
               <div className='flex w-[6.588px] flex-col items-start gap-[2px]'>
                 <svg xmlns="http://www.w3.org/2000/svg" width="6" height="5" viewBox="0 0 6 5" fill="none">
                   <path opacity="0.1" d="M2.91522 0.5C3.07248 0.500018 3.23021 0.545562 3.35826 0.63625C3.44654 0.694976 3.58912 0.829867 3.58912 0.829867C4.14182 1.30731 4.97411 2.49454 5.24143 3.09687C5.24702 3.09687 5.40581 3.45471 5.41211 3.62513V3.64808C5.41206 3.90905 5.25341 4.15316 4.99864 4.27818C4.85876 4.34679 4.45184 4.40909 4.44562 4.4149C4.08131 4.46606 3.5225 4.5 2.909 4.5C2.26502 4.5 1.68183 4.4662 1.32309 4.40343C1.31687 4.40343 0.988952 4.34124 0.87953 4.30112C0.72162 4.23891 0.588068 4.1246 0.502896 3.98273C0.442007 3.86938 0.412109 3.74952 0.412109 3.62513C0.417765 3.49432 0.508862 3.25031 0.551142 3.15376C0.818479 2.51707 1.69368 1.30134 2.22836 0.835604C2.31337 0.756099 2.41606 0.670575 2.44054 0.647723C2.57421 0.551203 2.73866 0.5 2.91522 0.5Z" fill="#F9F8FC"/>
                 </svg>
                 <svg xmlns="http://www.w3.org/2000/svg" width="6" height="5" viewBox="0 0 6 5" fill="none">
                   <path opacity="0.3" d="M2.91522 4.5C3.07248 4.49998 3.23021 4.45444 3.35826 4.36375C3.44654 4.30502 3.58912 4.17013 3.58912 4.17013C4.14182 3.69269 4.97411 2.50546 5.24143 1.90313C5.24702 1.90313 5.40581 1.54529 5.41211 1.37487V1.35192C5.41206 1.09095 5.25341 0.846838 4.99864 0.721824C4.85876 0.653213 4.45184 0.590911 4.44562 0.585096C4.08131 0.533944 3.5225 0.500003 2.909 0.5C2.26502 0.5 1.68183 0.533795 1.32309 0.59657C1.31687 0.59657 0.988952 0.658756 0.87953 0.698876C0.72162 0.761092 0.588068 0.875401 0.502896 1.01727C0.442007 1.13062 0.412109 1.25048 0.412109 1.37487C0.417765 1.50568 0.508862 1.74969 0.551142 1.84624C0.818479 2.48293 1.69368 3.69866 2.22836 4.1644C2.31337 4.2439 2.41606 4.32943 2.44054 4.35228C2.57421 4.4488 2.73866 4.5 2.91522 4.5Z" fill="#F9F8FC"/>
                 </svg>
               </div>
             </div>
           </div>
           <InventoryItemsList 
             selectedItems={selectedItems} 
             onItemSelect={handleItemSelect}
             inventoryUpdateRef={inventoryUpdateFunctions}
             convertToCaseItem={convertToCaseItem}
           />
         </div>
        <div className='flex box-border h-full flex-col items-center gap-3 flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)] min-h-0 overflow-hidden'>
          <div className='flex h-[52px] px-4 justify-between items-center self-stretch border-b border-[rgba(249,248,252,0.05)]'>
             <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold'>Выберите предмет</p>
             <div className='flex px-2 justify-center items-center gap-[10px] border-b border-[rgba(249,248,252,0.30)]'>
               <span className='text-[rgba(249,248,252,0.50)] text-center font-["Actay_Wide"] text-base font-bold'>от</span>
               <input
                  type='number'
                  value={minPrice}
                  disabled={selectedItems.length === 0}
                  onChange={(e) => {
                    setIsMinPriceManual(true);
                    const value = parseFloat(e.target.value);
                    const normalized = isNaN(value) ? 0 : value;
                    setMinPrice(Math.max(normalized, 0));
                  }}
                  onKeyDown={(e) => {
                    // Разрешаем только цифры, точку, запятую, backspace, delete, tab, enter, стрелки
                    if (!/[0-9.,]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  min={0}
                  className={`w-16 bg-transparent font-["Actay_Wide"] text-base font-bold text-center border-none outline-none ${
                    selectedItems.length === 0 
                      ? 'text-[rgba(249,248,252,0.15)] cursor-not-allowed' 
                      : 'text-[rgba(249,248,252,0.30)]'
                  }`}
                  style={{ appearance: 'textfield' }}
                />
               <span className='text-[rgba(249,248,252,0.50)] text-center font-["Actay_Wide"] text-base font-bold'>АР</span>
             </div>
           </div>
           <CaseItemsList 
             items={convertedUpgradeItems} 
             loading={upgradeItemsLoading}
             error={upgradeItemsError}
             selectedUpgradeItem={selectedUpgradeItem}
             onItemSelect={handleUpgradeItemSelect}
             onItemRemove={handleUpgradeItemRemove}
             calculateTotalPrice={calculateTotalPrice}
             rtp={rtp}
             hasSelectedItems={selectedItems.length > 0}
             hasMore={upgradeItemsHasMore}
             onLoadMore={() => loadMoreUpgradeItems(minPrice)}
           />
         </div>
       </div>
    </div>
   );
 }
 // EOF