import { Injectable } from '@nestjs/common';
import { Game } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateGameDto } from './dto/create.game.dto';
import { INITIAL_GAME_LIVES } from './games.constants';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async createGame(dto: CreateGameDto): Promise<Game> {
    const newGame = await this.prisma.game.create({
      data: {
        userId: dto.id,
        lives: INITIAL_GAME_LIVES,
      },
    });

    return newGame;
  }
}
