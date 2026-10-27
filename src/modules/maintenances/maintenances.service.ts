import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThan, MoreThan, Repository } from 'typeorm';
import { Maintenance } from './entities/maintenance.entity.js';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto.js';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto.js';
import { VehiclesService } from '../vehicles/vehicles.service.js';
import { MechanicsService } from '../mechanics/mechanics.service.js';
import { WorkshopsService } from '../workshops/workshops.service.js';
import {
  ACTIVE_MAINTENANCE_STATUSES,
  MaintenanceStatus,
} from '../../common/enum/maintenance-status.enum.js';
import { VehicleStatus } from '../../common/enum/vehicle-status.enum.js';
import { Role } from '../../common/enum/role.enum.js';

// Datos del usuario autenticado que vienen en el JWT.
type AuthUser = { sub: string; role: Role };

// Transiciones permitidas: estado actual -> estados a los que puede pasar.
// COMPLETED y CANCELLED son finales: no pueden cambiar a ningún otro estado.
const ALLOWED_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  [MaintenanceStatus.SCHEDULED]: [
    MaintenanceStatus.IN_PROGRESS,
    MaintenanceStatus.CANCELLED,
  ],
  [MaintenanceStatus.IN_PROGRESS]: [
    MaintenanceStatus.COMPLETED,
    MaintenanceStatus.CANCELLED,
  ],
  [MaintenanceStatus.COMPLETED]: [],
  [MaintenanceStatus.CANCELLED]: [],
};

