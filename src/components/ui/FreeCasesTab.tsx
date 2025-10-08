'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from './Modal';

type FreeCaseTier = {
  level: number;
  id: string; // stable id for storage
  title: string;
  imageUrl?: string | null;
};

type Props = {
  userId?: string;
  level: number;
};

type OpenState = 'locked' | 'available' | 'cooldown';

type StoredOpenInfo = {
  lastOpenAt: number; // epoch ms
};

const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function getStorageKey(userId: string | undefined) {
  return `dd:free-cases:${userId ?? 'guest'}`;
}

function readStorage(userId: string | undefined): Record<string, StoredOpenInfo> {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Record<string, StoredOpenInfo>;
    return {};
  } catch {
    return {};
  }
}

function writeStorage(userId: string | undefined, data: Record<string, StoredOpenInfo>) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
  } catch {}
}

function getOpenState(info: StoredOpenInfo | undefined): { state: OpenState; msLeft: number } {
  if (!info) return { state: 'available', msLeft: 0 };
  const now = Date.now();
  const delta = now - info.lastOpenAt;
  if (delta >= DAILY_COOLDOWN_MS) return { state: 'available', msLeft: 0 };
  return { state: 'cooldown', msLeft: DAILY_COOLDOWN_MS - delta };
}

function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

const TIERS: FreeCaseTier[] = [2, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((lvl) => ({
  level: lvl,
  id: `level-${lvl}`,
  title: `LEVEL ${lvl}`,
  imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
}));

export default function FreeCasesTab({ userId, level }: Props) {
  const [now, setNow] = useState(Date.now());
  const [infoBannerTierId, setInfoBannerTierId] = useState<string | null>(null);
  const infoLevel = useMemo(() => {
    const tier = TIERS.find(t => t.id === infoBannerTierId);
    return tier?.level;
  }, [infoBannerTierId]);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const storage = useMemo(() => readStorage(userId), [userId, now]);

  const handleOpen = useCallback((tierId: string) => {
    // Here you can integrate real API call to open a free case.
    // For now we only set cooldown locally.
    const next = { ...readStorage(userId), [tierId]: { lastOpenAt: Date.now() } };
    writeStorage(userId, next);
    // Optional: simple feedback
    try { window?.alert?.('Кейс открыт! Возвращайтесь через 24 часа.'); } catch {}
    setNow(Date.now());
  }, [userId]);

  const handleShowLockedInfo = useCallback((tierId: string) => {
    setInfoBannerTierId(tierId);
  }, []);

  const handleHideLockedInfo = useCallback(() => {
    setInfoBannerTierId(null);
  }, []);

  return (
    <div className='flex flex-col gap-2 w-full'>
      <Modal isOpen={Boolean(infoBannerTierId)} onClose={handleHideLockedInfo} title='Кейс заблокирован'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-start gap-2 rounded-xl bg-[#19191D] border border-[#2A2A3A] p-3'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className='text-[#E74A4A] shrink-0 mt-[2px]'>
              <path d='M12 9v4' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
              <path d='M12 16.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z' fill='currentColor'/>
              <path d='M12 3 2 21h20L12 3Z' stroke='currentColor' strokeWidth='2' strokeLinejoin='round'/>
            </svg>
            <div className='text-[#F9F8FC] font-actay-wide text-sm opacity-90'>
              {`Этот бесплатный кейс доступен с уровня ${infoLevel ?? '-'} . Когда достигнете уровня, сможете открывать его 1 раз в день.`}
            </div>
          </div>
          <div className='flex justify-end'>
            <button 
              onClick={handleHideLockedInfo}
              className='flex h-[36px] px-[12px] py-[8px] justify-center items-center gap-[10px] rounded-[8px] bg-[#5C5ADC] hover:bg-[#4A48B8] transition-colors cursor-pointer'
            >
              <p className='text-[#F9F8FC] font-"Actay_Wide" text-base font-bold leading-normal'>Понятно</p>
            </button>
          </div>
        </div>
      </Modal>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full'>
        {TIERS.map((tier) => {
          const reached = level >= tier.level;
          const stateInfo = getOpenState(storage[tier.id]);
          const state: OpenState = reached ? stateInfo.state : 'locked';
          return (
            <div key={tier.id} className='relative flex flex-col items-center w-full h-[220px] p-3 rounded-[12px] bg-[#151519] border border-[#19191D]'>
              <div className='w-full flex items-start justify-center overflow-hidden mb-2 pt-1'>
                <p className='text-center text-[#F9F8FC] font-actay font-bold leading-tight w-full text-base'>
                  {`LEVEL ${tier.level}`}
                </p>
              </div>
              <div className='flex-1 flex items-center justify-center w-full min-h-0 mb-2'>
                {tier.imageUrl ? (
                  <img src={tier.imageUrl} alt={tier.title} className='w-[120px] h-[120px] object-contain rounded-lg' />
                ) : (
                  <div className='w-[120px] h-[120px] bg-[#2A2A3A] rounded-lg' />
                )}
              </div>
              {state === 'available' && (
                <button
                  onClick={() => handleOpen(tier.id)}
                  className='w-full h-9 rounded-lg bg-[#5C5ADC] text-white font-actay-wide text-sm font-bold hover:brightness-110 transition-colors'
                >
                  Бесплатно
                </button>
              )}
              {state === 'cooldown' && (
                <button
                  className='w-full h-9 rounded-lg bg-[#F9F8FC]/[0.08] text-[#F9F8FC] font-actay-wide text-sm font-bold cursor-not-allowed'
                  disabled
                >
                  {formatMs(getOpenState(storage[tier.id]).msLeft)}
                </button>
              )}
              {state === 'locked' && (
                <button
                  onClick={() => handleShowLockedInfo(tier.id)}
                  className='w-full h-9 rounded-lg bg-[#F9F8FC]/[0.08] text-[#F9F8FC] font-actay-wide text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed leading-none'
                  aria-disabled='true'
                >
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className='opacity-70 shrink-0'>
                    <path d='M17 8V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V8' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                    <rect x='5' y='8' width='14' height='12' rx='2' stroke='currentColor' strokeWidth='2'/>
                  </svg>
                  <span className='leading-none'>{`LVL ${tier.level}`}</span>
                </button>
              )}

              {/* Inline info panel removed in favor of top-of-screen banner */}
            </div>
          );
        })}
      </div>
    </div>
  );
}


