'use client';

import React, { useState, useCallback } from 'react';
import { useInventoryAPI, InventoryItem } from '@/hooks/useInventoryAPI';
import { ItemCard } from '@/components/ui/RarityCard';
import { CaseItem } from '@/hooks/useCasesAPI';
import useUpgradeAPI from '@/hooks/useUpgradeAPI';

// Константа процента
const UPGRADE_PERCENTAGE = 15;

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
}

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

const CircularProgress = ({ percentage }: CircularProgressProps) => {
  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

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
          className="fill-[#232328]"
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
             {percentage}%
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
  selectedUpgradeItem, 
  onItemSelect, 
  onItemRemove 
}: { 
  items: CaseItem[], 
  loading: boolean,
  selectedUpgradeItem: CaseItem | null,
  onItemSelect: (item: CaseItem) => void,
  onItemRemove: () => void
}) {
  // Сортируем предметы по цене (по возрастанию для правого блока)
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => a.price - b.price);
  }, [items]);

  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='w-6 h-6 border-2 border-[#F9F8FC]/20 border-t-[#F9F8FC] rounded-full animate-spin'></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <p className='text-[#F9F8FC] opacity-50 text-center'>Нет доступных предметов</p>
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
        <div className='grid grid-cols-3 gap-2'>
          {sortedItems.map((item, index) => (
            <ItemCard
              key={`${item.id}-${index}`}
              item={item}
              amount={Math.round(item.percentChance * 100) / 100} // Используем процент вместо количества
              fullWidth={true}
              hoverIcon='plus'
              onClick={() => {
                if (!selectedUpgradeItem) {
                  onItemSelect(item);
                }
              }}
              showPercentage={true}
              isSelected={selectedUpgradeItem?.id === item.id}
              onRemove={selectedUpgradeItem?.id === item.id ? onItemRemove : undefined}
            />
          ))}
        </div>
      </div>
    </div>
   );
}

