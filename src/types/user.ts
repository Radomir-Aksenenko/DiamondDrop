import { CaseItem } from '@/hooks/useCasesAPI';

/**
 * Интерфейс данных пользователя из API
 */
export interface APIUserLevelInfo {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  progressPercent: number;
}

export interface APIUser {
  id: string;
  nickname: string;
  balance: number;
  level: number | APIUserLevelInfo;
  avatarUrl: string;
  permission: string;
  inventory?: CaseItem[];
}