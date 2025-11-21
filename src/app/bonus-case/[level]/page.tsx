'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';
import { getAuthToken } from '@/lib/auth';

type BonusCaseItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  amount: number;
  price: number;
  percentChance: number;
  rarity: string;
  stackAmount: number | null;
  isWithdrawable: boolean;
};

type BonusCaseResponse = {
  level: number;
  case: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    items?: BonusCaseItem[];
  } | null;
  canClaim: boolean;
  nextAvailableAt: string | null;
  hoursUntilNextClaim: number | null;
  hasLevelAccess: boolean;
  userLevel: number;
};

export default function BonusCasePage() {
  const params = useParams();
  const router = useRouter();
  const levelParam = Array.isArray(params?.level) ? params.level[0] : params?.level;
  const level = useMemo(() => Number(levelParam), [levelParam]);

  const [data, setData] = useState<BonusCaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<BonusCaseItem[] | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const fetchBonusCase = useCallback(async () => {
    if (!Number.isFinite(level)) {
      setError('Некорректный уровень бонусного кейса');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setClaimResult(null);
    setClaimError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/bonus/cases/${level}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          ...(token ? { Authorization: token } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Не удалось загрузить бонусный кейс уровня ${level}`);
      }

      const payload: BonusCaseResponse = await response.json();
      setData(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка при загрузке бонусного кейса';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    fetchBonusCase();
  }, [fetchBonusCase]);

  const handleClaim = useCallback(async () => {
    if (!data?.canClaim || !data?.hasLevelAccess) return;

    setClaiming(true);
    setClaimResult(null);
    setClaimError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/bonus/claim/${level}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          ...(token ? { Authorization: token } : {}),
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = payload?.error ?? 'Не удалось получить бонусный кейс';
        throw new Error(message);
      }

      const rewards: BonusCaseItem[] = Array.isArray(payload) ? payload : (payload ? [payload] : []);
      setClaimResult(rewards);
      fetchBonusCase();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка при получении бонусного кейса';
      setClaimError(message);
    } finally {
      setClaiming(false);
    }
  }, [data?.canClaim, data?.hasLevelAccess, fetchBonusCase, level]);

  const canOpen = Boolean(data?.canClaim && data?.hasLevelAccess);

  return (
    <div className='min-h-screen bg-[#0D0D10] px-4 py-6'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-1'>
            <button
              onClick={() => router.back()}
              className='w-fit text-sm text-[#F9F8FC]/60 hover:text-[#F9F8FC] font-actay-wide transition-colors cursor-pointer'
              type='button'
            >
              ← Назад
            </button>
            <h1 className='text-2xl font-unbounded text-[#F9F8FC]'>
              Бонусный кейс {Number.isFinite(level) ? `LVL ${level}` : ''}
            </h1>
          </div>
          <Link
            href='/profile?tab=freeCases'
            className='rounded-lg border border-[#2A2A3A] px-4 py-2 text-sm font-actay-wide text-[#F9F8FC]/70 hover:text-white transition-colors'
          >
            К бонусам
          </Link>
        </div>

        {loading && (
          <div className='rounded-xl border border-[#19191D] bg-[#151519] p-6 text-center text-[#F9F8FC]/70 font-actay-wide'>
            Загружаем бонусный кейс...
          </div>
        )}

        {!loading && error && (
          <div className='rounded-xl border border-[#442323] bg-[#1F1515] p-6 flex flex-col gap-4'>
            <p className='text-[#F9F8FC] font-actay-wide'>{error}</p>
            <button
              onClick={fetchBonusCase}
              className='w-fit rounded-lg bg-[#5C5ADC] px-4 py-2 text-sm font-actay-wide font-bold text-white hover:brightness-110 transition-colors cursor-pointer'
            >
              Повторить попытку
            </button>
          </div>
        )}

        {!loading && !error && data?.case && (
          <>
            <div className='grid grid-cols-1 gap-4 rounded-xl border border-[#19191D] bg-[#151519] p-6 md:grid-cols-[320px,1fr]'>
              <div className='flex flex-col items-center gap-4 text-center md:text-left'>
                <img
                  src={data.case.imageUrl ?? '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png'}
                  alt={data.case.name}
                  className='h-48 w-48 rounded-2xl object-contain border border-[#2A2A3A] bg-[#0F0F13]'
                />
                <div className='flex flex-col gap-1'>
                  <p className='text-[#F9F8FC] font-unbounded text-xl'>{data.case.name}</p>
                  {data.case.description && (
                    <p className='text-[#F9F8FC]/70 font-actay-wide text-sm'>{data.case.description}</p>
                  )}
                  <p className='text-[#F9F8FC]/80 font-actay-wide text-sm'>
                    Цена: {data.case.price ?? 0} ₽
                  </p>
                </div>
                <div className='flex flex-col gap-2 w-full'>
                  <button
                    onClick={handleClaim}
                    disabled={!canOpen || claiming}
                    className={`h-11 rounded-lg font-actay-wide text-base font-bold transition-colors ${
                      canOpen
                        ? 'bg-[#5C5ADC] text-white hover:brightness-110 cursor-pointer'
                        : 'bg-[#F9F8FC]/10 text-[#F9F8FC]/60 cursor-not-allowed'
                    }`}
                  >
                    {claiming ? 'Получаем...' : 'Открыть бонусный кейс'}
                  </button>
                  {!data.hasLevelAccess && (
                    <p className='text-xs font-actay-wide text-[#E9A23B]'>
                      Кейс доступен с уровня {data.level}. Ваш уровень: {data.userLevel}.
                    </p>
                  )}
                  {data.hasLevelAccess && !data.canClaim && (
                    <p className='text-xs font-actay-wide text-[#F9F8FC]/60'>
                      Кейс будет доступен позже. Проверьте через несколько часов.
                    </p>
                  )}
                  {claimError && (
                    <p className='text-xs font-actay-wide text-[#E74A4A]'>{claimError}</p>
                  )}
                </div>
              </div>

              <div className='rounded-xl border border-[#19191D] bg-[#0F0F13] p-4'>
                <p className='text-[#F9F8FC] font-actay-wide text-base mb-3'>
                  Содержимое кейса
                </p>
                {data.case.items && data.case.items.length > 0 ? (
                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    {data.case.items.map((item) => (
                      <div key={item.id} className='flex gap-3 rounded-lg border border-[#1F1F27] bg-[#14141A] p-3'>
                        <img
                          src={item.imageUrl ?? '/Frame116.svg'}
                          alt={item.name}
                          className='h-14 w-14 rounded-lg object-cover border border-[#2A2A3A]'
                        />
                        <div className='flex flex-col gap-1'>
                          <p className='text-[#F9F8FC] font-actay-wide text-sm'>{item.name}</p>
                          {item.description && (
                            <p className='text-xs text-[#F9F8FC]/60 font-actay-wide line-clamp-2'>
                              {item.description}
                            </p>
                          )}
                          <p className='text-xs text-[#9BE28A] font-actay-wide'>
                            Шанс: {item.percentChance.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-[#F9F8FC]/60 font-actay-wide'>
                    Содержимое кейса отсутствует.
                  </p>
                )}
              </div>
            </div>

            {claimResult && (
              <div className='rounded-xl border border-[#1F2C23] bg-[#12201A] p-6 flex flex-col gap-4'>
                <p className='text-[#9BE28A] font-actay-wide text-base'>
                  Вы получили:
                </p>
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
                  {claimResult.map((reward) => (
                    <div key={reward.id} className='flex gap-3 rounded-lg border border-[#1F1F27] bg-[#14141A] p-3'>
                      <img
                        src={reward.imageUrl ?? '/Frame116.svg'}
                        alt={reward.name}
                        className='h-14 w-14 rounded-lg object-cover border border-[#2A2A3A]'
                      />
                      <div className='flex flex-col gap-1'>
                        <p className='text-[#F9F8FC] font-actay-wide text-sm'>{reward.name}</p>
                        {reward.description && (
                          <p className='text-xs text-[#F9F8FC]/70 font-actay-wide line-clamp-2'>
                            {reward.description}
                          </p>
                        )}
                        <p className='text-xs text-[#9BE28A] font-actay-wide'>
                          Количество: {reward.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


