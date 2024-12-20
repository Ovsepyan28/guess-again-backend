import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { QuestionsService } from 'src/questions/questions.service';
import { UsersService } from 'src/users/users.service';

import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
  imports: [AuthModule, JwtModule],
  controllers: [GamesController],
  providers: [
    GamesService,
    AuthGuard,
    PrismaService,
    QuestionsService,
    UsersService,
  ],
})
export class GamesModule {}
