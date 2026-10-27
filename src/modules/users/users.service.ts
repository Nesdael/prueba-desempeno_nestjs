import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
  ) {}
  create(data: Partial<User>): Promise<User> {
    const user = this.userRespository.create(data);
    return this.userRespository.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRespository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.userRespository.findOne({ where: { id } });
  }
}
