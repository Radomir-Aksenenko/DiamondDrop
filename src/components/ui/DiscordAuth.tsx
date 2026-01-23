'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/config';
import { setAuthToken } from '@/lib/auth';

interface DiscordAuthProps {
  onAuthSuccess?: () => void;
}

/**
 * Компонент для авторизации через Discord
 */
export default function DiscordAuth({ onAuthSuccess }: DiscordAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'discord' | 'token'>('discord');
  const [tokenInput, setTokenInput] = useState('');

  // Проверяем, есть ли код авторизации в URL (callback от Discord)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError('Ошибка авторизации через Discord. Попробуйте еще раз.');
      // Очищаем URL от параметров ошибки
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (code) {
      handleDiscordCallback(code);
    }
  }, []);

  const handleDiscordCallback = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Отправляем код на сервер для обмена на токен
      const response = await fetch(`${API_BASE_URL}/auth/discord/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
        throw new Error(errorData.error || `Ошибка авторизации: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.authToken) {
        setAuthToken(data.authToken);
        
        // Очищаем URL от параметров авторизации
        window.history.replaceState({}, '', window.location.pathname);
        
        // Небольшая задержка для применения токена
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Вызываем callback успешной авторизации
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          // Перезагружаем страницу для применения авторизации
          window.location.reload();
        }
      } else {
        throw new Error('Токен авторизации не получен');
      }
    } catch (err) {
      console.error('Discord auth error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка авторизации через Discord');
      setIsLoading(false);
      
      // Очищаем URL от параметров
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleDiscordLogin = () => {
    setIsLoading(true);
    setError(null);

    // Получаем текущий URL для redirect_uri
    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    
    // Формируем URL для авторизации через Discord
    // Предполагаем, что на сервере есть endpoint /auth/discord, который перенаправит на Discord OAuth
    const authUrl = `${API_BASE_URL}/auth/discord?redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    // Перенаправляем на авторизацию
    window.location.href = authUrl;
  };

  const handleTokenSubmit = () => {
    if (!tokenInput.trim()) {
      setError('Введите токен');
      return;
    }

    // Сохраняем токен и сразу перезагружаем страницу
    const token = tokenInput.trim();
    setAuthToken(token);
    
    // Перезагружаем страницу для применения авторизации
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-[#0D0D11] flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6 p-8 bg-[#F9F8FC]/[0.05] rounded-xl border border-[#F9F8FC]/[0.1] max-w-md w-full mx-4"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#5865F2] flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C2.451 6.018 1.98 7.658 1.757 9.285a.082.082 0 0 0 .031.084a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.084c-.227-1.632-.694-3.267-1.893-4.888a.06.06 0 0 0-.031-.03zM8.02 15.33a1.125 1.125 0 0 1-1.069-1.236a1.125 1.125 0 1 1 2.138.488a1.125 1.125 0 0 1-1.069.748zm7.974 0a1.125 1.125 0 0 1-1.068-1.236a1.125 1.125 0 1 1 2.138.488a1.125 1.125 0 0 1-1.07.748z" />
            </svg>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-unbounded font-medium text-[#F9F8FC] mb-2">
              Авторизация через Discord
            </h1>
            <p className="text-[#F9F8FC]/60 font-actay-wide text-sm">
              Для доступа к сайту необходимо авторизоваться через Discord
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-3 bg-[#E74A4A]/20 border border-[#E74A4A]/30 rounded-lg"
          >
            <p className="text-[#E74A4A] text-sm font-actay-wide text-center">
              {error}
            </p>
          </motion.div>
        )}

        {/* Переключатель режима авторизации */}
        <div className="flex items-center gap-2 w-full p-1 bg-[#F9F8FC]/[0.05] rounded-lg">
          <button
            onClick={() => {
              setAuthMode('discord');
              setError(null);
            }}
            className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 ${
              authMode === 'discord'
                ? 'bg-[#5865F2] text-white'
                : 'text-[#F9F8FC]/60 hover:text-[#F9F8FC]'
            }`}
          >
            <span className="font-unbounded text-sm font-medium">Discord</span>
          </button>
          <button
            onClick={() => {
              setAuthMode('token');
              setError(null);
            }}
            className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 ${
              authMode === 'token'
                ? 'bg-[#5865F2] text-white'
                : 'text-[#F9F8FC]/60 hover:text-[#F9F8FC]'
            }`}
          >
            <span className="font-unbounded text-sm font-medium">Токен</span>
          </button>
        </div>

        {authMode === 'discord' ? (
          <motion.button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#5865F2]/50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white font-unbounded font-medium">
                  Авторизация...
                </span>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C2.451 6.018 1.98 7.658 1.757 9.285a.082.082 0 0 0 .031.084a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.084c-.227-1.632-.694-3.267-1.893-4.888a.06.06 0 0 0-.031-.03zM8.02 15.33a1.125 1.125 0 0 1-1.069-1.236a1.125 1.125 0 1 1 2.138.488a1.125 1.125 0 0 1-1.069.748zm7.974 0a1.125 1.125 0 0 1-1.068-1.236a1.125 1.125 0 1 1 2.138.488a1.125 1.125 0 0 1-1.07.748z" />
                </svg>
                <span className="text-white font-unbounded font-medium text-lg">
                  Войти через Discord
                </span>
              </>
            )}
          </motion.button>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-[#F9F8FC]/60 font-actay-wide text-xs">
                Вставьте токен авторизации
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tokenInput.trim()) {
                    handleTokenSubmit();
                  }
                }}
                placeholder="Введите токен..."
                className="w-full px-4 py-3 bg-[#F9F8FC]/[0.05] border border-[#F9F8FC]/[0.1] rounded-lg text-[#F9F8FC] font-actay-wide text-sm placeholder:text-[#F9F8FC]/30 focus:outline-none focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
            </div>
            <motion.button
              onClick={handleTokenSubmit}
              disabled={!tokenInput.trim()}
              className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#5865F2]/50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              whileHover={tokenInput.trim() ? { scale: 1.02 } : {}}
              whileTap={tokenInput.trim() ? { scale: 0.98 } : {}}
            >
              <span className="text-white font-unbounded font-medium text-lg">
                Применить токен
              </span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

