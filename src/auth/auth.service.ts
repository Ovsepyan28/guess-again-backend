import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { UsersService } from 'src/users/users.service';
import { EMAIL_CONFLICT_USER_AUTH, INCORRECT_AUTH } from './auth.constants';
import { AuthRequest, PayloadForToken, Token } from './auth.interfaces';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: AuthDto): Promise<AuthRequest> {
    const user = await this.validateUser(loginDto);
    const token: Token = await this.generateToken(user);
    const authRequest: AuthRequest = await this.generateAuthRequest(
      user,
      token,
    );
    return authRequest;
  }

  async registration(createUserDto: CreateUserDto): Promise<AuthRequest> {
    const candidate = await this.userService.findUserByEmail(
      createUserDto.email,
    );

    if (candidate) {
      throw new ConflictException(EMAIL_CONFLICT_USER_AUTH);
    }

    const user = await this.userService.createUser(createUserDto);
    const token: Token = await this.generateToken(user);
    const authRequest: AuthRequest = await this.generateAuthRequest(
      user,
      token,
    );

    return authRequest;
  }

  private async generateToken(user: User): Promise<Token> {
    const payload: PayloadForToken = {
      email: user.email,
      id: user.id,
      role: user.role,
      name: user.name,
      maxScore: user.maxScore,
    };
    const token: Token = this.jwtService.sign(payload);
    return token;
  }

  private async generateAuthRequest(
    user: User,
    token: Token,
  ): Promise<AuthRequest> {
    const authRequest: AuthRequest = {
      email: user.email,
      id: user.id,
      role: user.role,
      name: user.name,
      maxScore: user.maxScore,
      token: token,
    };
    return authRequest;
  }

  private async validateUser({ email, password }: AuthDto): Promise<User> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException(INCORRECT_AUTH);
    }

    const passwordEquals = await bcrypt.compare(password, user.password);
    if (passwordEquals) return user;

    throw new UnauthorizedException(INCORRECT_AUTH);
  }
}