@Injectable()
export class MaintenancesService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    private readonly vehiclesService: VehiclesService,
    private readonly mechanicsService: MechanicsService,
    private readonly workshopsService: WorkshopsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateMaintenanceDto): Promise<Maintenance> {
    const start = new Date(dto.scheduledStart);
    const end = new Date(dto.scheduledEnd);
    if (start >= end) {
      throw new BadRequestException('scheduledEnd must be after scheduledStart');
    }

    // 1. El vehículo debe existir y no estar INACTIVE.
    const vehicle = await this.vehiclesService.findByIdOrPlate(dto.vehicleId);
    if (vehicle.status === VehicleStatus.INACTIVE) {
      throw new ConflictException(`Vehicle ${vehicle.plate} is inactive`);
    }

    // 2. El mecánico y el taller deben existir y estar activos.
    const mechanic = await this.mechanicsService.findOne(dto.mechanicId);
    if (!mechanic.isActive) {
      throw new ConflictException(`Mechanic ${mechanic.name} is inactive`);
    }

    const workshop = await this.workshopsService.findOne(dto.workshopId);
    if (!workshop.isActive) {
      throw new ConflictException(`Workshop ${workshop.name} is inactive`);
    }

    // 3. El kilometraje no puede ser menor al actual del vehículo.
    if (dto.mileage < vehicle.mileage) {
      throw new BadRequestException(
        `Mileage ${dto.mileage} is lower than the vehicle's current mileage (${vehicle.mileage})`,
      );
    }

    // 4. Un vehículo no puede tener más de un mantenimiento activo.
    const vehicleBusy = await this.maintenanceRepository.exists({
      where: {
        vehicle: { id: vehicle.id },
        status: In(ACTIVE_MAINTENANCE_STATUSES),
      },
    });
    if (vehicleBusy) {
      throw new ConflictException(
        `Vehicle ${vehicle.plate} already has an active maintenance`,
      );
    }

    // 5. El mecánico no puede tener otro mantenimiento activo con horario cruzado,
    //    en ningún taller. Dos rangos se cruzan si uno empieza antes de que el
    //    otro termine y termina después de que el otro empiece.
    const overlap = await this.maintenanceRepository.findOne({
      where: {
        mechanic: { id: mechanic.id },
        status: In(ACTIVE_MAINTENANCE_STATUSES),
        scheduledStart: LessThan(end),
        scheduledEnd: MoreThan(start),
      },
    });
    if (overlap) {
      throw new ConflictException(
        `Mechanic ${mechanic.name} already has a maintenance from ${overlap.scheduledStart.toISOString()} to ${overlap.scheduledEnd.toISOString()}`,
      );
    }

    const maintenance = this.maintenanceRepository.create({
      type: dto.type,
      description: dto.description,
      mileage: dto.mileage,
      scheduledStart: start,
      scheduledEnd: end,
      vehicle,
      mechanic,
      workshop,
    });
    return this.maintenanceRepository.save(maintenance);
  }

  findAll(): Promise<Maintenance[]> {
    return this.findMany({});
  }

  findActive(): Promise<Maintenance[]> {
    return this.findMany({ status: In(ACTIVE_MAINTENANCE_STATUSES) });
  }

  async findByVehicle(vehicleId: string): Promise<Maintenance[]> {
    const vehicle = await this.vehiclesService.findByIdOrPlate(vehicleId);
    return this.findMany({ vehicle: { id: vehicle.id } });
  }

  async findByMechanic(mechanicId: string): Promise<Maintenance[]> {
    await this.mechanicsService.findOne(mechanicId);
    return this.findMany({ mechanic: { id: mechanicId } });
  }

  // Mantenimientos asignados al técnico que inició sesión.
  async findMine(userId: string): Promise<Maintenance[]> {
    const mechanic = await this.mechanicsService.findByUserId(userId);
    return this.findMany({ mechanic: { id: mechanic.id } });
  }

  // Historial: mantenimientos completados del vehículo, del más reciente al más antiguo.
  async findHistory(vehicleId: string) {
    const vehicle = await this.vehiclesService.findByIdOrPlate(vehicleId);
    const maintenances = await this.maintenanceRepository.find({
      where: {
        vehicle: { id: vehicle.id },
        status: MaintenanceStatus.COMPLETED,
      },
      relations: { mechanic: true, workshop: true },
      order: { completedAt: 'DESC' },
    });
    return { vehicle, maintenances };
  }

  async findOne(id: string, user: AuthUser): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: { vehicle: true, mechanic: { user: true }, workshop: true },
    });
    if (!maintenance) {
      throw new NotFoundException(`Maintenance ${id} not found`);
    }
    this.checkOwnership(maintenance, user);
    return maintenance;
  }

  async updateStatus(
    id: string,
    dto: UpdateMaintenanceStatusDto,
    user: AuthUser,
  ): Promise<Maintenance> {
    const maintenance = await this.findOne(id, user);
    const current = maintenance.status;
    const next = dto.status;

    // 1. Validar que la transición esté permitida.
    if (!ALLOWED_TRANSITIONS[current].includes(next)) {
      throw new BadRequestException(
        `Invalid status transition from ${current} to ${next}`,
      );
    }

    // 2. Reglas propias de cada estado de destino.
    if (next === MaintenanceStatus.IN_PROGRESS) {
      await this.validateStart(maintenance);
    }
    if (next === MaintenanceStatus.COMPLETED) {
      this.applyClosingData(maintenance, dto);
    }

    maintenance.status = next;

    // 3. Estado del vehículo según el nuevo estado del mantenimiento.
    const vehicle = maintenance.vehicle;
    if (next === MaintenanceStatus.IN_PROGRESS) {
      vehicle.status = VehicleStatus.IN_MAINTENANCE;
    } else if (next === MaintenanceStatus.COMPLETED) {
      vehicle.status = VehicleStatus.AVAILABLE;
      vehicle.mileage = maintenance.finalMileage!;
    } else if (
      next === MaintenanceStatus.CANCELLED &&
      current === MaintenanceStatus.IN_PROGRESS
    ) {
      vehicle.status = VehicleStatus.AVAILABLE;
    }

    // 4. Transacción: el mantenimiento y el vehículo se guardan juntos.
    //    Si alguno de los dos falla, ninguno queda guardado.
    await this.dataSource.transaction(async (manager) => {
      await manager.save(vehicle);
      await manager.save(maintenance);
    });

    return maintenance;
  }

  // Un técnico solo puede ver y modificar los mantenimientos que tiene asignados.
  private checkOwnership(maintenance: Maintenance, user: AuthUser) {
    if (
      user.role === Role.TECHNICIAN &&
      maintenance.mechanic.user?.id !== user.sub
    ) {
      throw new ForbiddenException('This maintenance is not assigned to you');
    }
  }

  private async validateStart(maintenance: Maintenance) {
    if (maintenance.vehicle.status === VehicleStatus.INACTIVE) {
      throw new ConflictException(
        `Vehicle ${maintenance.vehicle.plate} is inactive`,
      );
    }

    // Un técnico no puede tener dos mantenimientos IN_PROGRESS al mismo tiempo.
    const mechanicBusy = await this.maintenanceRepository.exists({
      where: {
        mechanic: { id: maintenance.mechanic.id },
        status: MaintenanceStatus.IN_PROGRESS,
      },
    });
    if (mechanicBusy) {
      throw new ConflictException(
        `Mechanic ${maintenance.mechanic.name} already has a maintenance in progress`,
      );
    }
  }

  // Para completar se exigen los cuatro datos de cierre.
  private applyClosingData(
    maintenance: Maintenance,
    dto: UpdateMaintenanceStatusDto,
  ) {
    const missing = (
      ['workPerformed', 'finalCost', 'completedAt', 'finalMileage'] as const
    ).filter((field) => dto[field] === undefined);

    if (missing.length) {
      throw new BadRequestException(
        `To complete a maintenance these fields are required: ${missing.join(', ')}`,
      );
    }

    if (dto.finalMileage! < maintenance.mileage) {
      throw new BadRequestException(
        `finalMileage cannot be lower than the initial mileage (${maintenance.mileage})`,
      );
    }

    maintenance.workPerformed = dto.workPerformed!;
    maintenance.finalCost = dto.finalCost!;
    maintenance.completedAt = new Date(dto.completedAt!);
    maintenance.finalMileage = dto.finalMileage!;
  }

  private findMany(where: object): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where,
      relations: { vehicle: true, mechanic: true, workshop: true },
      order: { scheduledStart: 'DESC' },
    });
  }
}