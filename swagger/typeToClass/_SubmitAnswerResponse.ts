import { ApiProperty } from '@nestjs/swagger';
import { SubmitAnswerResponse } from 'src/games/games.interfaces';

export class _SubmitAnswerResponse implements SubmitAnswerResponse {
  @ApiProperty({
    example: '65c7b307243c4d39a43531c8',
    description: 'Уникальный идентификатор правильного ответа',
  })
  correctAnswerId: string;

  @ApiProperty({
    example: '65c7b307243c4d39a43531c8',
    description: 'Уникальный идентификатор выбранного ответа',
  })
  selectedAnswerOptionId: string;
}
