'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NavButton from '@/components/ui/NavButton';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';
import { useUserFaceAvatar } from '@/hooks/useUserAvatar';
import WalletModal from '@/components/ui/WalletModal';
import UpgradeModal from '@/components/ui/UpgradeModal';

export default function Header() {
  const { user, isAuthenticated } = usePreloadedData();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const router = useRouter();
  
  // Используем предзагруженные данные пользователя
  const userBalance = user?.balance ?? 999;
  const userName = user?.nickname ?? (isAuthenticated ? 'Загрузка...' : 'Гость');
  const userLevel = user?.level ?? 1;
  
  // Получаем URL аватара через хук
  const userAvatarUrl = useUserFaceAvatar(userName === 'Загрузка...' || userName === 'Гость' ? null : userName);

  // Функция для определения размера текста никнейма в зависимости от длины
  const getNicknameTextSize = (nickname: string) => {
    const length = nickname.length;
    if (length <= 6) return 'text-2xl'; // 24px - стандартный размер
    if (length <= 8) return 'text-xl';  // 20px - немного меньше
    if (length <= 10) return 'text-lg'; // 18px - еще меньше
    if (length <= 12) return 'text-base'; // 16px - базовый размер
    return 'text-sm'; // 14px - минимальный размер для очень длинных никнеймов
  };

  // Логирование изменений баланса для отладки
  useEffect(() => {
    console.log('🏠 Header: Баланс пользователя обновлен:', userBalance);
  }, [userBalance]);
  
  const handleOpenWalletModal = () => {
    setIsWalletModalOpen(true);
  };
  
  const handleCloseWalletModal = () => {
    setIsWalletModalOpen(false);
  };

  const openUpgradeModal = () => setIsUpgradeModalOpen(true);
  const closeUpgradeModal = () => setIsUpgradeModalOpen(false);

  const handleOpenInventory = () => {
    router.push('/profile');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D11]">
      <div className="h-[82px] px-6 py-4 flex items-center justify-between">
          <div 
            className='flex gap-2 items-center cursor-pointer hover:opacity-80 transition-opacity'
            onClick={handleOpenInventory}
            title="Открыть инвентарь"
          >
              <img 
                src={userAvatarUrl}
                alt="User Avatar"
                width={50}
                height={50}
                className="rounded-lg"
              />
              <div>
                <p className={`text-[#F9F8FC] ${getNicknameTextSize(userName)} font-bold mr-2 font-unbounded`}>{userName}</p>
                <div className="flex-col justify-center items-center text-[#F9F8FC] text-base font-bold opacity-50">
                  <span className="mr-1">{userLevel}</span>
                  <span className="">lvl</span>
                </div>
              </div>
            </div>
        <nav className="flex items-center gap-2">
          <NavButton icon="Case" href="/" label="Кейсы" />
          <NavButton icon="Update" onClick={openUpgradeModal} label="Апгрейд" />
          <NavButton icon="About" href="/about" label="О проекте" />
        </nav>
        <div className='h-[44px] bg-[#19191D] flex items-center rounded-[12px]'>
          <div className='flex items-center pt-1 pl-3 pr-1.5 min-w-0 flex-1'>
            <span className='text-[#F9F8FC] font-unbounded text-20 font-bold whitespace-nowrap'>{Math.floor(userBalance).toLocaleString('ru-RU')}</span>
            <span className='text-[#F9F8FC]/50 font-actay-wide text-16 font-bold ml-1 whitespace-nowrap'>АР</span>
          </div>
          <button 
            onClick={handleOpenWalletModal}
            className='flex items-center justify-center gap-2.5 p-3 rounded-[12px] bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors cursor-pointer flex-shrink-0'
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
      <div className='h-[3px] bg-[#151519]'></div>
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