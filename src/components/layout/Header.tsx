'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import NavButton from '@/components/ui/NavButton';
import useSPW from '@/hooks/useSPW';
import WalletModal from '@/components/ui/WalletModal';
import UpgradeModal from '@/components/ui/UpgradeModal';

export default function Header() {
  const { user } = useSPW();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
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
            <img 
              src={`https://avatars.spworlds.ru/face/${user?.username}?w=100`}
              alt="User Avatar"
              width={50}
              height={50}
              className="rounded-md"
            />
            <div>
              <p className='text-[#F9F8FC] text-2xl font-bold mr-2 font-unbounded'>{user ? user.username : 'Загрузка...'}</p>
              <div className="flex-col justify-center items-center text-[#F9F8FC] text-base font-bold opacity-50">
                <span className="mr-1">{user?.level ?? '?'}</span>
                <span className="">lvl</span>
              </div>
            </div>
          </div>
        <nav className="flex items-center gap-2">
          <NavButton icon="Case" href="/" label="Кейсы" />
          <NavButton icon="Update" onClick={openUpgradeModal} label="Апгрейд" />
          <NavButton icon="About" href="/about" label="О проекте" />
        </nav>
        <div className='w-[137px] h-[44px] bg-[#19191D] flex items-center justify-center gap-2 pl-3 rounded-[12px]'>
          <div className='mr-1.5 flex items-center pt-1'>
            <span className='text-[#F9F8FC] font-unbounded text-20 font-bold'>999</span>
            <span className='text-[#F9F8FC]/50 font-actay-wide text-16 font-bold ml-1'>АР</span>
          </div>
          <button 
            onClick={handleOpenWalletModal}
            className='flex items-center justify-center gap-2.5 p-3 rounded-[8px] bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors cursor-pointer'
          >
            <Image
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