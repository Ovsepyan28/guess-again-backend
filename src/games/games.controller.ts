import { Controller, Get, Request } from '@nestjs/common';
import { Game } from '@prisma/client';
import { RequestWithUserPayload } from 'src/auth/auth.interfaces';
import { Question } from 'src/questions/questions.interfaces';
import { QuestionsService } from 'src/questions/questions.service';

import { GameQuestionState } from './games.interfaces';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly questionsService: QuestionsService,
  ) {}

  @Get('new')
  async newGame(
    @Request() request: RequestWithUserPayload,
  ): Promise<GameQuestionState> {
    const newGame: Game = await this.gamesService.createGame(request.user.id);

    const newQuestion: Question = await this.questionsService.createQuestion(
      newGame.id,
    );

    const gameQuestionState: GameQuestionState =
      await this.gamesService.createGameQuestionState(newGame, newQuestion);

    return gameQuestionState;
  }
}
