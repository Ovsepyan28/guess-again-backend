import { User } from '@prisma/client';

// Тип для данных о топ-игроках
export type TopPlayer = {
  userName: User['userName'];
  maxScore: User['maxScore'];
};
