'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import NavButton from '@/components/ui/NavButton';
import useSPW from '@/hooks/useSPW';
import useUserAPI from '@/hooks/useUserAPI';
import WalletModal from '@/components/ui/WalletModal';
import UpgradeModal from '@/components/ui/UpgradeModal';

export default function Header() {
  const { user: spwUser } = useSPW();
  const { user: apiUser, loading: apiLoading, error: apiError } = useUserAPI();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  // Используем данные из API, если доступны, иначе из SPW
  const displayUser = apiUser;
  const userBalance = apiUser?.balance ?? 999; // Используем баланс из API или дефолтное значение
  const userName = apiUser?.nickname ?? 'Загрузка...'; // Используем дефолтный никнейм, если API не доступен
  const userLevel = apiUser?.level;
  // Формируем URL аватара напрямую из никнейма
  const userAvatarUrl = `https://avatars.spworlds.ru/face/${userName}?w=100`;
  
  const handleOpenWalletModal = () => {
    setIsWalletModalOpen(true);
  };
  
  const handleCloseWalletModal = () => {
    setIsWalletModalOpen(false);
  };

  const openUpgradeModal = () => setIsUpgradeModalOpen(true);
  const closeUpgradeModal = () => setIsUpgradeModalOpen(false);

  return (
    <header className="relative">
      <div className="h-[82px] px-6 py-4 flex items-center justify-between">
          <div className='flex gap-2 items-center'>
              <Image 
                src={userAvatarUrl}
                alt="User Avatar"
                width={50}
                height={50}
                className=''
              />
              <div>
                <p className='text-[#F9F8FC] text-2xl font-bold mr-2 font-unbounded'>{userName}</p>
                <div className="flex-col justify-center items-center text-[#F9F8FC] text-base font-bold opacity-50">
                  <span className="mr-1">{userLevel ?? '?'}</span>
                  <span className="">lvl</span>
                </div>
                {/* Индикатор ошибки API скрыт */}
              </div>
            </div>
        <nav className="flex items-center gap-2">
          <NavButton icon="Case" href="/" label="Кейсы" />
          <NavButton icon="Update" onClick={openUpgradeModal} label="Апгрейд" />
          <NavButton icon="About" href="/about" label="О проекте" />
        </nav>
        <div className='h-[44px] bg-[#19191D] flex items-center rounded-[12px]'>
          <div className='flex items-center pt-1 pl-3 pr-1.5 min-w-0 flex-1'>
            <span className='text-[#F9F8FC] font-unbounded text-20 font-bold whitespace-nowrap'>{userBalance.toLocaleString()}</span>
            <span className='text-[#F9F8FC]/50 font-actay-wide text-16 font-bold ml-1 whitespace-nowrap'>АР</span>
          </div>
          <button 
            onClick={handleOpenWalletModal}
            className='flex items-center justify-center gap-2.5 p-3 rounded-[8px] bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors cursor-pointer flex-shrink-0'
          >
            <img
              src="/Wallet.svg"
              alt="WalletIcon"
              width={22}
              height={20}
              className='aspect-[11/10]'
            />
          </button>
        </div>
      </div>
      
      {/* Модальное окно кошелька */}
      <WalletModal isOpen={isWalletModalOpen} onClose={handleCloseWalletModal} />

      {/* Модальное окно апгрейда */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={closeUpgradeModal} 
      />
    </header>
  );
}