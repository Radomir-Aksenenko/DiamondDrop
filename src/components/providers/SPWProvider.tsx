'use client';

import { useEffect, useState } from 'react';
import spw from '@/lib/spw';
import { SPWUser } from '@/types/spw';
import { validateUserAndSetToken, ValidationData } from '@/lib/auth';
import { isDevelopment, DEV_CONFIG } from '@/lib/config';
import LoadingScreen from '@/components/ui/LoadingScreen';
import DataPreloadProvider, { usePreloadedData } from './DataPreloadProvider';

/**
 * Внутренний компонент, который использует предзагруженные данные
 */
function SPWContent({ children }: { children: React.ReactNode }) {
  const { loading: dataLoading, error: dataError } = usePreloadedData();
  const [spwLoading, setSPWLoading] = useState(true);
  const [spwError, setSPWError] = useState<string | null>(null);

  // Общее состояние загрузки (SPW + данные)
  const isLoading = spwLoading || dataLoading;
  const error = spwError || dataError;

  /**
   * Уведомляет о получении токена (данные загрузятся автоматически через DataPreloadProvider)
   */
  const notifyTokenReceived = async (token: string) => {
    console.log('✅ Токен авторизации получен, данные будут загружены автоматически');
    console.log('🔗 Токен:', token.substring(0, 20) + '...');
  };

  useEffect(() => {
    let mounted = true;

    // Функция валидации пользователя
    const handleUserValidation = async (user: SPWUser) => {
      try {
        // Проверяем наличие обязательных полей
        if (!user.hash) {
          throw new Error('Отсутствует hash пользователя');
        }
        if (!user.accountId) {
          throw new Error('Отсутствует accountId пользователя');
        }
        if (!user.username) {
          throw new Error('Отсутствует username пользователя');
        }
        if (!user.minecraftUUID) {
          throw new Error('Отсутствует minecraftUUID пользователя');
        }

        // Подготавливаем данные для валидации только с настоящими данными
        const validationData: ValidationData = {
          hash: user.hash,
          accountId: user.accountId,
          username: user.username,
          minecraftUUID: user.minecraftUUID,
          roles: user.roles || [],
          isAdmin: user.isAdmin || false,
          timestamp: user.timestamp || Date.now()
        };

        console.log('Отправляем данные для валидации:', validationData);

        // Валидируем пользователя и получаем токен
        const token = await validateUserAndSetToken(validationData);
        
        console.log('Токен авторизации получен и сохранен');
        
        // Уведомляем о получении токена
        await notifyTokenReceived(token);
        
        setSPWLoading(false);
        setSPWError(null);
      } catch (error) {
        console.error('Ошибка валидации пользователя:', error);
        setSPWError('Ошибка валидации пользователя. Попробуйте перезагрузить страницу.');
        setSPWLoading(false);
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

      // Вызываем валидацию асинхронно
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
      setSPWError(`Ошибка инициализации SPWorlds: ${message}`);
      setSPWLoading(false);
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

/**
 * Главный провайдер, который оборачивает приложение в DataPreloadProvider и SPWContent
 */
export default function SPWProvider({ children }: { children: React.ReactNode }) {
  return (
    <DataPreloadProvider>
      <SPWContent>
        {children}
      </SPWContent>
    </DataPreloadProvider>
  );
}