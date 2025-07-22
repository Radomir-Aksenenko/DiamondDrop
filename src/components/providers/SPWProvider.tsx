'use client';

import { useEffect } from 'react';
import spw from '@/lib/spw';

/**
 * Провайдер для инициализации SPWMini
 * Инициализирует SPWMini при монтировании компонента и очищает при размонтировании
 */
export default function SPWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Инициализация SPWMini
    spw.initialize();

    // Обработчики событий
    const handleReady = () => {
      console.log('SPWMini готов к использованию');
      console.log('Текущий пользователь:', spw.user);
    };

    const handleInitResponse = (user: any) => {
      console.log(`Авторизован как ${user.username} / ${user.minecraftUUID}`);
    };

    const handleInitError = (message: string) => {
      console.error(`Ошибка авторизации: ${message}`);
    };

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