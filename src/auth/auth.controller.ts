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
import { User } from '@prisma/client';
import { Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { UsersService } from 'src/users/users.service';

import { LOGOUT_SUCCESSFUL } from './auth.constants';
import { AuthResponse, RequestWithUserPayload, Token } from './auth.interfaces';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('/login')
  @UsePipes(new ValidationPipe())
  async login(
    @Res({ passthrough: true }) response: Response,
    @Body() loginDto: AuthDto,
  ): Promise<AuthResponse> {
    const user: User = await this.authService.login(loginDto);
    const token: Token = await this.authService.generateToken(user);

    response.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600 * 24 * 7 * 1000,
    });

    return this.authService.generateAuthResponse(user);
  }

  @Public()
  @Post('/registration')
  @UsePipes(new ValidationPipe())
  async registration(
    @Res({ passthrough: true }) response: Response,
    @Body() registrationDto: CreateUserDto,
  ): Promise<AuthResponse> {
    const user: User = await this.authService.registration(registrationDto);

    const token: Token = await this.authService.generateToken(user);

    response.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600 * 24 * 7 * 1000,
    });

    return this.authService.generateAuthResponse(user);
  }

  @Post('/logout')
  async logout(@Res({ passthrough: true }) response: Response): Promise<void> {
    response.cookie('jwt', '', {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    });

    response.status(HttpStatus.OK).json({ message: LOGOUT_SUCCESSFUL });
  }

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
