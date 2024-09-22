import { User } from '@prisma/client';
import { IsString } from 'class-validator';

export class CreateGameDto {
  @IsString()
  id: User['id']; // Идентификатор пользователя, который создает игру
}
