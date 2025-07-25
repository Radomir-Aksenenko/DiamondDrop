'use client';

import { useEffect, useState } from 'react';
import spw from '@/lib/spw';
import { SPWUser } from '@/types/spw';
import { validateUserAndSetToken, ValidationData } from '@/lib/auth';
import { isDevelopment, DEV_CONFIG } from '@/lib/config';
import LoadingScreen from '@/components/ui/LoadingScreen';

/**
 * Провайдер для инициализации SPWMini
 * Инициализирует SPWMini при монтировании компонента и очищает при размонтировании
 */
export default function SPWProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Функция валидации пользователя
    const handleUserValidation = async (user: SPWUser) => {
      try {
        // Подготавливаем данные для валидации
        const validationData: ValidationData = {
          hash: user.hash || "9c51ce16880ef149ac2bbabde38da3c611adb9b9edf073bc99812bf364b252d2",
          accountId: user.accountId || "889e603f-67a3-46f4-bad6-a6221dcb964d",
          username: user.username || "rafael1209",
          minecraftUUID: user.minecraftUUID || "3f5edd2a95b4364a2748d4ec3ad39b",
          roles: user.roles || [],
          isAdmin: user.isAdmin || false,
          timestamp: user.timestamp || Date.now()
        };

        console.log('Отправляем данные для валидации:', validationData);

        // Валидируем пользователя и получаем токен
        const token = await validateUserAndSetToken(validationData);
        
        console.log('Токен авторизации получен и сохранен');
        
        setIsInitialized(true);
        setIsLoading(false);
        setError(null);
      } catch (error) {
        console.error('Ошибка валидации пользователя:', error);
        setError('Ошибка валидации пользователя. Попробуйте перезагрузить страницу.');
        setIsLoading(false);
      }
    };

    // В dev режиме пропускаем инициализацию SPW и сразу переходим к валидации
    if (isDevelopment && DEV_CONFIG.skipAuth) {
      console.log('🔧 Dev режим: пропускаем инициализацию SPW');
      
      // Создаем мок пользователя для валидации
      const mockSPWUser: SPWUser = {
        username: 'DevUser',
        minecraftUUID: '3f5edd2a95b4364a2748d4ec3ad39b',
        hash: 'dev-hash',
        accountId: 'dev-account-id',
        roles: ['user'],
        isAdmin: false,
        timestamp: Date.now()
      };

      handleUserValidation(mockSPWUser);
      return;
    }

    // Инициализация SPWMini
    spw.initialize();

    // Обработчики событий
    const handleReady = async () => {
      if (!mounted) return;
      
      console.log('SPW готов к работе!');
      console.log('Текущий пользователь:', spw.user);
      
      if (spw.user) {
        await handleUserValidation(spw.user);
      }
    };

    const handleInitResponse = async (user: SPWUser) => {
      if (!mounted) return;
      
      console.log(`Вошел как ${user.username} / ${user.minecraftUUID}`);
      await handleUserValidation(user);
    };

    const handleInitError = (message: string) => {
      if (!mounted) return;
      
      console.error(`Ошибка входа: ${message}`);
      setError(`Ошибка инициализации SPWorlds: ${message}`);
      setIsLoading(false);
    };

    // Добавляем обработчики событий
    spw.on('ready', handleReady);
    spw.on('initResponse', handleInitResponse);
    spw.on('initError', handleInitError);

    // Очистка при размонтировании
    return () => {
      mounted = false;
      spw.dispose();
    };
  }, []);

  // Показываем загрузку пока не инициализировано
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Показываем ошибку если что-то пошло не так
  if (error) {
    return (
      <div className="fixed inset-0 bg-red-900 flex items-center justify-center z-50">
        <div className="text-center text-white p-8">
          <h1 className="text-2xl font-bold mb-4">Ошибка инициализации</h1>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          >
            Перезагрузить страницу
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}