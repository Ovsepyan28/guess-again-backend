import { User } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { REQUIRED_FIELD_AUTH } from '../auth.constants';

export class LoginDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsNotEmpty({ message: REQUIRED_FIELD_AUTH })
  @IsString()
  email: User['email'];

  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: REQUIRED_FIELD_AUTH })
  @IsString()
  password: User['password'];
}
