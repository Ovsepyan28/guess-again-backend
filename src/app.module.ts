import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, AuthModule, GamesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
