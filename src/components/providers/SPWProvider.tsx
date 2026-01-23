'use client';

import { useEffect, useState } from 'react';
import spw from '@/lib/spw';
import { SPWUser } from '@/types/spw';
import { validateUserAndSetToken, ValidationData, setAuthToken } from '@/lib/auth';
import { isDevelopment, DEV_CONFIG } from '@/lib/config';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ExternalLoginScreen from '@/components/ui/ExternalLoginScreen';
import DataPreloadProvider, { usePreloadedData } from './DataPreloadProvider';

/**
 * Внутренний компонент, который использует предзагруженные данные
 */
function SPWContent({ children }: { children: React.ReactNode }) {
  const { loading: dataLoading, error: dataError } = usePreloadedData();
  const [spwLoading, setSPWLoading] = useState(true);
  const [spwError, setSPWError] = useState<string | null>(null);
  const [showExternalLogin, setShowExternalLogin] = useState(false);

  // Общее состояние загрузки (SPW + данные)
  const isLoading = spwLoading || dataLoading;
  const error = spwError || dataError;

  /**
   * Уведомляет о получении токена (данные загрузятся автоматически через DataPreloadProvider)
   */
  const notifyTokenReceived = async () => {
    // Информационное логирование удалено
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

        // Валидируем пользователя и получаем токен
        await validateUserAndSetToken(validationData);

        // Уведомляем о получении токена
        await notifyTokenReceived();

        // Ждем небольшую задержку чтобы DataPreloadProvider успел начать загрузку
        await new Promise(resolve => setTimeout(resolve, 100));

        setSPWLoading(false);
        setSPWError(null);
      } catch (error) {
        console.error('User validation error:', error);
        setSPWError('Ошибка валидации пользователя. Попробуйте перезагрузить страницу.');
        setSPWLoading(false);
      }
    };

    // В dev режиме пропускаем инициализацию SPW и сразу переходим к валидации
    if (isDevelopment && DEV_CONFIG.skipAuth) {

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

    // Проверка на запуск вне iframe (если не сработал skipAuth)
    try {
      if (typeof window !== 'undefined' && window.self === window.top) {
        // Проверяем сохраненный токен в localStorage
        const savedToken = localStorage.getItem('dd_auth_token');
        if (savedToken) {
          setAuthToken(savedToken);
          setSPWLoading(false);
          return;
        }

        setShowExternalLogin(true);
        setSPWLoading(false);
        return;
      }
    } catch (e) {
      console.error('Error checking iframe status:', e);
    }

    // Инициализация SPWMini
    spw.initialize();

    // Обработчики событий
    const handleReady = () => {
      if (!mounted) return;

      // Не вызываем валидацию здесь, так как она будет вызвана в handleInitResponse
      // if (spw.user) {
      //   await handleUserValidation(spw.user);
      // }
    };

    const handleInitResponse = async (user: SPWUser) => {
      if (!mounted) return;

      await handleUserValidation(user);
    };

    const handleInitError = (message: string) => {
      if (!mounted) return;

      console.error(`Login error: ${message}`);
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

  const handleTokenSubmit = (token: string) => {
    // Сохраняем токен в localStorage для повторных входов
    localStorage.setItem('dd_auth_token', token);

    setAuthToken(token);
    setShowExternalLogin(false);
    // DataPreloadProvider автоматически подхватит токен и начнет загрузку
  };

  if (showExternalLogin) {
    return <ExternalLoginScreen onTokenSubmit={handleTokenSubmit} />;
  }

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