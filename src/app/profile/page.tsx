'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';
import { useRouter } from 'next/navigation';
// Убран импорт Image из next/image - заменен на обычные img теги
import { motion } from 'framer-motion';
import { useInventoryAPI, InventoryItem } from '@/hooks/useInventoryAPI';
import { useUserBodyAvatar } from '@/hooks/useUserAvatar';
import InventoryItemCard from '@/components/ui/InventoryItemCard';
import InventoryModal from '@/components/ui/InventoryModal';
import ItemDescriptionModal from '@/components/ui/ItemDescriptionModal';
import DeliveryTab from '@/components/ui/DeliveryTab';
import FreeCasesTab from '@/components/ui/FreeCasesTab';
import { CaseItem } from '@/hooks/useCasesAPI';
import { PrivilegedUserCheck } from '@/components/ui/PrivilegedUserCheck';

export default function ProfilePage() {
  const { user, isAuthenticated } = usePreloadedData();
  const router = useRouter();
  const { items: inventoryItems, loading, error, hasMore, loadMore, softRefresh } = useInventoryAPI();
  const observerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  
  // Состояние для модалки инвентаря
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [inventoryModalTab, setInventoryModalTab] = useState<'sell' | 'withdraw'>('sell');
  
  // Состояние для модалки описания предмета
  const [isItemDescriptionModalOpen, setIsItemDescriptionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CaseItem | null>(null);
  
  // Состояние для активной вкладки
  const [activeTab, setActiveTab] = useState<'inventory' | 'deliveries' | 'freeCases' | 'settings'>('inventory');
  const [hypedPhrases, setHypedPhrases] = useState(false);
  
  // Состояние для sticky поведения
  const [isSticky, setIsSticky] = useState(false);
  const stickyThreshold = useRef(0);
  
  // Инициализация порога для sticky поведения
  useEffect(() => {
    if (tabsRef.current) {
      const rect = tabsRef.current.getBoundingClientRect();
      stickyThreshold.current = window.scrollY + rect.top - 90; // 90px - отступ от хедера
    }
  }, []);
  
  // Упрощенная логика sticky поведения только с Intersection Observer
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    
    // Создаем Intersection Observer для отслеживания sticky состояния
    if (tabsRef.current) {
      // Проверяем начальное состояние панели с небольшой задержкой
      setTimeout(() => {
        if (tabsRef.current) {
          const initialTop = tabsRef.current.getBoundingClientRect().top;
          const initialShouldBeSticky = initialTop <= 90;
          setIsSticky(initialShouldBeSticky);
        }
      }, 100);
      
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            // Панель становится sticky когда её верх поднимается выше 90px от верха viewport
            const shouldBeSticky = entry.boundingClientRect.top <= 90;
            setIsSticky(shouldBeSticky);
          }
        },
        {
          threshold: [0, 1]
        }
      );
      
      observer.observe(tabsRef.current);
    }
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);
  
  // Данные пользователя
  const userName = user?.nickname ?? (isAuthenticated ? 'Загрузка...' : 'Гость');
  const userLevel = typeof user?.level === 'object' ? user.level.level : (user?.level ?? 1);
  const userCurrentXp = typeof user?.level === 'object' ? user.level.currentXp : 0;
  const userXpToNext = typeof user?.level === 'object' ? user.level.xpToNextLevel : 0;
  const userProgress = typeof user?.level === 'object' ? user.level.progressPercent : 0;
  
  // Получаем URL аватара тела через хук
  const userAvatar = useUserBodyAvatar(userName === 'Загрузка...' || userName === 'Гость' ? null : userName);

  // Обработчики для модалки инвентаря
  const handleSellClick = useCallback((item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setInventoryModalTab('sell');
    setIsInventoryModalOpen(true);
  }, []);

  const handleWithdrawClick = useCallback((item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setInventoryModalTab('withdraw');
    setIsInventoryModalOpen(true);
  }, []);

  const handleCloseInventoryModal = useCallback(() => {
    setIsInventoryModalOpen(false);
    setSelectedInventoryItem(null);
  }, []);

  // Функции для управления модальным окном описания предмета
  const handleOpenItemDescriptionModal = useCallback((inventoryItem: InventoryItem) => {
    // Преобразуем InventoryItem в CaseItem для совместимости с модальным окном
    const caseItem: CaseItem = {
      id: inventoryItem.item.id,
      name: inventoryItem.item.name,
      description: inventoryItem.item.description,
      imageUrl: inventoryItem.item.imageUrl,
      amount: inventoryItem.item.amount,
      price: inventoryItem.item.price,
      percentChance: inventoryItem.item.percentChance,
      rarity: inventoryItem.item.rarity,
      isWithdrawable: inventoryItem.item.isWithdrawable
    };
    setSelectedItem(caseItem);
    setIsItemDescriptionModalOpen(true);
  }, []);

  const handleCloseItemDescriptionModal = useCallback(() => {
    setIsItemDescriptionModalOpen(false);
    // Не сбрасываем selectedItem в null сразу, чтобы анимация закрытия работала корректно
  }, []);



  // Сбрасываем selectedItem с задержкой после закрытия модального окна
  useEffect(() => {
    if (!isItemDescriptionModalOpen && selectedItem) {
      const timer = setTimeout(() => {
        setSelectedItem(null);
      }, 300); // Задержка соответствует длительности анимации закрытия
      
      return () => clearTimeout(timer);
    }
  }, [isItemDescriptionModalOpen, selectedItem]);

  // Функция для обработки успешной продажи
  const handleSellSuccess = useCallback(() => {
    softRefresh(); // Мягко обновляем инвентарь без сброса позиции
  }, [softRefresh]);

  // Функция для обработки пересечения с наблюдателем
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  // Настройка Intersection Observer для бесконечной прокрутки
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    const currentElement = observerRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [handleIntersection]);



  return (
    <div className="w-full max-w-6xl mx-auto pt-2 flex flex-col items-start gap-2 self-stretch">
      <div className="flex w-full h-[42px] items-center justify-between">
        <button 
          onClick={() => {
            router.back();
          }}
          className="flex items-center gap-4 cursor-pointer"
        >
          <motion.div 
            className="flex w-[42px] h-[42px] flex-col justify-center items-center gap-[10px] flex-shrink-0 rounded-[8px] bg-[#F9F8FC]/[0.05]"
            whileHover={{ backgroundColor: "rgba(249, 248, 252, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <img 
              src="/Arrow - Left.svg" 
              alt="Назад" 
              width={18} 
              height={12} 
              className="w-[18px] h-[12px]"
            />
          </motion.div>
          <p className='text-[#F9F8FC] font-unbounded text-2xl font-medium'>Профиль</p>
        </button>
      </div>
      
      {/* Блок профиля */}
      <div className='flex h-[202px] p-4 items-start gap-4 self-stretch rounded-xl bg-[#F9F8FC]/[0.05]'>
        <div className='flex w-[170px] h-[170px] aspect-[1/1] rounded-lg bg-[#5C5ADC] relative overflow-hidden'>
          <>
            <img
              src={userAvatar}
              alt="Avatar"
              className="absolute w-[154px] h-[154px] aspect-square ml-[7px] mt-4"
            />
            <img 
              src="/background.png"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </>
        </div>
        <div className='flex flex-col justify-center items-start gap-6 flex-1 self-stretch'>
          <div className='flex flex-col items-start gap-1 self-stretch'>
            <p className='self-stretch text-[#F9F8FC] font-unbounded text-[32px] font-medium'>{userName}</p>
            <div className='text-[#F9F8FC] font-actay-wide text-base font-bold opacity-50 flex items-center gap-1'>
              <span>{userCurrentXp.toFixed(1)}</span>
              <span>/</span>
              <span>{userCurrentXp + userXpToNext}</span>
              <span>XP</span>
            </div>
          </div>
          <div className='flex flex-col justify-center items-start gap-2 self-stretch'>
            <div className='flex justify-between items-center self-stretch'>
              <p className='text-[#F9F8FC] font-unbounded text-base font-semibold'>lvl {userLevel}</p>
              <p className='text-[#F9F8FC] font-unbounded text-base font-semibold opacity-50'>lvl {userLevel + 1}</p>
            </div>
            <div className='flex h-[18px] pr-2 items-center gap-[10px] self-stretch rounded-[100px] bg-[#0D0D11]'>
              <div 
                className="self-stretch rounded-[100px] bg-gradient-to-r from-[#313076] to-[#5C5ADC] shadow-[inset_0_4px_25.8px_0_rgba(249,248,252,0.10)]"
                style={{ width: `${Math.max(0, Math.min(100, userProgress))}%`, minWidth: '8px' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div 
         ref={tabsRef}
         className={`flex p-2 items-start gap-1 self-stretch rounded-xl ${
           isSticky 
             ? 'sticky top-[90px] z-50 bg-[#18181D]' 
             : 'bg-[#18181D]'
         }`}
       >
        <motion.button 
          onClick={() => setActiveTab('inventory')}
          className={`flex px-[12px] py-[8px] pr-2 items-center gap-2 rounded-lg cursor-pointer transition-all duration-300 ease-out ${
            activeTab === 'inventory' ? 'bg-[#232329]' : 'bg-transparent'
          } ${activeTab === 'inventory' ? '' : 'hover:bg-[#232329]'}`}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className={`flex w-[30px] h-[30px] flex-col justify-center items-center gap-[10px] aspect-square rounded-[4px] transition-all duration-300 ease-out ${
            activeTab === 'inventory' ? 'bg-[#5C5ADC]' : 'bg-[#F9F8FC]/[0.05]'
          }`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g opacity={activeTab === 'inventory' ? '1' : '0.3'}>
                <path fillRule="evenodd" clipRule="evenodd" d="M5.93217 2.38905C5.93217 1.72162 6.41662 1.17919 7.01147 1.17919H8.98881C9.58366 1.17919 10.0681 1.72162 10.0681 2.38905V2.40791C9.43701 2.34738 8.74988 2.31751 8.00014 2.31751C7.24957 2.31751 6.56244 2.34738 5.93217 2.40791V2.38905ZM0.178098 7.04214C2.32764 8.30624 5.11239 9.00354 8.01662 9.0059C10.9151 9.00354 13.6924 8.3086 15.8403 7.05001C15.4053 4.48487 14.0335 3.12015 11.3039 2.58951V2.38905C11.3039 1.07149 10.265 0 8.98881 0H7.01147C5.73526 0 4.69633 1.07149 4.69633 2.38905V2.58951C1.97089 3.11936 0.599932 4.48015 0.161621 7.03586C0.167388 7.039 0.173155 7.039 0.178098 7.04214Z" fill={activeTab === 'inventory' ? '#F9F8FC' : '#F9F8FC'}/>
                <path fillRule="evenodd" clipRule="evenodd" d="M8.61792 10.2149V11.9153C8.61792 12.2407 8.34109 12.5049 8 12.5049C7.65891 12.5049 7.38208 12.2407 7.38208 11.9153V10.2141C4.69537 10.1284 2.12647 9.48849 0.0197734 8.38083C0.00741504 8.63161 0 8.88946 0 9.15832C0 14.21 2.09351 16 8 16C13.9065 16 16 14.21 16 9.15832C16 8.89575 15.9934 8.6434 15.9819 8.39892C13.8719 9.50028 11.303 10.1339 8.61792 10.2149Z" fill={activeTab === 'inventory' ? '#F9F8FC' : '#F9F8FC'}/>
              </g>
            </svg>
          </div>
          <p className={`font-actay-wide text-base font-bold ${
            activeTab === 'inventory' ? 'text-[#F9F8FC]' : 'text-[#F9F8FC] opacity-50'
          }`}>
            Инвентарь
          </p>
        </motion.button>
        <motion.button 
          onClick={() => setActiveTab('deliveries')}
          className={`flex px-[12px] py-[8px] pr-2 items-center gap-2 rounded-lg cursor-pointer transition-all duration-300 ease-out ${
            activeTab === 'deliveries' ? 'bg-[#232329]' : 'bg-transparent'
          } ${activeTab === 'deliveries' ? '' : 'hover:bg-[#232329]'}`}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className={`flex w-[30px] h-[30px] flex-col justify-center items-center gap-[10px] aspect-square rounded-[4px] transition-all duration-300 ease-out ${
            activeTab === 'deliveries' ? 'bg-[#5C5ADC]' : 'bg-[#F9F8FC]/[0.05]'
          }`}>
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g opacity={activeTab === 'deliveries' ? '1' : '0.3'}>
                <path d="M10.9325 4.4474C11.4603 4.453 12.1932 4.4554 12.8155 4.453C13.1343 4.4522 13.2963 4.0498 13.076 3.8074C12.2764 2.929 10.8462 1.357 10.027 0.457802C9.80061 0.209002 9.40539 0.380202 9.40539 0.725002V2.8338C9.40539 3.7186 10.0951 4.4474 10.9325 4.4474Z" fill={activeTab === 'deliveries' ? '#F9F8FC' : '#F9F8FC'}/>
                <path fillRule="evenodd" clipRule="evenodd" d="M9.28276 8.712C9.06319 8.944 8.70734 8.944 8.48777 8.712L7.28393 7.432V11.296C7.28393 11.624 7.03407 11.888 6.72365 11.888C6.40565 11.888 6.1558 11.624 6.1558 11.296V7.432L4.95195 8.712C4.73238 8.944 4.37653 8.944 4.15696 8.712C3.93739 8.48 3.93739 8.104 4.15696 7.872L6.32236 5.568C6.37536 5.512 6.43594 5.472 6.50408 5.44C6.57222 5.408 6.64793 5.392 6.72365 5.392C6.79936 5.392 6.8675 5.408 6.93564 5.44C7.00379 5.472 7.06436 5.512 7.11736 5.568L9.29033 7.872C9.5099 8.104 9.5099 8.48 9.28276 8.712ZM13.1517 5.616C12.8261 5.616 12.44 5.624 12.2053 5.624C11.857 5.624 11.4027 5.616 10.8349 5.616C9.44176 5.608 8.30606 4.408 8.30606 2.944V0.368C8.30606 0.168 8.14706 0 7.95778 0H3.91468C2.02184 0 0.5 1.624 0.5 3.608V12.232C0.5 14.312 2.09755 16 4.07368 16H10.0929C11.9706 16 13.5 14.392 13.5 12.408V5.976C13.5 5.776 13.341 5.616 13.1517 5.616Z" fill={activeTab === 'deliveries' ? '#F9F8FC' : '#F9F8FC'}/>
              </g>
            </svg>
          </div>
          <p className={`font-actay-wide text-base font-bold ${
            activeTab === 'deliveries' ? 'text-[#F9F8FC]' : 'text-[#F9F8FC] opacity-50'
          }`}>
            Доставки
          </p>
        </motion.button>
        <motion.button 
          onClick={() => setActiveTab('freeCases')}
          className={`flex px-[12px] py-[8px] pr-2 items-center gap-2 rounded-lg cursor-pointer transition-all duration-300 ease-out ${
            activeTab === 'freeCases' ? 'bg-[#232329]' : 'bg-transparent'
          } ${activeTab === 'freeCases' ? '' : 'hover:bg-[#232329]'}`}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className={`flex w-[30px] h-[30px] flex-col justify-center items-center gap-[10px] aspect-square rounded-[4px] transition-all duration-300 ease-out ${
            activeTab === 'freeCases' ? 'bg-[#5C5ADC]' : 'bg-[#F9F8FC]/[0.05]'
          }`}>
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity={activeTab === 'freeCases' ? '1' : '0.3'} fillRule="evenodd" clipRule="evenodd" d="M15.8298 5.83134C15.7215 5.93656 15.5745 5.99669 15.4197 5.99669C14.8472 5.99669 14.383 6.44766 14.383 6.99634C14.383 7.54878 14.8418 7.99749 15.4089 8.0035C15.7284 8.00651 16 8.22297 16 8.53339V10.4613C16 12.084 14.646 13.4001 12.9749 13.4001H10.4526C10.1919 13.4001 9.98066 13.1949 9.98066 12.9416V11.3181C9.98066 11.0024 9.72534 10.7544 9.40039 10.7544C9.08317 10.7544 8.82012 11.0024 8.82012 11.3181V12.9416C8.82012 13.1949 8.6089 13.4001 8.34894 13.4001H3.02515C1.3617 13.4001 0 12.0848 0 10.4613V8.53339C0 8.22297 0.271567 8.00651 0.591103 8.0035C1.15899 7.99749 1.61702 7.54878 1.61702 6.99634C1.61702 6.46269 1.16828 6.05682 0.580271 6.05682C0.425532 6.05682 0.27853 5.99669 0.170213 5.89147C0.0618955 5.78624 0 5.64343 0 5.49311V3.54643C0 1.92595 1.3648 0.600098 3.03288 0.600098H8.34894C8.6089 0.600098 8.82012 0.805289 8.82012 1.05858V2.98272C8.82012 3.29088 9.08317 3.54643 9.40039 3.54643C9.72554 3.54643 9.98066 3.29088 9.98066 2.98272V1.05858C9.98066 0.805289 10.1919 0.600098 10.4526 0.600098H12.9749C14.646 0.600098 16 1.91542 16 3.53891V5.43298C16 5.5833 15.9381 5.72611 15.8298 5.83134ZM9.40058 9.29609C9.72554 9.29609 9.98085 9.04054 9.98085 8.73238V5.72592C9.98085 5.41776 9.72554 5.16221 9.40058 5.16221C9.08337 5.16221 8.82031 5.41776 8.82031 5.72592V8.73238C8.82031 9.04054 9.08337 9.29609 9.40058 9.29609Z" fill={activeTab === 'freeCases' ? '#F9F8FC' : '#F9F8FC'}/>
            </svg>
          </div>
          <p className={`font-actay-wide text-base font-bold ${
            activeTab === 'freeCases' ? 'text-[#F9F8FC]' : 'text-[#F9F8FC] opacity-50'
          }`}>
              Фри Кейсы
          </p>
        </motion.button>
        
        {/* Кнопка настроек для привилегированных пользователей */}
        <PrivilegedUserCheck>
          <motion.button 
            onClick={() => setActiveTab('settings')}
            className={`flex px-[12px] py-[8px] pr-2 items-center gap-2 rounded-lg cursor-pointer transition-all duration-300 ease-out ${
              activeTab === 'settings' ? 'bg-[#232329]' : 'bg-transparent'
            } ${activeTab === 'settings' ? '' : 'hover:bg-[#232329]'}`}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className={`flex w-[30px] h-[30px] flex-col justify-center items-center gap-[10px] aspect-square rounded-[4px] transition-all duration-300 ease-out ${
              activeTab === 'settings' ? 'bg-[#5C5ADC]' : 'bg-[#F9F8FC]/[0.05]'
            }`}>
              <img 
                src="/Settings.svg" 
                alt="Settings"
                width={18}
                height={18}
                className={`opacity-${activeTab === 'settings' ? '100' : '30'}`}
              />
            </div>
            <p className={`font-actay-wide text-base font-bold ${
              activeTab === 'settings' ? 'text-[#F9F8FC]' : 'text-[#F9F8FC] opacity-50'
            }`}>
              Настройки
            </p>
          </motion.button>
        </PrivilegedUserCheck>
      </div>


      
      {/* Контент в зависимости от активной вкладки */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full"
      >
        {activeTab === 'inventory' && (
          <>
            {/* Ошибка загрузки */}
            {error && (
              <div className='flex items-center justify-center w-full py-8'>
                <div className='text-red-400 font-actay-wide text-sm'>
                  Ошибка загрузки инвентаря: {error}
                </div>
              </div>
            )}

            {/* Индикатор начальной загрузки */}
            {loading && inventoryItems.length === 0 && (
              <div className='flex flex-col items-center justify-center w-full py-16 gap-4'>
                <div className="w-12 h-12 border-4 border-[#F9F8FC]/20 border-t-[#5C5ADC] rounded-full animate-spin"></div>
                <div className='text-center'>
                  <p className='text-[#F9F8FC] font-actay-wide text-sm opacity-70'>
                    Загрузка инвентаря...
                  </p>
                </div>
              </div>
            )}

            {/* Сетка предметов инвентаря */}
            {!loading || inventoryItems.length > 0 ? (
              <div className='flex flex-col items-start gap-2 self-stretch'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full'>
                {inventoryItems.map((inventoryItem, index) => (
                  <InventoryItemCard 
                    key={`${inventoryItem.item.id}-${index}`}
                    inventoryItem={inventoryItem}
                    index={index}
                    onSellClick={handleSellClick}
                    onWithdrawClick={handleWithdrawClick}
                    onItemClick={handleOpenItemDescriptionModal}
                  />
                ))}
              </div>

              {/* Элемент для наблюдения (бесконечная прокрутка) */}
              {hasMore && (
                <div ref={observerRef} className="w-full h-4 flex justify-center items-center">
                  {loading && (
                    <div className="w-6 h-6 border-2 border-[#F9F8FC]/20 border-t-[#F9F8FC] rounded-full animate-spin"></div>
                  )}
                </div>
              )}
              
              {/* Пустое состояние, если нет предметов */}
              {inventoryItems.length === 0 && !loading && (
                <div className='flex flex-col items-center justify-center w-full py-16 gap-2'>
                  <div className='w-16 h-16 rounded-full bg-[#F9F8FC]/[0.05] flex items-center justify-center'>
                    <svg 
                      width="32" 
                      height="32" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[#F9F8FC] opacity-50"
                    >
                      <path 
                        d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className='text-center'>
                    <h3 className='text-[#F9F8FC] font-unbounded text-lg font-medium mb-2'>
                      Инвентарь пуст
                    </h3>
                    <p className='text-[#F9F8FC] font-actay-wide text-sm opacity-50'>
                      Откройте кейсы, чтобы получить предметы
                    </p>
                  </div>
                </div>
              )}
            </div>
            ) : null}
          </>
        )}

        {activeTab === 'deliveries' && (
          <DeliveryTab />
        )}

        {activeTab === 'freeCases' && (
          <FreeCasesTab userId={user?.id} level={userLevel} />
        )}

        {activeTab === 'settings' && (
          <div className='w-full'>
            <div className='bg-[#1A1A20] rounded-lg p-6'>
              <div className='flex flex-col gap-4'>
                <h3 className='text-[#F9F8FC] font-unbounded text-lg font-medium'>
                  Настройки
                </h3>
                <div className='flex items-center justify-between p-4 bg-[#232329] rounded-lg'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[#F9F8FC] font-unbounded text-sm font-medium'>
                      Хайповые слова
                    </span>
                    <span className='text-[#F9F8FC] font-actay-wide text-xs opacity-50'>
                      Включить хайповую локализацию сайта
                    </span>
                  </div>
                  <motion.button 
                    onClick={() => setHypedPhrases(!hypedPhrases)}
                    className={`flex w-[40px] h-[22px] p-[3px] cursor-pointer ${
                      hypedPhrases ? 'justify-end bg-[#5C5ADC]' : 'justify-start bg-[#F9F8FC]/[0.10]'
                    } items-center rounded-[100px] transition-colors duration-200`}
                  >
                    <motion.div 
                      className='w-[16px] h-[16px] flex-shrink-0 rounded-[100px] bg-[#F9F8FC]'
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Модалка инвентаря */}
      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={handleCloseInventoryModal}
        selectedItem={selectedInventoryItem}
        initialTab={inventoryModalTab}
        onSellSuccess={handleSellSuccess}
      />
      
      {/* Модальное окно описания предмета */}
      <ItemDescriptionModal 
        isOpen={isItemDescriptionModalOpen}
        onClose={handleCloseItemDescriptionModal}
        item={selectedItem}
      />
    </div>
  );
}