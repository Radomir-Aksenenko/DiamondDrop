'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import useCaseAPI from '@/hooks/useCaseAPI';

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

  // Обработка состояний загрузки и ошибки
  if (loading) {
    return (
      <div className="min-h-screen py-6 flex flex-col items-center justify-center">
        <div className="text-[#F9F8FC] font-unbounded text-lg">Загрузка кейса...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-6 flex flex-col items-center justify-center gap-4">
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
      <div className="min-h-screen py-6 flex flex-col items-center justify-center gap-4">
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
    <div className="min-h-screen py-6 flex flex-col items-start gap-4 flex-1 self-stretch">
      {/* Кнопка назад */}
      <button 
        onClick={() => router.back()}
        className="flex w-full h-[42px] px-6 items-center gap-4 cursor-pointer"
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
      <div className='flex px-6 items-end gap-2 flex-[1_0_0] self-stretch'>
        <div className='flex flex-col justify-end items-start gap-2 flex-1 self-stretch'>
          {/* Блок с информацией о кейсе */}
          <div className="flex flex-col items-start gap-2 self-stretch p-4 rounded-xl bg-[#F9F8FC]/[0.05] w-[679px] h-[288px]">
            <div className='flex h-[256px] items-center gap-4 self-stretch'>
              {/* Изображение кейса */}
              <Image
                src={caseData.imageUrl || "/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png"}
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
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                    className='flex px-4 py-3 justify-center items-center gap-2 rounded-xl bg-[#5C5ADC] transition-colors duration-200'
                    whileHover={{ backgroundColor: "#6462DE" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <span className="text-[#F9F8FC] font-unbounded text-sm font-medium cursor-pointer">
                      Открыть {selectedNumber} {selectedNumber === 1 ? 'кейс' : 'кейса'}
                    </span>
                    <span className="text-[#F9F8FC] font-unbounded text-sm font-medium opacity-50 cursor-pointer">·</span>
                    <span className='text-[#F9F8FC] font-unbounded text-sm font-medium opacity-50 cursor-pointer'>
                      {selectedNumber * caseData.price}
                    </span>
                    <span className='text-[#F9F8FC] font-unbounded text-[10px] font-medium opacity-50 cursor-pointer'>АР</span>
                  </motion.button>
                  
                  <motion.button 
                    className='flex px-4 py-3 justify-center items-center gap-[10px] rounded-[8px] bg-[#F9F8FC]/[0.05] text-[#F9F8FC] font-unbounded text-sm font-medium transition-colors duration-200 cursor-pointer'
                    whileHover={{ backgroundColor: "#242428" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Демо
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Нижний блок */}
          <div className="flex p-[10px] items-start gap-2 flex-1 self-stretch rounded-xl bg-[#F9F8FC]/[0.05] w-[679px] h-[288px]">
            {/* Содержимое нижнего блока */}
          </div>
        </div>
        
        {/* Правый сайдбар */}
        <div className='flex w-[221px] p-4 flex-col items-center gap-4 self-stretch rounded-xl bg-[#F9F8FC]/[0.05]'>
          {/* Содержимое сайдбара */}
        </div>
      </div>
    </div>
  );
}