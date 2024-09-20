import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findUserById(id: User['id']): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async deleteUserById(id: User['id']): Promise<User | null> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data: { ...dto } });
  }
}
