import { CaseItem } from '@/hooks/useCasesAPI';

/**
 * Интерфейс данных пользователя из API
 */
export interface APIUser {
  id: string;
  nickname: string;
  balance: number;
  level: number;
  avatarUrl: string;
  permission: string;
  inventory?: CaseItem[];
}