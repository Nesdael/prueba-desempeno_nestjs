import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';
import { UpdateMechanicDto } from './dto/update-mechanic.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Mechanic } from './entities/mechanic.entity.js';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { Role } from '../../common/enum/role.enum.js';

@Injectable()
export class MechanicsService {
  constructor(
    @InjectRepository(Mechanic)
    private readonly mechanicRepository: Repository<Mechanic>,
    private readonly userService: UsersService,
  ) {}

  async create(createMechanicDto: CreateMechanicDto): Promise<Mechanic> {
    const { userId, ...data } = createMechanicDto;
    const mechanic = this.mechanicRepository.create(data);
    if (userId) {
      mechanic.user = await this.findTechnicanUser(userId);
    }
    return this.mechanicRepository.save(mechanic);
  }

  findAll(): Promise<Mechanic[]> {
    return this.mechanicRepository.find({
      relations: { user: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(userId: string): Promise<Mechanic> {
    const mechanic = await this.mechanicRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!mechanic) {
      throw new NotFoundException('No mechanic is linked to this user');
    }
    return mechanic;
  }

  async update(
    id: string,
    updateMechanicDto: UpdateMechanicDto,
  ): Promise<Mechanic> {
    const mechanic = await this.findOne(id);
    const { userId, ...data } = updateMechanicDto;

    Object.assign(mechanic, data);
    if (userId) {
      mechanic.user = await this.findTechnicanUser(userId);
    }
    return this.mechanicRepository.save(mechanic);
  }

  async updateStatus(id: string, isActive: boolean): Promise<Mechanic> {
    const mechanic = await this.findOne(id);
    mechanic.isActive = isActive;
    return this.mechanicRepository.save(mechanic);
  }

  private async findTechnicanUser(userId: string): Promise<User> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    if (user.role !== Role.TECHNICIAN) {
      throw new BadRequestException('Only TECHNICIAN users can be linked');
    }
    return user;
  }
}