// Компонент для отображения списка предметов инвентаря
function InventoryItemsList({ selectedItems, onItemSelect }: { selectedItems: SelectedItem[], onItemSelect: (item: InventoryItem) => void }) {
  const { items, loading, error } = useInventoryAPI();

  // Сортируем предметы по цене (по убыванию)
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => b.item.price - a.item.price);
  }, [items]);

  // Преобразуем InventoryItem в CaseItem для совместимости с ItemCard
  const convertToCaseItem = (inventoryItem: InventoryItem): CaseItem => {
    return {
      id: inventoryItem.item.id,
      name: inventoryItem.item.name,
      description: inventoryItem.item.description || '',
      imageUrl: inventoryItem.item.imageUrl,
      amount: inventoryItem.item.amount,
      price: inventoryItem.item.price,
      percentChance: inventoryItem.item.percentChance,
      rarity: inventoryItem.item.rarity,
      isWithdrawable: inventoryItem.item.isWithdrawable
    };
  };

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
      <div className='flex px-4 flex-col items-center justify-center gap-2 flex-1 self-stretch'>
        <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-sm opacity-50'>Инвентарь пуст</p>
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
        <div className="grid grid-cols-3 auto-rows-[76px] gap-3">
          {sortedItems.map((inventoryItem) => {
            const selectedItem = selectedItems.find(selected => selected.inventoryItem.item.id === inventoryItem.item.id);
            const availableAmount = inventoryItem.amount - (selectedItem?.selectedAmount || 0);
            
            return (
              <div key={inventoryItem.item.id} className="relative group">
                <ItemCard
                  item={convertToCaseItem(inventoryItem)}
                  amount={availableAmount}
                  orientation="horizontal"
                  className="hover:brightness-110 transition-all"
                  fullWidth
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
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [minPrice, setMinPrice] = useState<number>(10);
  const [upgradeItems, setUpgradeItems] = useState<CaseItem[]>([]);
  const [loadingUpgradeItems, setLoadingUpgradeItems] = useState<boolean>(false);
  const [selectedUpgradeItem, setSelectedUpgradeItem] = useState<CaseItem | null>(null);

  // Получаем RTP коэффициент из API
  const { rtp, loading: rtpLoading, error: rtpError } = useUpgradeAPI();

  // Функция для расчета общей суммы выбранных предметов
  const calculateTotalPrice = useCallback(() => {
    return selectedItems.reduce((total, item) => {
      return total + (item.inventoryItem.item.price * item.selectedAmount);
    }, 0);
  }, [selectedItems]);

  // Функция для расчета процента успешного апгрейда
  const calculateUpgradeSuccessPercentage = useCallback(() => {
    const totalUserItemsPrice = calculateTotalPrice();
    const upgradeItemPrice = selectedUpgradeItem?.price || 0;
    
    if (upgradeItemPrice === 0 || rtp === 0) {
      return 0;
    }
    
    return (totalUserItemsPrice / upgradeItemPrice) * rtp;
  }, [calculateTotalPrice, selectedUpgradeItem?.price, rtp]);

  // Функция для расчета округленного окупа (x9 формат)
  const calculateRoundedPayback = useCallback(() => {
    const totalUserItemsPrice = calculateTotalPrice();
    const upgradeItemPrice = selectedUpgradeItem?.price || 0;
    
    if (totalUserItemsPrice === 0) {
      return 0;
    }
    
    return Math.round(upgradeItemPrice / totalUserItemsPrice);
  }, [calculateTotalPrice, selectedUpgradeItem?.price]);

  // Функция для расчета точного значения окупа
  const calculateExactPayback = useCallback(() => {
    const totalUserItemsPrice = calculateTotalPrice();
    const upgradeItemPrice = selectedUpgradeItem?.price || 0;
    
    if (totalUserItemsPrice === 0) {
      return 0;
    }
    
    return Math.round(upgradeItemPrice - totalUserItemsPrice);
  }, [calculateTotalPrice, selectedUpgradeItem?.price]);

  // Обработчик выбора предмета для апгрейда
  const handleUpgradeItemSelect = (item: CaseItem) => {
    if (!selectedUpgradeItem) {
      setSelectedUpgradeItem(item);
    }
  };

  // Обработчик удаления предмета из апгрейда
  const handleUpgradeItemRemove = () => {
    setSelectedUpgradeItem(null);
  };

  // Функция для загрузки предметов по API
  const fetchUpgradeItems = async (price: number) => {
    setLoadingUpgradeItems(true);
    try {
      const response = await fetch(`https://battle-api.chasman.engineer/api/v1/upgrade/items?minPrice=${price}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI2ODhjYWQ2YWJlNjU0MWU5ZTgzMWFiZTciLCJwZXJtaXNzaW9uIjoiT3duZXIiLCJuYmYiOjE3NTQzMjU0OTEsImV4cCI6MTc1NDMyOTA5MSwiaWF0IjoxNzU0MzI1NDkxLCJpc3MiOiJtci5yYWZhZWxsbyJ9.kjvs3RdU4ettjsnNjTEQH8VDxXQdETcUX6B7HdB08k4'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Преобразуем данные в формат CaseItem
        const items: CaseItem[] = data.map((item: { id: string; name: string; description?: string; imageUrl: string; amount: number; price: number; percentChance?: number; rarity: string; isWithdrawable: boolean }) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          imageUrl: item.imageUrl,
          amount: item.amount,
          price: item.price,
          percentChance: item.percentChance || 0,
          rarity: item.rarity,
          isWithdrawable: item.isWithdrawable
        }));
        setUpgradeItems(items);
      } else {
        console.error('Ошибка загрузки предметов:', response.statusText);
      }
    } catch (error) {
      console.error('Ошибка при запросе к API:', error);
    } finally {
      setLoadingUpgradeItems(false);
    }
  };

  // Обновляем минимальную цену при изменении выбранных предметов
  React.useEffect(() => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice > minPrice) {
      setMinPrice(totalPrice);
    }
  }, [selectedItems, calculateTotalPrice, minPrice]);

  // Загружаем предметы при изменении минимальной цены
  React.useEffect(() => {
    fetchUpgradeItems(minPrice);
  }, [minPrice]);

  const handleItemSelect = (inventoryItem: InventoryItem) => {
    if (selectedItems.length >= MAX_UPGRADE_ITEMS) {
      return; // Максимум 8 предметов
    }

    setSelectedItems(prev => {
      const existingItem = prev.find(item => item.inventoryItem.item.id === inventoryItem.item.id);
      
      if (existingItem) {
        // Увеличиваем количество выбранного предмета
        if (existingItem.selectedAmount < inventoryItem.amount) {
          return prev.map(item => 
            item.inventoryItem.item.id === inventoryItem.item.id 
              ? { ...item, selectedAmount: item.selectedAmount + 1 }
              : item
          );
        }
        return prev;
      } else {
        // Добавляем новый предмет
        return [...prev, { inventoryItem, selectedAmount: 1 }];
      }
    });
  };

  return (
    <div className="h-[calc(100vh-85px-1rem)] flex flex-col items-stretch gap-2 self-stretch overflow-hidden py-2">
      <div className='flex justify-center items-stretch gap-2 self-stretch min-h-0 h-[300px]'>
        <div className='flex flex-col justify-center items-center flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)] p-4 min-h-0 max-h-full overflow-hidden'>
          {selectedItems.length === 0 ? (
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base opacity-50'>Выберите до 8 предметов<br/>для апгрейда</p>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-sm opacity-70 mb-2'>Выбрано предметов: {selectedItems.length}/{MAX_UPGRADE_ITEMS}</p>
              <div className="grid grid-cols-2 gap-2 flex-1 overflow-hidden">
                {selectedItems.map((selectedItem, index) => (
                  <div key={`${selectedItem.inventoryItem.item.id}-${index}`} className="flex items-center gap-2 p-2 bg-[rgba(249,248,252,0.05)] rounded-lg">
                    <div 
                      className="w-12 h-12 bg-center bg-cover bg-no-repeat rounded flex-shrink-0" 
                      style={{ backgroundImage: `url(${selectedItem.inventoryItem.item.imageUrl})` }} 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F9F8FC] font-['Actay_Wide'] text-xs font-bold truncate">{selectedItem.inventoryItem.item.name}</p>
                      <p className="text-[#F9F8FC] font-['Actay_Wide'] text-xs opacity-50">x{selectedItem.selectedAmount}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedItems(prev => {
                          const updated = prev.map(item => 
                            item.inventoryItem.item.id === selectedItem.inventoryItem.item.id 
                              ? { ...item, selectedAmount: item.selectedAmount - 1 }
                              : item
                          ).filter(item => item.selectedAmount > 0);
                          return updated;
                        });
                      }}
                      className="w-6 h-6 bg-red-500/20 hover:bg-red-500/40 rounded flex items-center justify-center transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L9 3M3 3L9 9" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='flex p-2 flex-col justify-between items-center self-stretch rounded-xl bg-[rgba(249,248,252,0.05)] min-w-[200px]'>
          <div className='flex h-[180px] flex-col justify-between items-center'>
            <CircularProgress percentage={calculateUpgradeSuccessPercentage()} />
          </div>
          <div className='flex flex-col items-start gap-2 self-stretch'>
            <div className='flex items-start gap-2 self-stretch'>
              <div className='flex h-[36px] px-2 py-[6px] pb-[6px] justify-center items-center gap-2 flex-1 rounded-lg bg-[rgba(249,248,252,0.05)]'>
                <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold opacity-30 overflow-hidden text-ellipsis line-clamp-1' style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 }}>x{calculateRoundedPayback()}</p>
              </div>
              <div className='flex w-[104px] h-[36px] px-2 py-[6px] pb-[6px] justify-center items-center gap-2 rounded-lg bg-[rgba(17,171,71,0.10)]'>
                <span className='text-[#11AB47] font-["Actay_Wide"] text-base font-bold overflow-hidden text-ellipsis line-clamp-1' style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, textOverflow: 'ellipsis' }}>+ {calculateExactPayback()}</span>
                <span className='overflow-hidden text-[#11AB47] font-["Actay_Wide"] text-sm font-bold leading-normal' style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, textOverflow: 'ellipsis' }}> АР</span>
              </div>
            </div>
            <div className='flex px-4 py-[10px] flex-col justify-center items-center gap-2 self-stretch rounded-lg bg-[#5C5ADC]'>
              <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold'>Прокачать</p>
            </div>
          </div>
        </div>
        
        <div className='flex pt-3 flex-col justify-between items-center flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)] min-h-0'>
          <p className='text-white text-center font-["Actay_Wide"] text-base font-bold opacity-30'>Передмет, <br/>который хотите получить</p>
          <div className='flex w-[160px] h-[160px] flex-col justify-end items-end aspect-square bg-[url(https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/netherite_ingot/icon)] bg-lightgray bg-center bg-cover bg-no-repeat'>
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-2xl font-bold opacity-30'>x1</p>
          </div>
          <div className='flex px-4 py-3 justify-between items-center self-stretch border-t border-[rgba(249,248,252,0.05)]'>
            <p className='text-[#EDD51D] text-center font-["Actay_Wide"] text-base font-bold'>Незеритовый слиток</p>
            <div>
              <span className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold'>999</span>
              <span className='text-[rgba(249,248,252,0.50)] font-["Actay_Wide"] text-xs font-bold'> АР</span>
            </div>
          </div>
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
           <InventoryItemsList selectedItems={selectedItems} onItemSelect={handleItemSelect} />
         </div>
        <div className='flex box-border h-full flex-col items-center gap-3 flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)] min-h-0 overflow-hidden'>
          <div className='flex h-[52px] px-4 justify-between items-center self-stretch border-b border-[rgba(249,248,252,0.05)]'>
             <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold'>Выберите предмет</p>
             <div className='flex px-2 justify-center items-center gap-[10px] border-b border-[rgba(249,248,252,0.30)]'>
               <span className='text-[rgba(249,248,252,0.50)] text-center font-["Actay_Wide"] text-base font-bold'>от</span>
               <input
                 type=''
                 value={minPrice}
                 onChange={(e) => {
                   const value = parseFloat(e.target.value) || 0;
                   const totalPrice = calculateTotalPrice();
                   if (value >= totalPrice) {
                     setMinPrice(value);
                   }
                 }}
                 onKeyDown={(e) => {
                   // Разрешаем только цифры, точку, запятую, backspace, delete, tab, enter, стрелки
                   if (!/[0-9.,]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                     e.preventDefault();
                   }
                 }}
                 min={calculateTotalPrice()}
                 className='w-16 bg-transparent text-[rgba(249,248,252,0.30)] font-["Actay_Wide"] text-base font-bold text-center border-none outline-none'
                 style={{ appearance: 'textfield' }}
               />
               <span className='text-[rgba(249,248,252,0.50)] text-center font-["Actay_Wide"] text-base font-bold'>АР</span>
             </div>
           </div>
           <CaseItemsList 
             items={upgradeItems} 
             loading={loadingUpgradeItems}
             selectedUpgradeItem={selectedUpgradeItem}
             onItemSelect={handleUpgradeItemSelect}
             onItemRemove={handleUpgradeItemRemove}
           />
         </div>
       </div>
     </div>
   );
 }
 // EOF