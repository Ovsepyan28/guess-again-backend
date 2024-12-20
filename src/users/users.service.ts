import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma.service';

import { CreateUserDto } from './dto/create.user.dto';
import { TopPlayer } from './users.interfaces';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Метод для создания пользователя
  async createUser(dto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();

    // Хешируем пароль
    const hashPassword: User['password'] = await bcrypt.hash(
      dto.password,
      salt,
    );

    // Создаем нового пользователя в базе данных
    const newUser = await this.prisma.user.create({
      data: { ...dto, password: hashPassword },
    });

    return newUser;
  }

  // Метод для получения всех пользователей
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  // Метод для поиска пользователя по ID
  async findUserById(id: User['id']): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // Метод для поиска пользователя по email
  async findUserByEmail(email: User['email']): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Метод для удаления пользователя по ID
  async deleteUserById(id: User['id']): Promise<User | null> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // Метод для удаления пользователя по email
  async deleteUserByEmail(email: User['email']): Promise<User | null> {
    return this.prisma.user.delete({
      where: { email },
    });
  }

  // Метод для получения топ-10 игроков по максимальному счёту
  async getTop10(): Promise<TopPlayer[]> {
    const topPlayers = await this.prisma.user.findMany({
      where: {
        maxScore: {
          gt: 0, // Условие: maxScore должен быть больше 0
        },
      },
      orderBy: {
        maxScore: 'desc',
      },
      take: 10, // Ограничение на 10 игроков
      select: {
        userName: true,
        maxScore: true,
      },
    });
    return topPlayers;
  }
}
