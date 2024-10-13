import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Role } from 'src/auth/decorators/role.decorator';
import { RoleGuard } from 'src/auth/role.guard';

import { CreateUserDto } from './dto/create.user.dto';
import {
  NOT_FOUND_USER_BY_EMAIL,
  NOT_FOUND_USER_BY_ID,
} from './users.constants';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Эндпоинт для создания нового пользователя
  @Role('ADMIN')
  @UseGuards(RoleGuard)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  // Эндпоинт для получения всех пользователей
  @Role('ADMIN')
  @UseGuards(RoleGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Эндпоинт для поиска пользователя по id
  @Role('ADMIN')
  @UseGuards(RoleGuard)
  @Get('id/:id')
  async findUserById(@Param('id') id: User['id']): Promise<User> {
    const foundUser = await this.usersService.findUserById(id);

    if (!foundUser) {
      throw new NotFoundException(NOT_FOUND_USER_BY_ID);
    }

    return foundUser;
  }

  // Эндпоинт для поиска пользователя по email
  @Role('ADMIN')
  @UseGuards(RoleGuard)
  @Get('email/:email')
  async findUserByEmail(@Param('email') email: User['email']): Promise<User> {
    const foundUser = await this.usersService.findUserByEmail(email);

    if (!foundUser) {
      throw new NotFoundException(NOT_FOUND_USER_BY_EMAIL);
    }

    return foundUser;
  }

  // Эндпоинт для удаления пользователя по id
  @Role('ADMIN')
  @UseGuards(RoleGuard)
  @Delete('id/:id')
  async deleteUserById(@Param('id') id: User['id']): Promise<User> {
    const candidate = await this.findUserById(id);

    if (!candidate) {
      throw new NotFoundException(NOT_FOUND_USER_BY_ID);
    }

    return this.usersService.deleteUserById(id);
  }

  // Эндпоинт для удаления пользователя по email
  @Role('ADMIN')
  @UseGuards(RoleGuard)
  @Delete('email/:email')
  async deleteUserByEmail(@Param('email') email: User['email']): Promise<User> {
    const candidate = await this.findUserByEmail(email);

    if (!candidate) {
      throw new NotFoundException(NOT_FOUND_USER_BY_EMAIL);
    }

    return this.usersService.deleteUserByEmail(email);
  }
}
