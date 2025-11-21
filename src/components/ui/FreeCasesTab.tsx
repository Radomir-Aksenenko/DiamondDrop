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

interface BonusCaseCardProps {
  tier: BonusCaseTier;
  userLevel: number;
  currentTime: number;
  onOpen: (lvl: number) => void;
  onShowLockedInfo: (id: string) => void;
}

const BonusCaseCard = ({ tier, userLevel, currentTime, onOpen, onShowLockedInfo }: BonusCaseCardProps) => {
  const caseImage = tier.case?.imageUrl ?? '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png';

  let state: OpenState = 'locked';
  let msLeft = 0;

  if (userLevel >= tier.level) {
    if (tier.canClaim) {
      state = 'available';
    } else {
      state = 'cooldown';
      msLeft = getMsLeft(tier, currentTime);
    }
  }

  const handleClick = () => {
    if (state === 'available') {
      onOpen(tier.level);
    } else if (state === 'locked') {
      onShowLockedInfo(tier.id);
    }
  };

  return (
    <div className="group relative flex flex-col w-full bg-[#151519] rounded-2xl border border-[#2A2A3A] overflow-hidden hover:border-[#5C5ADC]/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(92,90,220,0.15)]">
      {/* Background Gradient Effect */}
      <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-[#5C5ADC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative flex flex-col items-center p-5 z-10 h-full">
        {/* Level Badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg border text-[10px] font-actay-wide font-bold backdrop-blur-sm transition-colors duration-300
          ${state === 'locked'
            ? 'bg-[#1F1F25]/80 border-[#2A2A3A] text-[#F9F8FC]/40'
            : 'bg-[#5C5ADC]/10 border-[#5C5ADC]/20 text-[#5C5ADC]'
          }
        `}>
          LVL {tier.level}
        </div>

        {/* Image Area */}
        <div className="relative w-full aspect-square max-w-[140px] flex items-center justify-center my-4 group-hover:scale-105 transition-transform duration-500 ease-out">
          {/* Glow behind image */}
          <div className={`absolute inset-0 bg-[#5C5ADC]/20 blur-3xl rounded-full transition-opacity duration-500
             ${state === 'available' ? 'opacity-40' : 'opacity-0 group-hover:opacity-30'}
           `} />
          <img
            src={caseImage}
            alt={tier.case?.name || `Level ${tier.level}`}
            className={`relative w-full h-full object-contain drop-shadow-2xl transition-all duration-300
               ${state === 'locked' ? 'grayscale opacity-50' : ''}
             `}
          />
        </div>

        {/* Case Name */}
        <div className="w-full text-center mb-5 mt-auto">
          <h3 className="text-[#F9F8FC] font-actay font-bold text-lg leading-tight truncate px-2">
            {tier.case?.name || `Кейс уровня ${tier.level}`}
          </h3>
          {tier.case?.description && (
            <p className="text-[#F9F8FC]/40 text-xs font-actay-wide mt-1.5 truncate px-4">
              {tier.case.description}
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleClick}
          disabled={state === 'cooldown'}
          className={`
            w-full h-[46px] rounded-xl flex items-center justify-center
            font-actay-wide text-sm font-bold transition-all duration-300 relative overflow-hidden
            ${state === 'available'
              ? 'bg-[#5C5ADC] hover:bg-[#4A48B8] text-white shadow-[0_0_20px_-5px_#5C5ADC] hover:shadow-[0_0_25px_-5px_#5C5ADC] cursor-pointer translate-y-0'
              : state === 'cooldown'
                ? 'bg-[#1A1A20] text-[#F9F8FC]/50 border border-[#2A2A3A] cursor-not-allowed'
                : 'bg-[#1A1A20] text-[#F9F8FC]/30 border border-[#2A2A3A] hover:border-[#3A3A4A] cursor-pointer'
            }
          `}
        >
          {state === 'available' && (
            <span className="relative z-10">Открыть</span>
          )}

          {state === 'cooldown' && (
            <span className="relative z-10 font-mono tabular-nums tracking-wider">
              {msLeft > 0 ? formatMs(msLeft) : '...'}
            </span>
          )}

          {state === 'locked' && (
            <span className="relative z-10 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
                <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              LVL {tier.level}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

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
              <path d='M12 9v4' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
              <path d='M12 16.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z' fill='currentColor' />
              <path d='M12 3 2 21h20L12 3Z' stroke='currentColor' strokeWidth='2' strokeLinejoin='round' />
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

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full'>
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

        {tiers.map((tier) => (
          <BonusCaseCard
            key={tier.id}
            tier={tier}
            userLevel={level}
            currentTime={currentTime}
            onOpen={handleOpen}
            onShowLockedInfo={handleShowLockedInfo}
          />
        ))}
      </div>
    </div>
  );
}
