import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();

    const hashPassword: User['password'] = await bcrypt.hash(
      dto.password,
      salt,
    );

    const newUser = await this.prisma.user.create({
      data: { ...dto, password: hashPassword },
    });

    return newUser;
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findUserById(id: User['id']): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findUserByEmail(email: User['email']): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async deleteUserById(id: User['id']): Promise<User | null> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async deleteUserByEmail(email: User['email']): Promise<User | null> {
    return this.prisma.user.delete({
      where: { email },
    });
  }
}
