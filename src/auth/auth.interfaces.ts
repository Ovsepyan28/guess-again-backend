import { User } from '@prisma/client';
import { Request } from 'express';

export type PayloadForToken = {
  id: User['id'];
  email: User['email'];
  role: User['role'];
  name?: User['name'];
  maxScore: User['maxScore'];
};

export type Token = string;

export type AuthRequest = PayloadForToken & {
  token: Token; // Добавляем поле token
};

export type JwtPayloadWithTimes = PayloadForToken & {
  iat: number; // Issued At (время генерации токена)
  exp: number; // Expiration (время истечения токена)
};

// Расширяем стандартный интерфейс Request, добавляя поле user
export interface RequestWithUserPayload extends Request {
  user: JwtPayloadWithTimes;
}
