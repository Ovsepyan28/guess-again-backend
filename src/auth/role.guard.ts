import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { Observable } from 'rxjs';

import { FORBIDDEN_AUTH } from './auth.constants';
import { RequestWithUserPayload } from './auth.interfaces';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: RequestWithUserPayload = context.switchToHttp().getRequest();

    try {
      const requiredRole = this.reflector.getAllAndOverride<User['role']>(
        'role',
        [context.getHandler(), context.getClass()],
      );

      // Если роль не указана, доступ разрешен
      if (!requiredRole) return true;

      // Проверяем, совпадает ли роль пользователя с требуемой
      if (request.user.role !== requiredRole) {
        throw new ForbiddenException(FORBIDDEN_AUTH);
      }

      // Возвращаем true, если роли совпадают
      return request.user.role === requiredRole;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new ForbiddenException(FORBIDDEN_AUTH);
    }
  }
}
