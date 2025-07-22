'use client';

import { useEffect } from 'react';
import spw from '@/lib/spw';
import { SPWUser } from '@/types/spw';

/**
 * Провайдер для инициализации SPWMini
 * Инициализирует SPWMini при монтировании компонента и очищает при размонтировании
 */
export default function SPWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Инициализация SPWMini
    spw.initialize();

    // Обработчики событий
    const handleReady = () => {};

    const handleInitResponse = (user: SPWUser) => {};

    const handleInitError = (message: string) => {};

    // Добавляем обработчики событий
    spw.on('ready', handleReady);
    spw.on('initResponse', handleInitResponse);
    spw.on('initError', handleInitError);

    // Очистка при размонтировании
    return () => {
      spw.dispose();
    };
  }, []);

  return <>{children}</>;
}