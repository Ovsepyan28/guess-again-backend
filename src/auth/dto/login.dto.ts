import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { REQUIRED_FIELD_AUTH } from '../auth.constants';

export class LoginDto {
  @ApiProperty({
    example: 'ivanov@gmail.com',
    description: 'Уникальный aдрес электронной почты пользователя',
  })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsNotEmpty({ message: REQUIRED_FIELD_AUTH })
  @IsString()
  email: User['email'];

  @ApiProperty({
    example: 'PH3u8Dt6M7QhnqRPJqw3',
    description: 'Пароль пользователя',
  })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: REQUIRED_FIELD_AUTH })
  @IsString()
  password: User['password'];
}
