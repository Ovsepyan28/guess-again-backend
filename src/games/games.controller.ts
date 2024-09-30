import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { Game, GameStatus, Question as QuestionModel } from '@prisma/client';
import { RequestWithUserPayload } from 'src/auth/auth.interfaces';
import { Question } from 'src/questions/questions.interfaces';
import { QuestionsService } from 'src/questions/questions.service';

import { SubmitAnswerDto } from './dto/submit.answer.dto';
import { INVALID_DATA_PROVIDED, NOT_FOUND_GAME_BY_ID } from './games.constants';
import { GameQuestionState, NewGameRequest } from './games.interfaces';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly questionsService: QuestionsService,
  ) {}

  @Post('new')
  async createNewGame(
    @Request() request: RequestWithUserPayload,
  ): Promise<NewGameRequest> {
    const newGame: Game = await this.gamesService.createNewGame(
      request.user.id,
    );

    return { gameId: newGame.id };
  }

  @Get(':id')
  async getGameQuestionState(
    @Param('id') id: Game['id'],
    @Request() request: RequestWithUserPayload,
  ): Promise<GameQuestionState> {
    const foundGame: Game = await this.gamesService.findGameById(id);

    // Игра не найдена или игра была создана другим пользователем
    if (!foundGame || foundGame.userId !== request.user.id) {
      throw new NotFoundException(NOT_FOUND_GAME_BY_ID);
    }

    // Игра создана и не сформирован ни один вопрос
    if (foundGame.status === GameStatus['CREATED']) {
      const newQuestion: Question =
        await this.questionsService.createQuestion(id);

      const gameQuestionState: GameQuestionState =
        await this.gamesService.createGameQuestionState(foundGame, newQuestion);

      return gameQuestionState;
    }

    // Игра создана и создан вопрос, но игра не завершена
    else if (foundGame.status === GameStatus['IN_PROGRESS']) {
      const lastQuestion: Question =
        await this.questionsService.findFullQuestionById(
          foundGame.lastQuestionId,
        );

      const gameQuestionState: GameQuestionState =
        await this.gamesService.createGameQuestionState(
          foundGame,
          lastQuestion,
        );

      return gameQuestionState;
    }

    // Игра завершена GameStatus - COMPLETED
    else {
      const gameQuestionState: GameQuestionState =
        await this.gamesService.createGameQuestionState(foundGame);

      return gameQuestionState;
    }
  }

  @Post('answer')
  async submitAnswer(
    @Body() submitAnswerDto: SubmitAnswerDto,
    @Request() request: RequestWithUserPayload,
  ): Promise<GameQuestionState> {
    const foundGame = await this.gamesService.findGameById(
      submitAnswerDto.gameId,
    );

    // Игра не найдена или игра была создана другим пользователем
    if (!foundGame || foundGame.userId !== request.user.id) {
      throw new BadRequestException(INVALID_DATA_PROVIDED);
    }

    // Игра завершена
    if (foundGame.status === GameStatus['COMPLETED']) {
      return this.gamesService.createGameQuestionState(foundGame);
    }

    const foundQuestion: QuestionModel =
      await this.questionsService.findQuestionById(submitAnswerDto.questionId);

    // Вопрос не найден или вопрос был загадан в другой игре
    if (!foundQuestion || foundQuestion.gameId !== foundGame.id) {
      throw new BadRequestException(INVALID_DATA_PROVIDED);
    }

    const isCorrectAnswer: boolean =
      submitAnswerDto.questionId === foundGame.lastQuestionId &&
      submitAnswerDto.selectedAnswerOption === foundQuestion.correctAnswerId;

    const updatedGame: Game = await this.gamesService.updateGame(
      submitAnswerDto.gameId,
      isCorrectAnswer,
    );

    if (updatedGame.status === GameStatus['COMPLETED']) {
      const gameQuestionState: GameQuestionState =
        await this.gamesService.createGameQuestionState(updatedGame);

      return gameQuestionState;
    } else {
      const newQuestion: Question = await this.questionsService.createQuestion(
        submitAnswerDto.gameId,
      );

      const gameQuestionState: GameQuestionState =
        await this.gamesService.createGameQuestionState(
          updatedGame,
          newQuestion,
        );

      return gameQuestionState;
    }
  }
}
