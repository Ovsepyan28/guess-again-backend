import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_KEY || 'SECRET',
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => UsersModule),
  ],
  exports: [JwtModule],
})
export class AuthModule {}
