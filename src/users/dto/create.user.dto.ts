import { User } from '@prisma/client';

export class CreateUserDto {
  readonly email: User['email'];
  readonly password: User['password'];
  readonly name?: User['name'];
}
