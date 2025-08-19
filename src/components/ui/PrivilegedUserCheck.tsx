'use client';

import { usePreloadedData } from '@/components/providers/DataPreloadProvider';

// Список привилегированных пользователей
const PRIVILEGED_USERS = ['megatntmega', 'fupir', 'rafael1209'];

// В Dev режиме автоматически предоставляем привилегии
const isDevelopmentMode = process.env.NODE_ENV === 'development';

/**
 * Компонент для проверки привилегированных пользователей
 * Используется для условного отображения контента или функций
 */
interface PrivilegedUserCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PrivilegedUserCheck({ children, fallback = null }: PrivilegedUserCheckProps) {
  const { user } = usePreloadedData();
  const userName = user?.nickname;
  
  const isPrivilegedUser = userName && (isDevelopmentMode || PRIVILEGED_USERS.includes(userName));
  
  return isPrivilegedUser ? <>{children}</> : <>{fallback}</>;
}

/**
 * Хук для проверки привилегированного пользователя
 */
export function usePrivilegedUser() {
  const { user } = usePreloadedData();
  const userName = user?.nickname;
  
  const isPrivilegedUser = userName && (isDevelopmentMode || PRIVILEGED_USERS.includes(userName));
  
  return {
    isPrivilegedUser,
    userName,
    privilegedUsers: PRIVILEGED_USERS
  };
}

export default PrivilegedUserCheck;