import { Injectable } from '@nestjs/common';
import { Game, GameStatus, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { Question } from 'src/questions/questions.interfaces';
import { QuestionsService } from 'src/questions/questions.service';
import { UsersService } from 'src/users/users.service';

import { INITIAL_GAME_LIVES } from './games.constants';
import { GameQuestionState, TopPlayer } from './games.interfaces';
@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private readonly questionsService: QuestionsService,
    private readonly userService: UsersService,
  ) {}

  async createNewGame(userId: User['id']): Promise<Game> {
    const newGame = await this.prisma.game.create({
      data: {
        userId: userId,
        lives: INITIAL_GAME_LIVES,
        status: GameStatus['CREATED'],
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

    return {
      gameId: game.id,
      lives: game.lives,
      score: game.score,
      status: status,
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
    // Обновляем максимальное количество набранных очков пользователя,
    // если текущее значение превосходит зафиксированное
    const user = await this.userService.findUserById(game.userId);
    if ((updatedGameData.score as number) > user.maxScore) {
      const updatedUserData: Prisma.UserUpdateInput = {
        maxScore: updatedGameData.score,
      };

      await this.prisma.user.update({
        where: { id: user.id },
        data: updatedUserData,
      });
    }

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

  async getTop10(): Promise<TopPlayer[]> {
    const topPlayers = await this.prisma.user.findMany({
      orderBy: {
        maxScore: 'desc',
      },
      take: 10, // Ограничение на 10 игроков
      select: {
        userName: true,
        maxScore: true,
      },
    });
    return topPlayers;
  }
}
