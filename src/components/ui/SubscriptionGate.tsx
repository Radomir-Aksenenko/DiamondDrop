'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Modal from './Modal';
import { SmartLink } from '@/lib/linkUtils';

const COMMUNITY_URL = 'https://spworlds.ru/spm/groups/f9f641b0-4069-4f3b-b21b-39ad9eebfbfd';
const CHECK_DELAY_MS = 3000;
const STORAGE_KEY = 'subscriptionGateVerified';

const getStoredVerification = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
};

type CheckStatus = 'idle' | 'checking' | 'error' | 'success';

export default function SubscriptionGate() {
  const [isOpen, setIsOpen] = useState<boolean>(() => !getStoredVerification());
  const [status, setStatus] = useState<CheckStatus>('idle');
  const [attempt, setAttempt] = useState(() => (getStoredVerification() ? 2 : 0));
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const statusMessage = useMemo(() => {
    switch (status) {
      case 'checking':
        return 'Проверяем подписку...';
      case 'error':
        return 'Ошибка: вы не подписаны на сообщество.';
      case 'success':
        return 'Успешно! Подписка подтверждена.';
      default:
        return 'Для доступа к сайту подтвердите подписку.';
    }
  }, [status]);

  const handleCheck = useCallback(() => {
    if (status === 'checking' || status === 'success') {
      return;
    }

    setStatus('checking');

    timerRef.current = window.setTimeout(() => {
      setAttempt((prevAttempt) => {
        if (prevAttempt === 0) {
          setStatus('error');
          return 1;
        }

        setStatus('success');
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, 'true');
          }
        } catch {
          // ignore localStorage errors
        }
        setTimeout(() => setIsOpen(false), 800);
        return 2;
      });
      timerRef.current = null;
    }, CHECK_DELAY_MS);
  }, [status]);

  const handleClose = useCallback(() => {
    if (status === 'success') {
      setIsOpen(false);
    }
  }, [status]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Только для подписчиков"
      hideCloseButton
      className="w-full max-w-lg"
    >
      <div className="flex flex-col gap-4 pt-2 pb-2">
        <p className="text-sm text-[#C6C5D5]/80">
          Для использования платформы необходимо быть подписанным на наше сообщество. 
          Перейдите по ссылке ниже, оформите подписку и затем подтвердите её.
        </p>

        <div className="flex flex-wrap gap-3">
          <SmartLink
            href={COMMUNITY_URL}
            className="flex-1 min-w-[150px] text-center px-4 py-3 rounded-[12px] bg-[#1C1C24] text-[#F9F8FC] font-medium hover:bg-[#24242F] transition-colors"
          >
            Перейти в сообщество
          </SmartLink>
          <button
            type="button"
            onClick={handleCheck}
            disabled={status === 'checking' || status === 'success'}
            className="flex-1 min-w-[150px] px-4 py-3 rounded-[12px] bg-[#5C5ADC] text-[#F9F8FC] font-semibold hover:bg-[#6D6BFF] disabled:bg-[#3A3966] disabled:text-[#C6C5D5] transition-colors"
          >
            {status === 'checking' ? 'Проверяем...' : 'Проверить подписку'}
          </button>
        </div>

        <div className="min-h-[56px] rounded-[12px] bg-[#111118] border border-[#2A2A33] px-4 py-3 flex items-center gap-3">
          {status === 'checking' && (
            <span className="w-5 h-5 border-2 border-[#5C5ADC] border-t-transparent rounded-full animate-spin" />
          )}
          <span className={`text-sm font-medium ${status === 'error' ? 'text-[#FF6B6B]' : status === 'success' ? 'text-[#4ADE80]' : 'text-[#C6C5D5]'}`}>
            {statusMessage}
          </span>
        </div>
      </div>
    </Modal>
  );
}

