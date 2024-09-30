import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request as ExpressRequest } from 'express';

import { UNAUTHORIZED_USER_AUTH } from './auth.constants';
import { JwtPayloadWithTimes, RequestWithUserPayload } from './auth.interfaces';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request: ExpressRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException(UNAUTHORIZED_USER_AUTH);
    }

    try {
      const user = this.jwtService.verify<JwtPayloadWithTimes>(token);
      (request as RequestWithUserPayload).user = user;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new UnauthorizedException(UNAUTHORIZED_USER_AUTH);
    }
    return true;
  }

  extractTokenFromCookie(request: ExpressRequest) {
    return request.cookies?.jwt;
  }
}
