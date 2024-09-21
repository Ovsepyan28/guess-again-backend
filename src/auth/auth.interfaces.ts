import { User } from '@prisma/client';

export type PayloadForToken = {
  id: User['id'];
  email: User['email'];
  role: User['role'];
  name: User['name'];
  maxScore: User['maxScore'];
};

export type Token = string;

export type AuthRequest = PayloadForToken & {
  token: Token; // Добавляем поле token
};
