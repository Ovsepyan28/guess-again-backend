import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { UsersService } from 'src/users/users.service';

import { UNAUTHORIZED_USER_AUTH } from './auth.constants';
import { JwtPayloadWithTimes, RequestWithUserPayload } from './auth.interfaces';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Если маршрут публичный, разрешаем доступ
    if (isPublic) {
      return true;
    }

    const request: ExpressRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    // Если токен отсутствует, выбрасываем исключение UnauthorizedException
    if (!token) {
      throw new UnauthorizedException(UNAUTHORIZED_USER_AUTH);
    }

    try {
      const user = this.jwtService.verify<JwtPayloadWithTimes>(token);
      const foundUser: User = await this.usersService.findUserById(user.id);

      // Если пользователь отсутствует в базе, выбрасываем исключение UnauthorizedException
      if (!foundUser) {
        throw new UnauthorizedException(UNAUTHORIZED_USER_AUTH);
      }

      (request as RequestWithUserPayload).user = user;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new UnauthorizedException(UNAUTHORIZED_USER_AUTH);
    }

    // Если все проверки пройдены, разрешаем доступ
    return true;
  }

  // Метод для извлечения токена из cookie
  extractTokenFromCookie(request: ExpressRequest) {
    return request.cookies?.jwt;
  }
}
