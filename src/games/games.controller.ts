import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Game, GameStatus, Question as QuestionModel } from '@prisma/client';
import { RequestWithUserPayload } from 'src/auth/auth.interfaces';
import { Question } from 'src/questions/questions.interfaces';
import { QuestionsService } from 'src/questions/questions.service';
import { _GameQuestionState } from 'swagger/typeToClass/_GameQuestionState';
import { _NewGameRequest } from 'swagger/typeToClass/_NewGameRequest';
import { _SubmitAnswerResponse } from 'swagger/typeToClass/_SubmitAnswerResponse';

import { SubmitAnswerDto } from './dto/submit.answer.dto';
import { INVALID_DATA_PROVIDED, NOT_FOUND_GAME_BY_ID } from './games.constants';
import {
  GameQuestionState,
  NewGameRequest,
  SubmitAnswerResponse,
} from './games.interfaces';
import { GamesService } from './games.service';

@ApiTags('Игра')
@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly questionsService: QuestionsService,
  ) {}

  // Маршрут для создания новой игры
  @ApiOperation({ summary: 'Создание новой игры' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Игра создана',
    type: _NewGameRequest,
  })
  @Post('new')
  async createNewGame(
    @Request() request: RequestWithUserPayload,
  ): Promise<NewGameRequest> {
    const newGame: Game = await this.gamesService.createNewGame(
      request.user.id,
    );

    return { gameId: newGame.id };
  }

  // Получение состояния игры и вопроса по ID игры
  @ApiOperation({ summary: 'Получение состояния игры и вопроса' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Игра найдена',
    type: _GameQuestionState,
  })
  @Get(':id')
  async getGameQuestionState(
    @Param('id') id: Game['id'],
    @Request() request: RequestWithUserPayload,
  ): Promise<GameQuestionState> {
    const foundGame: Game = await this.gamesService.findGameById(id);

    // Игра не найдена или принадлежит другому пользователю
    if (!foundGame || foundGame.userId !== request.user.id) {
      throw new NotFoundException(NOT_FOUND_GAME_BY_ID);
    }

    // Игра только создана, вопросов ещё нет
    if (foundGame.status === GameStatus['CREATED']) {
      const newQuestion: Question =
        await this.questionsService.createQuestion(id);

      const gameQuestionState: GameQuestionState =
        await this.gamesService.createGameQuestionState(foundGame, newQuestion);

      return gameQuestionState;
    }

    // Игра в процессе, но не завершена
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

    // Игра завершена
    else {
      const gameQuestionState: GameQuestionState =
        await this.gamesService.createGameQuestionState(foundGame);

      return gameQuestionState;
    }
  }

  // Маршрут для отправки ответа на вопрос
  @ApiOperation({ summary: 'Отправка выбранного варианта ответа' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ответ обработан',
    type: _SubmitAnswerResponse,
  })
  @Post('answer')
  async submitAnswer(
    @Body() submitAnswerDto: SubmitAnswerDto,
    @Request() request: RequestWithUserPayload,
  ): Promise<SubmitAnswerResponse> {
    const foundGame = await this.gamesService.findGameById(
      submitAnswerDto.gameId,
    );

    // Игра не найдена, принадлежит другому пользователю или уже завершена
    if (
      !foundGame ||
      foundGame.userId !== request.user.id ||
      foundGame.status === GameStatus['COMPLETED']
    ) {
      throw new BadRequestException(INVALID_DATA_PROVIDED);
    }

    const foundQuestion: QuestionModel =
      await this.questionsService.findQuestionById(submitAnswerDto.questionId);

    // Вопрос не найден, принадлежит другой игре или не является последним в игре
    if (
      !foundQuestion ||
      foundQuestion.gameId !== foundGame.id ||
      foundQuestion.id !== foundGame.lastQuestionId
    ) {
      throw new BadRequestException(INVALID_DATA_PROVIDED);
    }

    // Проверяем, правильный ли выбран ответ
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
