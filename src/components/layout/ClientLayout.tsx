'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import Header from '@/components/layout/Header';
import BroadcastBanner from '@/components/ui/BroadcastBanner';
import { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
}

/**
 * Клиентский компонент layout с определением мобильных устройств
 */
export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isLoading } = useIsMobile();

  // Показываем загрузку пока определяем тип устройства
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0D0D11] flex items-center justify-center z-50">
        <div className="w-8 h-8 border-2 border-[#5C5ADC] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Убрана заглушка для мобильных устройств
  // if (isMobile) {
  //   return <MobileNotSupported />;
  // }

  // Показываем обычный layout для десктопа
  return (
    <>
      <Header />
      <BroadcastBanner />
      <main className="pt-[85px] px-6">
        <div className="pt-4">
          {children}
        </div>
      </main>
    </>
  );
}