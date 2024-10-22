import { ApiProperty } from '@nestjs/swagger';
import { TopPlayer } from 'src/users/users.interfaces';

export class _TopPlayer implements TopPlayer {
  @ApiProperty({
    example: 34,
    description: 'Максимальный счет игрока',
  })
  maxScore: number;

  @ApiProperty({
    example: 'Александр',
    description: 'Имя игрока',
  })
  userName: string;
}
