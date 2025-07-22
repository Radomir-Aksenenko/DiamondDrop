'use client';

import React from 'react';
import Image from 'next/image';
import NavButton from '@/components/ui/NavButton';
import useSPW from '@/hooks/useSPW';

export default function Header() {
  const { user, isReady } = useSPW();
  
  return (
    <header className="relative">
      <div className="h-[82px] px-6 py-4 flex items-center justify-between">
          <div className='flex gap-2 items-center'>
            <Image
              src={isReady && user ? `https://avatars.spworlds.ru/face/${user.username}?w=100` : "https://avatars.spworlds.ru/face/megatntmega?w=100"}
              alt="User Avatar"
              width={50}
              height={50}
              className=""
            />
            <div>
              <p className='text-[#F9F8FC] text-2xl font-bold mr-2'>{isReady && user ? user.username : 'Загрузка...'}</p>
              <div className="flex-col justify-center items-center text-[#F9F8FC] text-base font-bold opacity-50">
                <span className="mr-1">{isReady && user && user.level ? user.level : '?'}</span>
                <span className="">lvl</span>
              </div>
            </div>
          </div>
        <nav className="flex items-center gap-2">
          <NavButton icon="Case" href="/" label="Кейсы" />
          <NavButton icon="Update" href="/update" label="Обновления" />
          <NavButton icon="About" href="/about" label="О проекте" />
        </nav>
        <div className='w-[137px] h-[44px] bg-[#19191D] flex items-center justify-center gap-2 pl-3 rounded-lg'>
          <span className='text-[#F9F8FC] font-actay-wide text-20 font-bold'>999</span>
          <span>АР

          </span>
          <div className='flex items-center justify-center gap-2.5 p-3 rounded-md bg-[#5C5ADC]'>

          </div>
        </div>
      </div>
      <div className="h-[2px] w-full bg-[#151519]"></div>
    </header>
  );
}