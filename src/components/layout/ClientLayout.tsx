'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import Header from '@/components/layout/Header';
import BroadcastBanner from '@/components/ui/BroadcastBanner';
import SubscriptionGate from '@/components/ui/SubscriptionGate';
import BottomNavigation from '@/components/ui/BottomNavigation';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface ClientLayoutProps {
  children: ReactNode;
}

/**
 * Клиентский компонент layout с определением мобильных устройств
 */
export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isLoading, isMobile } = useIsMobile();
  const router = useRouter();

  // Показываем загрузку пока определяем тип устройства
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0D0D11] flex items-center justify-center z-50">
        <div className="w-8 h-8 border-2 border-[#5C5ADC] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleProfileClick = () => {
    router.push('/profile');
  };

  // Показываем layout с нижним меню для мобильных и обычный для десктопа
  return (
    <>
      <SubscriptionGate />
      <Header />
      <BroadcastBanner />
      <main className={`${isMobile ? 'pt-[73px]' : 'pt-[85px]'} px-6 ${isMobile ? 'pb-20' : ''}`}>
        <div className="pt-4">
          {children}
        </div>
      </main>
      <BottomNavigation
        onProfileClick={handleProfileClick}
      />
    </>
  );
}