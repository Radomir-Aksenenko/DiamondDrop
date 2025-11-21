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



  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Только для подписчиков"
      hideCloseButton
      className="w-full max-w-md"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[#C6C5D5]/80">
          Для доступа к сайту необходимо подписаться на наше сообщество.
        </p>

        <div className="min-h-[52px] rounded-lg bg-[#19191D] px-4 py-3 flex items-center gap-3">
          {status === 'checking' && (
            <span className="w-4 h-4 border-2 border-[#5C5ADC] border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <span className={`text-sm font-medium ${status === 'error' ? 'text-[rgb(255,68,68)]' : status === 'success' ? 'text-[#11ab47]' : 'text-[#C6C5D5]'}`}>
            {statusMessage}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SmartLink
            href={COMMUNITY_URL}
            className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#19191D] text-[#F9F8FC] font-bold hover:bg-[#1E1E23] transition-colors text-center cursor-pointer"
          >
            Перейти
          </SmartLink>
          <button
            type="button"
            onClick={handleCheck}
            disabled={status === 'checking' || status === 'success'}
            className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#5C5ADC] text-[#F9F8FC] font-bold hover:bg-[#4A48B0] disabled:bg-[#5C5ADC]/50 disabled:cursor-not-allowed transition-colors text-center cursor-pointer"
          >
            {status === 'checking' ? 'Проверка...' : 'Проверить'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

