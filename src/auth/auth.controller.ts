import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create.user.dto';

import { AuthRequest } from './auth.interfaces';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: AuthDto): Promise<AuthRequest> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('/registration')
  @UsePipes(new ValidationPipe())
  async registration(
    @Body() registrationDto: CreateUserDto,
  ): Promise<AuthRequest> {
    return this.authService.registration(registrationDto);
  }
}
