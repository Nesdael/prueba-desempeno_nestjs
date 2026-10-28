import { NestFactory } from '@nestjs/core';
import bcrypt from 'bcrypt';
import {
  DataSource,
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { AppModule } from '../app.module.js';
import { User } from '../modules/users/entities/user.entity.js';
import { Mechanic } from '../modules/mechanics/entities/mechanic.entity.js';
import { Workshop } from '../modules/workshops/entities/workshop.entity.js';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity.js';
import { Maintenance } from '../modules/maintenances/entities/maintenance.entity.js';
import { Role } from '../common/enum/role.enum.js';
import { VehicleStatus } from '../common/enum/vehicle-status.enum.js';
import { MaintenanceType } from '../common/enum/maintenance-type.enum.js';
import { MaintenanceStatus } from '../common/enum/maintenance-status.enum.js';

/**
 * Looks up a record by a unique field and only creates it if it does not exist.
 * This way, running the seeder several times does not duplicate data.
 */
async function findOrCreate<T extends ObjectLiteral>(
  repository: Repository<T>,
  where: FindOptionsWhere<T>,
  data: DeepPartial<T>,
): Promise<T> {
  const existing = await repository.findOne({ where });
  if (existing) return existing;
  return repository.save(repository.create(data));
}

async function seed() {
  // Boots Nest without an HTTP server, only to use the connection and entities.
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const dataSource = app.get(DataSource);

  const users = dataSource.getRepository(User);
  const mechanics = dataSource.getRepository(Mechanic);
  const workshops = dataSource.getRepository(Workshop);
  const vehicles = dataSource.getRepository(Vehicle);
  const maintenances = dataSource.getRepository(Maintenance);

  // 1. Users: 1 ADMIN and 2 TECHNICIAN
  const admin = await findOrCreate(
    users,
    { email: 'admin@fleetcore.com' },
    {
      name: 'Administrador',
      email: 'admin@fleetcore.com',
      password: await bcrypt.hash('Admin12345', 10),
      role: Role.ADMIN,
    },
  );
  const technician1 = await findOrCreate(
    users,
    { email: 'tecnico1@fleetcore.com' },
    {
      name: 'Carlos Pérez',
      email: 'tecnico1@fleetcore.com',
      password: await bcrypt.hash('Tecnico12345', 10),
      role: Role.TECHNICIAN,
    },
  );
  const technician2 = await findOrCreate(
    users,
    { email: 'tecnico2@fleetcore.com' },
    {
      name: 'Laura Gómez',
      email: 'tecnico2@fleetcore.com',
      password: await bcrypt.hash('Tecnico12345', 10),
      role: Role.TECHNICIAN,
    },
  );

  // 2. Mechanics: 2 active linked to the technicians and 1 inactive
  const carlos = await findOrCreate(
    mechanics,
    { email: 'carlos.perez@fleetcore.com' },
    {
      name: 'Carlos Pérez',
      email: 'carlos.perez@fleetcore.com',
      specialty: 'Motor y transmisión',
      isActive: true,
      user: technician1,
    },
  );
  const laura = await findOrCreate(
    mechanics,
    { email: 'laura.gomez@fleetcore.com' },
    {
      name: 'Laura Gómez',
      email: 'laura.gomez@fleetcore.com',
      specialty: 'Frenos y suspensión',
      isActive: true,
      user: technician2,
    },
  );
  await findOrCreate(
    mechanics,
    { email: 'pedro.ruiz@fleetcore.com' },
    {
      name: 'Pedro Ruiz',
      email: 'pedro.ruiz@fleetcore.com',
      specialty: 'Sistema eléctrico',
      isActive: false,
    },
  );

  // 3. Workshops: 1 active and 1 inactive
  const centro = await findOrCreate(
    workshops,
    { name: 'Taller Centro' },
    {
      name: 'Taller Centro',
      address: 'Calle 72 #45-10, Barranquilla',
      isActive: true,
    },
  );
  await findOrCreate(
    workshops,
    { name: 'Taller Norte' },
    {
      name: 'Taller Norte',
      address: 'Carrera 51B #84-20, Barranquilla',
      isActive: false,
    },
  );

  // 4. Vehicles: 2 AVAILABLE, 1 IN_MAINTENANCE and 1 INACTIVE
  const abc123 = await findOrCreate(
    vehicles,
    { plate: 'ABC123' },
    {
      plate: 'ABC123',
      brand: 'Chevrolet',
      model: 'NPR',
      year: 2021,
      mileage: 45120,
      status: VehicleStatus.AVAILABLE,
    },
  );
  await findOrCreate(
    vehicles,
    { plate: 'DEF456' },
    {
      plate: 'DEF456',
      brand: 'Hino',
      model: 'Serie 300',
      year: 2022,
      mileage: 30500,
      status: VehicleStatus.AVAILABLE,
    },
  );
  const ghi789 = await findOrCreate(
    vehicles,
    { plate: 'GHI789' },
    {
      plate: 'GHI789',
      brand: 'Foton',
      model: 'Aumark',
      year: 2020,
      mileage: 88000,
      status: VehicleStatus.IN_MAINTENANCE,
    },
  );
  await findOrCreate(
    vehicles,
    { plate: 'JKL012' },
    {
      plate: 'JKL012',
      brand: 'JAC',
      model: 'N-Series',
      year: 2018,
      mileage: 150300,
      status: VehicleStatus.INACTIVE,
    },
  );

  // 5. Maintenances: 1 IN_PROGRESS (for the vehicle in maintenance) and 1 COMPLETED
  await findOrCreate(
    maintenances,
    { vehicle: { id: ghi789.id }, status: MaintenanceStatus.IN_PROGRESS },
    {
      type: MaintenanceType.CORRECTIVE,
      description: 'Reemplazo de pastillas de freno',
      mileage: 88000,
      scheduledStart: new Date('2026-10-27T07:30:00-05:00'),
      scheduledEnd: new Date('2026-10-27T11:00:00-05:00'),
      status: MaintenanceStatus.IN_PROGRESS,
      vehicle: ghi789,
      mechanic: carlos,
      workshop: centro,
    },
  );
  await findOrCreate(
    maintenances,
    { vehicle: { id: abc123.id }, status: MaintenanceStatus.COMPLETED },
    {
      type: MaintenanceType.PREVENTIVE,
      description: 'Cambio de aceite y filtros',
      mileage: 45000,
      scheduledStart: new Date('2026-09-15T08:00:00-05:00'),
      scheduledEnd: new Date('2026-09-15T11:00:00-05:00'),
      status: MaintenanceStatus.COMPLETED,
      workPerformed:
        'Cambio de aceite 15W40, filtro de aceite y filtro de aire',
      finalCost: 350000,
      completedAt: new Date('2026-09-15T10:30:00-05:00'),
      finalMileage: 45120,
      vehicle: abc123,
      mechanic: laura,
      workshop: centro,
    },
  );

  console.log('Seed completed:', {
    users: await users.count(),
    mechanics: await mechanics.count(),
    workshops: await workshops.count(),
    vehicles: await vehicles.count(),
    maintenances: await maintenances.count(),
  });
  console.log(`Admin: ${admin.email} / Admin12345`);

  await app.close();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
