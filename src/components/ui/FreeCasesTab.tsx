'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth';
import { API_ENDPOINTS } from '@/lib/config';
import Modal from './Modal';

type BonusCaseInfo = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
};

type BonusCaseTier = {
  id: string;
  level: number;
  case: BonusCaseInfo | null;
  canClaim: boolean;
  nextAvailableAt: string | null;
  hoursUntilNextClaim: number | null;
};

type Props = {
  userId?: string;
  level: number;
};

type OpenState = 'locked' | 'available' | 'cooldown';

function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function getMsLeft(tier: BonusCaseTier, now: number): number {
  if (tier.nextAvailableAt) {
    const nextAt = new Date(tier.nextAvailableAt).getTime();
    return Math.max(0, nextAt - now);
  }
  if (typeof tier.hoursUntilNextClaim === 'number') {
    return Math.max(0, Math.round(tier.hoursUntilNextClaim * 60 * 60 * 1000));
  }
  return 0;
}

export default function FreeCasesTab({ userId, level }: Props) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [tiers, setTiers] = useState<BonusCaseTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoBannerTierId, setInfoBannerTierId] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const router = useRouter();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const i = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const fetchBonusCases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(API_ENDPOINTS.bonusCases, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          ...(token ? { Authorization: token } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки бонусных кейсов: ${response.status}`);
      }

      const data: Omit<BonusCaseTier, 'id'>[] = await response.json();
      const normalized = (Array.isArray(data) ? data : []).map((tier) => ({
        ...tier,
        id: tier.case?.id ?? `level-${tier.level}`,
      }));

      if (!isMountedRef.current) return;
      setTiers(normalized);
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Не удалось загрузить бонусные кейсы';
      setError(message);
      console.error('[FreeCasesTab] Failed to load bonus cases:', err);
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBonusCases();
  }, [fetchBonusCases, userId]);

  const infoLevel = useMemo(() => {
    const tier = tiers.find(t => t.id === infoBannerTierId);
    return tier?.level;
  }, [infoBannerTierId, tiers]);

  const handleOpen = useCallback((tierLevel: number) => {
    router.push(`/bonus-case/${tierLevel}`);
  }, [router]);

  const handleShowLockedInfo = useCallback((tierId: string) => {
    setInfoBannerTierId(tierId);
  }, []);

  const handleHideLockedInfo = useCallback(() => {
    setInfoBannerTierId(null);
  }, []);

  return (
    <div className='flex flex-col gap-3 w-full'>
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

      {error && (
        <div className='flex flex-col gap-3 rounded-xl border border-[#442323] bg-[#1F1515] p-4'>
          <p className='text-[#F9F8FC] font-actay-wide text-sm'>
            {error}
          </p>
          <button
            onClick={fetchBonusCases}
            className='w-fit rounded-lg bg-[#5C5ADC] px-4 py-2 text-sm font-actay-wide font-bold text-white hover:brightness-110 transition-colors cursor-pointer'
          >
            Повторить попытку
          </button>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full'>
        {loading && tiers.length === 0 && (
          <div className='col-span-full rounded-lg border border-[#19191D] bg-[#151519] p-4 text-center text-[#F9F8FC]/70 font-actay-wide text-sm'>
            Загружаем бонусные кейсы...
          </div>
        )}

        {!loading && tiers.length === 0 && !error && (
          <div className='col-span-full rounded-lg border border-[#19191D] bg-[#151519] p-4 text-center text-[#F9F8FC]/70 font-actay-wide text-sm'>
            Бонусные кейсы не найдены.
          </div>
        )}

        {tiers.map((tier) => {
          const caseImage = tier.case?.imageUrl ?? '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png';
          let state: OpenState = 'locked';
          let msLeft = 0;

          if (level >= tier.level) {
            if (tier.canClaim) {
              state = 'available';
            } else {
              state = 'cooldown';
              msLeft = getMsLeft(tier, currentTime);
            }
          }

          return (
            <div key={tier.id} className='relative flex flex-col items-center w-full h-[240px] p-3 rounded-[12px] bg-[#151519] border border-[#19191D]'>
              <div className='w-full flex flex-col items-center justify-center overflow-hidden mb-2 pt-1 text-center'>
                <p className='text-[#F9F8FC] font-actay font-bold leading-tight w-full text-base'>
                  {`LEVEL ${tier.level}`}
                </p>
                {tier.case?.name && (
                  <span className='text-[#F9F8FC]/70 font-actay-wide text-xs truncate w-full'>
                    {tier.case.name}
                  </span>
                )}
              </div>
              <div className='flex-1 flex items-center justify-center w-full min-h-0 mb-2'>
                {caseImage ? (
                  <img src={caseImage} alt={tier.case?.name ?? `LEVEL ${tier.level}`} className='w-[120px] h-[120px] object-contain rounded-lg' />
                ) : (
                  <div className='w-[120px] h-[120px] bg-[#2A2A3A] rounded-lg' />
                )}
              </div>
              <button
                onClick={() => handleOpen(tier.level)}
                className='w-full h-9 rounded-lg bg-[#5C5ADC] text-white font-actay-wide text-sm font-bold hover:brightness-110 transition-colors'
              >
                Подробнее
              </button>

              {state !== 'available' && (
                <div className='w-full text-center text-xs font-actay-wide text-[#F9F8FC]/60 mt-1'>
                  {state === 'cooldown'
                    ? (msLeft > 0 ? `Доступно через ${formatMs(msLeft)}` : 'Скоро откроется')
                    : `Доступно с уровня ${tier.level}`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


