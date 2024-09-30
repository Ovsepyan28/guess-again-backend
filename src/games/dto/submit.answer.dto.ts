import { AnswerOption, Game, Question } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

import { INVALID_DATA_PROVIDED } from '../games.constants';

export class SubmitAnswerDto {
  @IsNotEmpty({ message: INVALID_DATA_PROVIDED })
  gameId: Game['id']; // Идентификатор игры

  @IsNotEmpty({ message: INVALID_DATA_PROVIDED })
  questionId: Question['id']; // Идентификатор вопроса

  @IsNotEmpty({ message: INVALID_DATA_PROVIDED })
  selectedAnswerOption: AnswerOption['id']; // Идентификатор выбранного ответа
}
