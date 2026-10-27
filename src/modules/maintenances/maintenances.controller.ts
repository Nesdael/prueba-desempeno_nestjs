import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '../../common/enum/role.enum.js';
import { MaintenancesService } from './maintenances.service.js';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto.js';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto.js';

type AuthUser = { sub: string; role: Role };

@ApiTags('Maintenances')
@Controller('maintenances')
export class MaintenancesController {
  constructor(private readonly maintenancesService: MaintenancesService) {}

  @Auth(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenancesService.create(dto);
  }

  @Auth(Role.ADMIN)
  @Get()
  findAll() {
    return this.maintenancesService.findAll();
  }

  // Las rutas fijas van antes de ':id' para que Nest no las tome como un id.
  @Auth(Role.ADMIN)
  @Get('active')
  findActive() {
    return this.maintenancesService.findActive();
  }

  @Auth(Role.TECHNICIAN)
  @Get('me')
  findMine(@CurrentUser('sub') userId: string) {
    return this.maintenancesService.findMine(userId);
  }

  @Auth(Role.ADMIN)
  @Get('vehicle/:vehicleId')
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.maintenancesService.findByVehicle(vehicleId);
  }

  @Auth(Role.ADMIN)
  @Get('vehicle/:vehicleId/history')
  findHistory(@Param('vehicleId') vehicleId: string) {
    return this.maintenancesService.findHistory(vehicleId);
  }

  @Auth(Role.ADMIN)
  @Get('mechanic/:mechanicId')
  findByMechanic(@Param('mechanicId', ParseUUIDPipe) mechanicId: string) {
    return this.maintenancesService.findByMechanic(mechanicId);
  }

  @Auth(Role.ADMIN, Role.TECHNICIAN)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.maintenancesService.findOne(id, user);
  }

  @Auth(Role.ADMIN, Role.TECHNICIAN)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.maintenancesService.updateStatus(id, dto, user);
  }
}
