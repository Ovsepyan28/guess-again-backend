import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';

import { EMAIL_CONFLICT_USER_AUTH, INCORRECT_AUTH } from './auth.constants';
import { AuthResponse, Token } from './auth.interfaces';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signUp.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Логика входа: валидация пользователя
  async login(loginDto: LoginDto): Promise<User> {
    return await this.validateUser(loginDto);
  }

  // Логика регистрации: проверка на уникальность email и создание пользователя
  async signUp(signUpDto: SignUpDto): Promise<User> {
    const candidate = await this.userService.findUserByEmail(signUpDto.email);

    if (candidate) {
      throw new ConflictException(EMAIL_CONFLICT_USER_AUTH);
    }

    const user: User = await this.userService.createUser(signUpDto);

    return user;
  }

  // Генерация JWT токена на основе данных пользователя
  async generateToken(user: User): Promise<Token> {
    const payload: AuthResponse = {
      email: user.email,
      id: user.id,
      role: user.role,
      userName: user.userName,
      maxScore: user.maxScore,
    };

    const token: Token = this.jwtService.sign(payload);

    return token;
  }

  // Генерация объекта AuthResponse (данные пользователя без пароля) для отправки клиенту
  async generateAuthResponse(user: User): Promise<AuthResponse> {
    const authResponse: AuthResponse = {
      email: user.email,
      id: user.id,
      role: user.role,
      userName: user.userName,
      maxScore: user.maxScore,
    };

    return authResponse;
  }

  // Валидация пользователя: проверяем наличие в базе и правильность пароля
  private async validateUser({ email, password }: LoginDto): Promise<User> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException(INCORRECT_AUTH);
    }

    const passwordEquals = await bcrypt.compare(password, user.password);
    if (passwordEquals) return user;

    throw new UnauthorizedException(INCORRECT_AUTH);
  }
}
