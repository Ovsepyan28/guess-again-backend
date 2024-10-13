import { User } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

import {
  INCORRECT_EMAIL_AUTH,
  INCORRECT_PASSWORD_AUTH,
  INCORRECT_USER_NAME,
  REQUIRED_FIELD_AUTH,
} from '../auth.constants';

export class SignUpDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsNotEmpty({ message: REQUIRED_FIELD_AUTH })
  @IsString()
  @IsEmail({}, { message: INCORRECT_EMAIL_AUTH })
  email: User['email'];

  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: REQUIRED_FIELD_AUTH })
  @IsString()
  @Length(6, 16, { message: INCORRECT_PASSWORD_AUTH })
  password: User['password'];

  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: REQUIRED_FIELD_AUTH })
  @IsString()
  @MinLength(2, { message: INCORRECT_USER_NAME })
  userName: User['userName'];
}
