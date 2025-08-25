import { useState, useEffect } from 'react';

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

// Простое кэширование в пределах жизненного цикла приложения, чтобы избежать повторных запросов
let branchesCache: Branch[] | null = null;
let branchesErrorCache: string | null = null;
let branchesFetchPromise: Promise<Branch[]> | null = null;

const useBranchesAPI = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = async (force: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      // Если не требуется принудительное обновление — используем кэш/объединяем параллельные запросы
      if (!force) {
        if (branchesCache) {
          setBranches(branchesCache);
          return;
        }
        if (branchesFetchPromise) {
          const data = await branchesFetchPromise;
          setBranches(data);
          if (branchesErrorCache) setError(branchesErrorCache);
          return;
        }
      }

      // Запускаем единый запрос и сохраняем промис, чтобы все параллельные вызовы его переиспользовали
      branchesFetchPromise = (async () => {
        const response = await fetch('https://battle-api.chasman.engineer/api/v1/branches', {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI2ODhjYWQ2YWJlNjU0MWU5ZTgzMWFiZTciLCJwZXJtaXNzaW9uIjoiT3duZXIiLCJuYmYiOjE3NTQzMjU0OTEsImV4cCI6MTc1NDMyOTA5MSwiaWF0IjoxNzU0MzI1NDkxLCJpc3MiOiJtci5yYWZhZWxsbyJ9.kjvs3RdU4ettjsnNjTEQH8VDxXQdETcUX6B7HdB08k4'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Branch[] = await response.json();
        branchesCache = data;
        branchesErrorCache = null;
        return data;
      })();

      const data = await branchesFetchPromise;
      setBranches(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка при загрузке филиалов';
      setError(message);
      branchesErrorCache = message;
    } finally {
      setLoading(false);
      branchesFetchPromise = null;
    }
  };

  const getBranchesForDisplay = (): BranchForDisplay[] => {
    return branches.map(branch => {
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

  useEffect(() => {
    // При первом обращении подтянем данные (или используем кэш/в ожидании существующего запроса)
    fetchBranches(false);
  }, []);

  return {
    branches,
    branchesForDisplay: getBranchesForDisplay(),
    loading,
    error,
    // Принудительное обновление для явного refetch
    refetch: () => fetchBranches(true)
  };
};

export default useBranchesAPI;