import { ApiProperty } from '@nestjs/swagger';
import { $Enums, GameStatus } from '@prisma/client';
import { GameQuestionState } from 'src/games/games.interfaces';

class _AnswerOption {
  @ApiProperty({
    example: '65c7b307243c4d39a43531c8',
    description: 'Уникальный идентификатор варианта ответа',
  })
  answerOptionId: string;

  @ApiProperty({ example: 'Матрица', description: 'Название фильма' })
  title: string;

  @ApiProperty({ example: 1999, description: 'Год выпуска фильма' })
  year: number;
}

export class _GameQuestionState implements GameQuestionState {
  @ApiProperty({
    example: '65c7b307243c4d39a43531c8',
    description: 'Уникальный идентификатор игры',
  })
  gameId: string;

  @ApiProperty({
    example: 3,
    description: 'Оставшееся количество жизней',
  })
  lives: number;

  @ApiProperty({
    example: 34,
    description: 'Текущий счет в игре',
  })
  score: number;

  @ApiProperty({
    enum: GameStatus,
    enumName: 'GameStatus',
    description: 'Текущее состояние игры',
  })
  status: $Enums.GameStatus;

  @ApiProperty({
    example: '65c7b307243c4d39a43531c8',
    description: 'Уникальный идентификатор вопроса',
    required: false,
  })
  questionId?: string;

  @ApiProperty({
    example:
      'https://avatars.mds.yandex.net/get-kinopoisk-image/1600647/8907ef15-95f0-45f9-b138-1a86b0d893c5/1680x1680',
    description: 'Кадр из фильма/сериала',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    type: [_AnswerOption],
    description: 'Варианты ответов',
    required: false,
  })
  answerOptions?: _AnswerOption[];
}
