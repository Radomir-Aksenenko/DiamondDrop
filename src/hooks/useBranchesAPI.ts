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

const useBranchesAPI = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    
    try {
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
      setBranches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке филиалов');
    } finally {
      setLoading(false);
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
    fetchBranches();
  }, []);

  return {
    branches,
    branchesForDisplay: getBranchesForDisplay(),
    loading,
    error,
    refetch: fetchBranches
  };
};

export default useBranchesAPI;