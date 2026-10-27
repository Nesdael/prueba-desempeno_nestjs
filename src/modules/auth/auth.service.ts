import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async register(dto: RegisterDto) {
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ ...dto, password });
    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    const isValid = user && (await bcrypt.compare(dto.password, user.password));

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildResponse(user);
  }

  private buildResponse(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
