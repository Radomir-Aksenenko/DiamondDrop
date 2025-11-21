'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/config';
import { CaseData } from './useCasesAPI';

export interface BonusCaseResponse {
  level: number;
  case: CaseData | null;
  canClaim: boolean;
  nextAvailableAt: string | null;
  hoursUntilNextClaim: number | null;
  hasLevelAccess: boolean;
  userLevel: number;
}

export default function useBonusCaseAPI(level: number | null) {
  const [bonusCase, setBonusCase] = useState<BonusCaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBonusCase = useCallback(async () => {
    if (!Number.isFinite(level)) {
      setLoading(false);
      setError('Некорректный уровень бонусного кейса');
      setBonusCase(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/bonus/cases/${level}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          ...(token ? { Authorization: token } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Бонусный кейс не найден');
        }
        throw new Error(`Ошибка бонусного кейса: ${response.status} ${response.statusText}`);
      }

      const data: BonusCaseResponse = await response.json();
      setBonusCase(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить бонусный кейс';
      setError(message);
      setBonusCase(null);
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    if (Number.isFinite(level)) {
      fetchBonusCase();
    }
  }, [level, fetchBonusCase]);

  return {
    bonusCase,
    loading,
    error,
    refresh: fetchBonusCase,
  };
}


