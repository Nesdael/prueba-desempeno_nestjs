import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity.js';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { VehicleStatus } from '../../common/enum/vehicle-status.enum.js';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  create(createVehicleDto: CreateVehicleDto) {
    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({ order: { plate: 'ASC' } });
  }

  findAvailable(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      where: { status: VehicleStatus.AVAILABLE },
      order: { plate: 'ASC' },
    });
  }

  // Search by ID if term is a UUID; otherwise, treat it as a license plate
  async findByIdOrPlate(term: string): Promise<Vehicle> {
    const vehicle = isUUID(term)
      ? await this.vehicleRepository.findOne({ where: { id: term } })
      : await this.vehicleRepository.findOne({
          where: { plate: term.trim().toUpperCase() },
        });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${term} not found`);
    }
    return vehicle;
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findByIdOrPlate(id);
    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  //Logical deletion: The vehicle is set to INACTIVE and retains its history
  async inactivate(id: string): Promise<Vehicle> {
    const vehicle = await this.findByIdOrPlate(id);

    if (vehicle.status === VehicleStatus.IN_MAINTENANCE) {
      throw new ConflictException(
        `Vehicle ${vehicle.plate} is in maintenance and cannot be inactivated`,
      );
    }

    vehicle.status = VehicleStatus.INACTIVE;
    return this.vehicleRepository.save(vehicle);
  }
}
