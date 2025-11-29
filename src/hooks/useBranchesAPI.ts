'use client';

import { useState, useEffect } from 'react';
import { getAuthToken, hasAuthToken } from '@/lib/auth';
import { API_ENDPOINTS, DEV_CONFIG, isDevelopment } from '@/lib/config';

interface Coordinates {
  overworld: {
    x: number;
    y: number;
    z: number;
  };
  the_nether: {
    color: string;
    distance: number;
  };
}

export interface Branch {
  id: string;
  name: string;
  description: string | null;
  coordinates: Coordinates;
  imageUrls: string[];
}

export interface BranchForDisplay {
  id: string;
  name: string;
  coordinates: string;
}

const useBranchesAPI = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenState, setTokenState] = useState<string | null>(getAuthToken());

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      // В dev режиме используем мок данные
      if (isDevelopment && DEV_CONFIG.skipAuth) {
        setBranches([]);
        setLoading(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setBranches([]);
        setLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.branches, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
      }

      const data: Branch[] = await response.json();
      setBranches(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке филиалов';
      setError(errorMessage);
      console.error('Error loading branches:', errorMessage);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const getBranchesForDisplay = (): BranchForDisplay[] => {
    return branches.map((branch: Branch) => {
      const color = branch.coordinates.the_nether.color.toLowerCase();
      const distance = branch.coordinates.the_nether.distance;

      let prefix = '';
      switch (color) {
        case 'green':
          prefix = 'зв';
          break;
        case 'yellow':
          prefix = 'жв';
          break;
        case 'red':
          prefix = 'кв';
          break;
        case 'blue':
          prefix = 'св';
          break;
        default:
          prefix = 'нв';
      }

      return {
        id: branch.id,
        name: branch.name,
        coordinates: `${prefix} ${distance}`
      };
    });
  };

  const refreshBranches = () => {
    fetchBranches();
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Отслеживаем изменения токена
  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      const currentToken = getAuthToken();
      if (currentToken !== tokenState) {
        setTokenState(currentToken);
        fetchBranches();
      }
    }, 1000);

    return () => clearInterval(checkTokenInterval);
  }, [tokenState]);

  return {
    branches,
    branchesForDisplay: getBranchesForDisplay(),
    loading,
    error,
    refreshBranches,
    isAuthenticated: hasAuthToken(),
  };
};

export default useBranchesAPI;