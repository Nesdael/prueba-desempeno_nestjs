import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Workshop } from './entities/workshop.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
  ) {}

  create(createWorkshopDto: CreateWorkshopDto) {
    const workshop = this.workshopRepository.create(createWorkshopDto);
    return this.workshopRepository.save(workshop);
  }

  findActive(): Promise<Workshop[]> {
    return this.workshopRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Workshop> {
    const workshop = await this.workshopRepository.findOne({ where: { id } });
    if (!workshop) {
      throw new NotFoundException(`WorkShop ${id} not found`);
    }
    return workshop;
  }

  async updateStatus(id: string, isActive: boolean): Promise<Workshop> {
    const workshop = await this.findOne(id);
    workshop.isActive = isActive;
    return this.workshopRepository.save(workshop);
  }
}
