import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { _AuthResponse } from 'swagger/typeToClass/_AuthResponse';

import { LOGOUT_SUCCESSFUL } from './auth.constants';
import { AuthResponse, RequestWithUserPayload, Token } from './auth.interfaces';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signUp.dto';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // Открытый маршрут для входа
  @ApiOperation({ summary: 'Аутентификация пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Успешная аутентификация',
    type: _AuthResponse,
  })
  @Public()
  @Post('/login')
  @UsePipes(new ValidationPipe())
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body() loginDto: LoginDto,
  ): Promise<AuthResponse> {
    const user: User = await this.authService.login(loginDto);

    const token: Token = await this.authService.generateToken(user);

    response.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600 * 24 * 7 * 1000,
    });

    response.status(HttpStatus.OK); // Устанавливаем статус ответа на 200, так по умолчанию метод POST возвращает 201

    return this.authService.generateAuthResponse(user);
  }

  // Открытый маршрут для регистрации
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Успешная регистрация',
    type: _AuthResponse,
  })
  @Public()
  @Post('/signup')
  @UsePipes(new ValidationPipe())
  async registration(
    @Res({ passthrough: true }) response: Response,
    @Body() signUpDto: SignUpDto,
  ): Promise<AuthResponse> {
    const user: User = await this.authService.signUp(signUpDto);

    const token: Token = await this.authService.generateToken(user);

    response.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600 * 24 * 7 * 1000,
    });

    return this.authService.generateAuthResponse(user);
  }

  // Маршрут для выхода
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Вы успешно вышли из системы',
  })
  @Post('/logout')
  async logout(@Res({ passthrough: true }) response: Response): Promise<void> {
    // Удаляем cookie с токеном
    response.cookie('jwt', '', {
      httpOnly: true,
      secure: false,
      expires: new Date(0), // Устанавливаем срок жизни cookie на прошлую дату
    });

    response.status(HttpStatus.OK).json({ message: LOGOUT_SUCCESSFUL });
  }

  // Маршрут для получения информации о текущем пользователе
  @ApiOperation({ summary: 'Проверка аутентификации пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Пользователь аутентифицтрован',
    type: _AuthResponse,
  })
  @Get('/whoami')
  async whoami(
    @Request() request: RequestWithUserPayload,
  ): Promise<AuthResponse> {
    const foundUser: User = await this.usersService.findUserById(
      request.user.id,
    );

    return this.authService.generateAuthResponse(foundUser);
  }
}
