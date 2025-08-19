'use client';

import React from 'react';

// Константа процента
const UPGRADE_PERCENTAGE = 15;

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

export default function UpgradePage() {
  return (
    <div className="min-h-screen flex px-6 flex-col items-center gap-2 flex-1 self-stretch">
      <div className='flex justify-center items-end gap-2 flex-1 self-stretch'>
        <div className='flex flex-col justify-between items-center pt-3 flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)]'>
          <p className='text-white text-center font-["Actay_Wide"] text-base font-bold opacity-30'>Передмет, который вы ставите</p>
          <div className='flex w-[160px] h-[160px] flex-col justify-end items-end aspect-square bg-[url(https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/netherite_ingot/icon)] bg-lightgray bg-center bg-cover bg-no-repeat'>
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-2xl font-bold opacity-30'>x1</p>
          </div>
          <div className='flex px-4 py-3 justify-between items-center self-stretch border-t border-[rgba(249,248,252,0.05)]'>
            <p className='text-[#EDD51D] text-center font-["Actay_Wide"] text-base font-bold'>Незеритовый слиток</p>
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold opacity-30'>3 шт.</p>
          </div>
        </div>

        <div className='flex p-2 flex-col justify-between items-center self-stretch rounded-xl bg-[rgba(249,248,252,0.05)]'>
          <div className='flex h-[180px] flex-col justify-between items-center'>
            <CircularProgress percentage={UPGRADE_PERCENTAGE} />
          </div>
          <div className='flex flex-col items-start gap-2 self-stretch'>
            <div className='flex items-start gap-2 self-stretch'>
              <div className='flex h-[36px] px-2 py-[6px] pb-[6px] justify-center items-center gap-2 flex-1 rounded-lg bg-[rgba(249,248,252,0.05)]'>
                <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold opacity-30 overflow-hidden text-ellipsis line-clamp-1' style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 }}>x9</p>
              </div>
              <div className='flex w-[104px] h-[36px] px-2 py-[6px] pb-[6px] justify-center items-center gap-2 rounded-lg bg-[rgba(17,171,71,0.10)]'>
                <span className='text-[#11AB47] font-["Actay_Wide"] text-base font-bold overflow-hidden text-ellipsis line-clamp-1' style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 }}>+ 999</span>
                <span className='overflow-hidden text-[#11AB47] font-["Actay_Wide"] text-sm font-bold leading-normal' style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1, textOverflow: 'ellipsis' }}> АР</span>
              </div>
            </div>
            <div className='flex px-4 py-[10px] flex-col justify-center items-center gap-2 self-stretch rounded-lg bg-[#5C5ADC]'>
              <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold'>Прокачать</p>
            </div>
          </div>
        </div>
        
        <div className='flex pt-3 flex-col justify-between items-center flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)]'>
          <p className='text-white text-center font-["Actay_Wide"] text-base font-bold opacity-30'>Передмет, который хотите получить</p>
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

      <div className='flex items-center gap-2 flex-1 self-stretch'>
        <div className='flex flex-col items-center gap-3 flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)]'>

        </div>
        <div className='flex flex-col items-center gap-3 flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)]'>

        </div>
      </div>
    </div>
  );
}