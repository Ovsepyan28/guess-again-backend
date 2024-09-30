import { Injectable } from '@nestjs/common';
import { Game, GameStatus, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { Question } from 'src/questions/questions.interfaces';
import { QuestionsService } from 'src/questions/questions.service';

import { INITIAL_GAME_LIVES } from './games.constants';
import { GameQuestionState } from './games.interfaces';
@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private readonly questionsService: QuestionsService,
  ) {}

  async createNewGame(userId: User['id']): Promise<Game> {
    // const startedAt = new Date();
    // const endedAt = new Date(startedAt.getTime() + INITIAL_GAME_TIME * 1000);

    const newGame = await this.prisma.game.create({
      data: {
        userId: userId,
        lives: INITIAL_GAME_LIVES,
        status: GameStatus['CREATED'],
        // startedAt: startedAt,
        // endedAt: endedAt,
        lastQuestionId: null, // На данном этапе не создан ни один вопрос в игре
      },
    });

    return newGame;
  }

  async findGameById(id: Game['id']): Promise<Game | null> {
    return this.prisma.game.findUnique({
      where: { id },
    });
  }

  async createGameQuestionState(
    game: Game,
    question?: Question,
  ): Promise<GameQuestionState> {
    const status =
      game.lives > 0 ? GameStatus['IN_PROGRESS'] : GameStatus['COMPLETED'];

    // Date.now() < new Date(game.endedAt).getTime()
    //   ? GameStatus['IN_PROGRESS']
    //   : GameStatus['COMPLETED'];

    // const timeToFinish = Math.floor(
    //   new Date(game.endedAt).getTime() - new Date(game.startedAt).getTime(),
    // );

    return {
      gameId: game.id,
      lives: game.lives,
      score: game.score,
      status: status,
      // timeToFinish: timeToFinish > 0 ? timeToFinish : null,
      questionId: question?.id,
      imageUrl: question?.imageUrl,
      answerOptions: question?.answerOptions,
    };
  }

  async updateGame(game: Game, isCorrectAnswer: boolean): Promise<void> {
    const updatedGameData: Prisma.GameUpdateInput = {
      score: isCorrectAnswer ? game.score + 1 : game.score,
      lives: !isCorrectAnswer ? game.lives - 1 : game.lives,
    };

    // Проверяем количество жизней, если 0 — заканчиваем игру
    if (updatedGameData.lives === 0) {
      updatedGameData.status = GameStatus['COMPLETED']; // Заканчиваем игру
    }
    const newQuestion: Question = await this.questionsService.createQuestion(
      game.id,
    );

    updatedGameData.lastQuestionId = newQuestion.id;

    await this.prisma.game.update({
      where: { id: game.id },
      data: updatedGameData,
    });
  }
}
