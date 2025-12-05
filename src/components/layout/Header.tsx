'use client';

import React, { useState, useEffect } from 'react';
// Убран импорт Image из next/image - заменен на обычные img теги
import { useRouter } from 'next/navigation';
import NavButton from '@/components/ui/NavButton';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';
import { useUserFaceAvatar } from '@/hooks/useUserAvatar';
import WalletModal from '@/components/ui/WalletModal';
import { useWalletModal } from '@/contexts/WalletModalContext';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function Header() {
  const { user, isAuthenticated } = usePreloadedData();
  const { openWalletModal, closeWalletModal, isWalletModalOpen, walletPresetAmount } = useWalletModal();
  const { isMobile } = useIsMobile();
  const router = useRouter();

  // Используем предзагруженные данные пользователя
  const userBalance = user?.balance ?? 999;
  const userName = user?.nickname ?? (isAuthenticated ? 'Загрузка...' : 'Гость');
  const userLevel = typeof user?.level === 'object' ? user.level.level : (user?.level ?? 1);

  // Получаем URL аватара через хук
  const avatarFromHook = useUserFaceAvatar(userName === 'Загрузка...' || userName === 'Гость' ? null : userName);
  const [avatarError, setAvatarError] = useState(false);
  const userAvatarUrl = (!avatarError && avatarFromHook) || '/User.svg';

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
    // Информационное логирование удалено
  }, [userBalance]);



  const handleUpgradeClick = () => {
    // Открываем апгрейд для всех пользователей
    router.push('/upgrade');
  };

  const handleOpenInventory = () => {
    router.push('/profile');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D11]">
      <div className={`${isMobile ? 'h-[70px] px-4 py-3' : 'h-[82px] px-6 py-4'} flex items-center justify-between`}>
          <div
            className='flex gap-2 items-center cursor-pointer hover:opacity-80 transition-opacity'
            onClick={handleOpenInventory}
            title="Открыть инвентарь"
          >
              <div className={`flex ${isMobile ? 'w-[40px] h-[40px]' : 'w-[50px] h-[50px]'} aspect-[1/1] relative overflow-hidden`}>
                <img
                  src={userAvatarUrl}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              </div>
              <div>
                <p className={`text-[#F9F8FC] ${isMobile ? 'text-lg' : getNicknameTextSize(userName)} font-bold mr-2 font-unbounded`}>{userName}</p>
                <div className={`flex-col justify-center items-center text-[#F9F8FC] ${isMobile ? 'text-sm' : 'text-base'} font-bold opacity-50`}>
                  <span className="mr-1">{userLevel}</span>
                  <span className="">lvl</span>
                </div>
              </div>
            </div>
        {!isMobile && (
          <nav className="flex items-center gap-2">
            <NavButton icon="Case" href="/" label="Кейсы" />
            <NavButton icon="Update" onClick={handleUpgradeClick} label="Апгрейд" activeOnPath="/upgrade" />
            <NavButton icon="About" href="/about" label="О проекте" />
          </nav>
        )}
        <div className='flex items-center gap-2'>
          <div className={`${isMobile ? 'h-[38px]' : 'h-[44px]'} bg-[#18181D] flex items-center rounded-[10px]`}>
            <div className={`flex items-center pt-1 ${isMobile ? 'pl-2 pr-1' : 'pl-3 pr-1.5'} min-w-0 flex-1`}>
              <span className={`text-[#F9F8FC] font-unbounded ${isMobile ? 'text-lg' : 'text-20'} font-bold whitespace-nowrap`}>
                {userBalance % 1 === 0
                  ? Math.floor(userBalance).toLocaleString('ru-RU')
                  : userBalance.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                }
              </span>
              <span className={`text-[#F9F8FC]/50 font-actay-wide ${isMobile ? 'text-lg' : 'text-20'} font-bold ml-1 whitespace-nowrap`}>АР</span>
            </div>
            <button
              onClick={() => openWalletModal()}
              className={`flex items-center justify-center aspect-square h-full rounded-[10px] bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors cursor-pointer flex-shrink-0 p-0`}
            >
              <img
              src="/Wallet.svg"
              alt="WalletIcon"
              width={isMobile ? 18 : 22}
              height={isMobile ? 16 : 20}
              className='aspect-[11/10]'
            />
            </button>
          </div>
          {!isMobile && (
            <button
              onClick={handleOpenInventory}
              className='flex items-center justify-center p-3 rounded-[12px] bg-[#F9F8FC]/5 hover:bg-[#F9F8FC]/10 transition-colors cursor-pointer'
              title="Открыть инвентарь"
            >
              <img
              src="/User.svg"
              alt="UserIcon"
              width={24}
              height={24}
              className="aspect-square"
            />
            </button>
          )}
        </div>
      </div>
      <div className='h-[3px] bg-[#18181D]'></div>
      {/* Модальное окно кошелька */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={closeWalletModal}
        presetAmount={walletPresetAmount}
      />

    </header>
  );
}