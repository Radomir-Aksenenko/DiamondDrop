'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInventoryAPI, InventoryItem } from '@/hooks/useInventoryAPI';
import { useUserBodyAvatar } from '@/hooks/useUserAvatar';
import InventoryItemCard from '@/components/ui/InventoryItemCard';
import InventoryModal from '@/components/ui/InventoryModal';
import ItemDescriptionModal from '@/components/ui/ItemDescriptionModal';
import { CaseItem } from '@/hooks/useCasesAPI';

export default function ProfilePage() {
  const { user, isAuthenticated } = usePreloadedData();
  const router = useRouter();
  const { items: inventoryItems, loading, error, hasMore, totalCount, loadMore, refresh, softRefresh } = useInventoryAPI();
  const observerRef = useRef<HTMLDivElement>(null);
  
  // Состояние для модалки инвентаря
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [inventoryModalTab, setInventoryModalTab] = useState<'sell' | 'withdraw'>('sell');
  
  // Состояние для модалки описания предмета
  const [isItemDescriptionModalOpen, setIsItemDescriptionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CaseItem | null>(null);
  
  // Данные пользователя
  const userName = user?.nickname ?? (isAuthenticated ? 'Загрузка...' : 'Гость');
  const userLevel = user?.level ?? 1;
  const userBalance = user?.balance ?? 0;
  
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
      rarity: inventoryItem.item.rarity
    };
    setSelectedItem(caseItem);
    setIsItemDescriptionModalOpen(true);
  }, []);

  const handleCloseItemDescriptionModal = useCallback(() => {
    setIsItemDescriptionModalOpen(false);
    setSelectedItem(null);
  }, []);

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

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [handleIntersection]);

  return (
    <div className="w-full max-w-6xl mx-auto pt-2 flex flex-col items-start gap-4 self-stretch">
      <button 
        onClick={() => {
          router.back();
        }}
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
        <p className='text-[#F9F8FC] font-unbounded text-2xl font-medium'>Профиль</p>
      </button>
      
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
              <span>5</span>
              <span>/</span>
              <span>2500</span>
              <span>XP</span>
            </div>
          </div>
          <div className='flex flex-col justify-center items-start gap-2 self-stretch'>
            <div className='flex justify-between items-center self-stretch'>
              <p className='text-[#F9F8FC] font-unbounded text-base font-semibold'>lvl {userLevel}</p>
              <p className='text-[#F9F8FC] font-unbounded text-base font-semibold opacity-50'>lvl {userLevel + 1}</p>
            </div>
            <div className='flex h-[18px] pr-2 items-center gap-[10px] self-stretch rounded-[100px] bg-[#0D0D11]'>
              <div className="w-[314px] self-stretch rounded-[100px] bg-gradient-to-r from-[#313076] to-[#5C5ADC] shadow-[inset_0_4px_25.8px_0_rgba(249,248,252,0.10)]"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Заголовок инвентаря */}
      <div className='flex items-center justify-between self-stretch'>
        <h2 className='text-[#F9F8FC] font-unbounded text-2xl font-semibold'>Инвентарь</h2>
        <div className='flex items-center gap-2'>
          <span className='text-[#F9F8FC] font-actay-wide text-base font-bold opacity-50'>
            {totalCount} предметов
          </span>
          {loading && (
            <div className="w-4 h-4 border-2 border-[#F9F8FC]/20 border-t-[#F9F8FC] rounded-full animate-spin"></div>
          )}
        </div>
      </div>

      {/* Ошибка загрузки */}
      {error && (
        <div className='flex items-center justify-center w-full py-8'>
          <div className='text-red-400 font-actay-wide text-sm'>
            Ошибка загрузки инвентаря: {error}
          </div>
        </div>
      )}

      {/* Сетка предметов инвентаря */}
      <div className='flex flex-col items-start gap-4 self-stretch'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
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
          <div className='flex flex-col items-center justify-center w-full py-16 gap-4'>
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