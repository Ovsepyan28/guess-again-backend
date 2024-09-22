import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Game } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestWithUserPayload } from 'src/auth/auth.interfaces';
import { Role } from 'src/auth/decorators/role.decorator';
import { RoleGuard } from 'src/auth/role.guard';
import { CreateGameDto } from './dto/create.game.dto';
import { FORBIDDEN_USER_ID_CHANGE } from './games.constants';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly authGuard: AuthGuard,
    private readonly jwtService: JwtService,
  ) {}

  @Post('new')
  async newGame(
    @Body() createGameDto: CreateGameDto,
    @Request() request: RequestWithUserPayload,
  ): Promise<Game> {
    // Проверка на попытку подмены id
    if (createGameDto.id !== request.user.id)
      throw new ForbiddenException(FORBIDDEN_USER_ID_CHANGE);

    return this.gamesService.createGame(createGameDto);
  }

  @Role('ADMIN')
  @UseGuards(RoleGuard)
  @Post('create')
  async createGame(
    @Body() createGameDto: CreateGameDto,
    @Request() request: RequestWithUserPayload,
  ): Promise<Game> {
    // Проверка на попытку подмены user id
    if (createGameDto.id !== request.user.id)
      throw new ForbiddenException(FORBIDDEN_USER_ID_CHANGE);

    return this.gamesService.createGame(createGameDto);
  }
}
