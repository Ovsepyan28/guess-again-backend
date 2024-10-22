import { ApiProperty } from '@nestjs/swagger';
import { AnswerOption, Game, Question } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

import { INVALID_DATA_PROVIDED } from '../games.constants';

export class SubmitAnswerDto {
  @ApiProperty({
    example: '65c7b307243c4d39a43531c8',
    description: 'Уникальный идентификатор игры',
  })
  @IsNotEmpty({ message: INVALID_DATA_PROVIDED })
  gameId: Game['id']; // Идентификатор игры

  @ApiProperty({
    example: '65c7b307243c4d39a43531c8',
    description: 'Уникальный идентификатор вопроса',
  })
  @IsNotEmpty({ message: INVALID_DATA_PROVIDED })
  questionId: Question['id']; // Идентификатор вопроса

  @ApiProperty({
    example: '65c7b307243c4d39a43531c8',
    description: 'Уникальный идентификатор варианта ответа',
  })
  @IsNotEmpty({ message: INVALID_DATA_PROVIDED })
  selectedAnswerOptionId: AnswerOption['id']; // Идентификатор выбранного ответа
}
