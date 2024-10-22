import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Role } from '@prisma/client';
import { AuthResponse } from 'src/auth/auth.interfaces';

export class _AuthResponse implements AuthResponse {
  @ApiProperty({
    example: '65c7b307243c4d39a43531c8',
    description: 'Уникальный идентификатор пользователя',
  })
  id: string;

  @ApiProperty({
    example: 'ivanov@gmail.com',
    description: 'Уникальный aдрес электронной почты пользователя',
  })
  email: string;

  @ApiProperty({
    example: 34,
    description: 'Максимальный счет пользователя',
  })
  maxScore: number;

  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    description: 'Роль пользователя',
  })
  role: $Enums.Role;

  @ApiProperty({
    example: 'Александр',
    description: 'Имя пользователя',
  })
  userName: string;
}
