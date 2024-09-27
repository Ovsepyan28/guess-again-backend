import { Injectable } from '@nestjs/common';
import { Game, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { Question } from 'src/questions/questions.interfaces';

import { INITIAL_GAME_LIVES, INITIAL_GAME_TIME } from './games.constants';
import { GameQuestionState, GameStatus } from './games.interfaces';
@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async createGame(userId: User['id']): Promise<Game> {
    const startedAt = new Date();
    const endedAt = new Date(startedAt.getTime() + INITIAL_GAME_TIME * 1000);

    const newGame = await this.prisma.game.create({
      data: {
        userId: userId,
        lives: INITIAL_GAME_LIVES,
        startedAt: startedAt,
        endedAt: endedAt,
      },
    });

    return newGame;
  }

  async createGameQuestionState(
    game: Game,
    question: Question,
  ): Promise<GameQuestionState> {
    const status =
      Date.now() < new Date(game.endedAt).getTime()
        ? GameStatus['IN_PROGRESS']
        : GameStatus['COMPLETED'];
    return {
      gameId: game.id,
      lives: game.lives,
      score: game.score,
      status: status,
      questionId: question.id,
      imageUrl: question.imageUrl,
      answerOptions: question.answerOptions,
    };
  }
}
