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
import { Public } from 'src/auth/decorators/public.decorator';
import { Question } from 'src/questions/questions.interfaces';
import { QuestionsService } from 'src/questions/questions.service';

import { SubmitAnswerDto } from './dto/submit.answer.dto';
import { INVALID_DATA_PROVIDED, NOT_FOUND_GAME_BY_ID } from './games.constants';
import {
  GameQuestionState,
  NewGameRequest,
  SubmitAnswerResponse,
  TopPlayer,
} from './games.interfaces';
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

  @Public()
  @Get('top10')
  async getTopPlayers(): Promise<TopPlayer[]> {
    const top10: TopPlayer[] = await this.gamesService.getTop10();

    return top10;
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
  ): Promise<SubmitAnswerResponse> {
    const foundGame = await this.gamesService.findGameById(
      submitAnswerDto.gameId,
    );

    // Игра не найдена
    // или игра была создана другим пользователем
    // или игра уже завершена
    if (
      !foundGame ||
      foundGame.userId !== request.user.id ||
      foundGame.status === GameStatus['COMPLETED']
    ) {
      throw new BadRequestException(INVALID_DATA_PROVIDED);
    }

    const foundQuestion: QuestionModel =
      await this.questionsService.findQuestionById(submitAnswerDto.questionId);

    // Вопрос не найден
    // или вопрос был загадан в другой игре
    // или не последний вопрос в игре
    if (
      !foundQuestion ||
      foundQuestion.gameId !== foundGame.id ||
      foundQuestion.id !== foundGame.lastQuestionId
    ) {
      throw new BadRequestException(INVALID_DATA_PROVIDED);
    }

    const isCorrectAnswer: boolean =
      submitAnswerDto.questionId === foundGame.lastQuestionId &&
      submitAnswerDto.selectedAnswerOptionId === foundQuestion.correctAnswerId;

    await this.gamesService.updateGame(foundGame, isCorrectAnswer);

    const submitAnswerResponse: SubmitAnswerResponse = {
      selectedAnswerOptionId: submitAnswerDto.selectedAnswerOptionId,
      correctAnswerId: foundQuestion.correctAnswerId,
    };

    return submitAnswerResponse;
  }
}
