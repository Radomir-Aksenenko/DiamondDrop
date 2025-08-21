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
    <div className="h-screen flex px-6 flex-col items-center gap-2 self-stretch">
      <div className='flex justify-center items-end gap-2 self-stretch' style={{ height: '285.5px' }}>
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

      <div className='flex items-center gap-2 self-stretch' style={{ height: '317.5px' }}>
        <div className='flex flex-col items-center gap-3 flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)]'>
          <div className='flex p-4 justify-between items-center self-stretch border-b border-[rgba(249,248,252,0.05)]'>
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
          <div className='flex px-4 flex-col items-start gap-1 flex-1 self-stretch'>
        к
          </div>
        </div>
        <div className='flex flex-col items-center gap-3 flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)]'>
          <div className='flex px-4 py-[10px] justify-between items-center self-stretch border-b border-[rgba(249,248,252,0.05)]'>
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold'>Выберите предмет</p>
            <div className='flex px-2 py-[6px] justify-center items-center gap-[10px] border-b border-[rgba(249,248,252,0.30)]'>
              <span className='text-[rgba(249,248,252,0.50)] text-center font-["Actay_Wide"] text-base font-bold'>от</span>
              <span className='text-[rgba(249,248,252,0.30)] font-["Actay_Wide"] text-base font-bold'>10</span>
              <span className='text-[rgba(249,248,252,0.50)] text-center font-["Actay_Wide"] text-base font-bold'>АР</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}