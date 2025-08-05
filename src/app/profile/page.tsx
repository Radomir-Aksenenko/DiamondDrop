'use client';

import React from 'react';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import CaseItemCard from '@/components/ui/CaseItemCard';

export default function ProfilePage() {
  const { user, isAuthenticated } = usePreloadedData();
  const router = useRouter();
  
  // Данные пользователя
  const userName = user?.nickname ?? (isAuthenticated ? 'Загрузка...' : 'Гость');
  const userLevel = user?.level ?? 1;
  const userBalance = user?.balance ?? 0;
  const userAvatar = user?.avatarUrl ?? 'https://vzge.me/front/512/megatntmega.png';
  
  // Инвентарь из данных пользователя
  const inventoryItems = user?.inventory ?? [];

  return (
    <div className="w-full max-w-6xl mx-auto pt-8 flex flex-col items-start gap-4 self-stretch">
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
            {inventoryItems.length} предметов
          </span>
        </div>
      </div>

      {/* Сетка предметов инвентаря */}
      <div className='flex flex-col items-start gap-4 self-stretch'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
          {inventoryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className='relative flex p-4 items-start gap-4 rounded-xl bg-[#F9F8FC]/[0.05] hover:bg-[#F9F8FC]/[0.08] transition-all duration-300 group'
            >
              {/* Карточка предмета */}
              <CaseItemCard 
                item={item} 
                hideChance={true}
                className="flex-shrink-0"
              />
              
              {/* Информация о предмете */}
              <div className='flex flex-col justify-between items-start flex-1 self-stretch gap-3'>
                <div className='flex flex-col items-start self-stretch'>
                  <h3 className='text-[#F9F8FC] font-actay-wide text-lg font-bold leading-tight'>
                    {item.name}
                  </h3>
                  <p className='text-[#F9F8FC] font-actay-wide text-sm font-bold opacity-50 leading-tight'>
                    {item.description}
                  </p>
                </div>
                
                {/* Кнопки действий */}
                <div className='flex items-start gap-2 w-full'>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='flex flex-col justify-center items-center gap-2 px-4 py-2 rounded-lg bg-[#54A930] hover:bg-[#4A8A2A] transition-colors duration-200'
                  >
                    <span className='text-[#F9F8FC] font-unbounded text-sm font-medium'>Продать</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='flex flex-col justify-center items-center gap-2 px-4 py-2 rounded-lg bg-[#F9F8FC]/[0.10] hover:bg-[#F9F8FC]/[0.15] transition-colors duration-200'
                  >
                    <span className='text-[#F9F8FC] font-unbounded text-sm font-medium opacity-50 group-hover:opacity-70 transition-opacity duration-200'>
                      Вывести
                    </span>
                  </motion.button>
                </div>
              </div>
              
              {/* Количество предметов */}
              <div className='absolute right-4 top-4'>
                <span className='text-[#F9F8FC] text-center font-actay-wide text-lg font-bold opacity-50'>
                  x{item.amount}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Пустое состояние, если нет предметов */}
        {inventoryItems.length === 0 && (
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
      
    </div>
  );
}