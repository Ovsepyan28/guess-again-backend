import { ApiProperty } from '@nestjs/swagger';
import { NewGameRequest } from 'src/games/games.interfaces';

export class _NewGameRequest implements NewGameRequest {
  @ApiProperty({
    example: '65c7b307243c4d39a43531c8',
    description: 'Уникальный идентификатор игры',
  })
  gameId: string;
}
