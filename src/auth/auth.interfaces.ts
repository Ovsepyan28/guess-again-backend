import { User } from '@prisma/client';
import { Request } from 'express';

// Ответ при успешной аутентификации
export type AuthResponse = {
  id: User['id'];
  email: User['email'];
  role: User['role'];
  userName: User['userName'];
  maxScore: User['maxScore'];
};

export type Token = string;

// Тип JwtPayloadWithTimes расширяет AuthResponse, добавляя поля времени генерации и истечения токена
export type JwtPayloadWithTimes = AuthResponse &
  Token & {
    iat: number; // Issued At (время генерации токена)
    exp: number; // Expiration (время истечения токена)
  };

// Расширяем стандартный интерфейс Request, добавляя поле user
export interface RequestWithUserPayload extends Request {
  user: JwtPayloadWithTimes;
}
