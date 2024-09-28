import {
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
import { NOT_FOUND_GAME_BY_ID } from './games.constants';
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

    if (!foundGame || foundGame.userId !== request.user.id) {
      throw new NotFoundException(NOT_FOUND_GAME_BY_ID);
    }

    // Игра создана, но не сформирован ни один вопрос
    if (foundGame.status === GameStatus['CREATED']) {
      const newQuestion: Question =
        await this.questionsService.createQuestion(id);

      const gameQuestionState: GameQuestionState =
        await this.gamesService.createGameQuestionState(foundGame, newQuestion);

      return gameQuestionState;
    }

    // Игра создана и создан вопрос
    else {
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
  }

  @Post('answer')
  async submitAnswer(
    @Body() submitAnswerDto: SubmitAnswerDto,
  ): Promise<GameQuestionState> {
    const question: QuestionModel =
      await this.questionsService.findQuestionById(submitAnswerDto.questionId);

    const isCorrectAnswer: boolean =
      submitAnswerDto.selectedAnswerOption === question.correctAnswerId;

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
