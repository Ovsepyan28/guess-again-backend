import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Observable } from 'rxjs';
import { FORBIDDEN_AUTH, UNAUTHORIZED_USER_AUTH } from './auth.constants';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const requiredRole = this.reflector.getAllAndOverride<User['role']>(
        'role',
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRole) return true;

      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException(UNAUTHORIZED_USER_AUTH);
      }

      const user = this.jwtService.verify<User>(token);
      request.user = user;

      if (user.role !== requiredRole) {
        throw new ForbiddenException(FORBIDDEN_AUTH);
      }

      return user.role === requiredRole;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new ForbiddenException(FORBIDDEN_AUTH);
    }
  }

  extractTokenFromHeader(
    request: Request & { headers: { authorization: string } },
  ): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'bearer' ? token : undefined;
  }
}
