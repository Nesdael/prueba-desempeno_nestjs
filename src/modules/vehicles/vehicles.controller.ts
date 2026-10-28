import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { ApiKeyGuard } from '../../common/guards/api-key.guard.js';
import { Auth } from '../../common/decorators/auth.decorator.js';
import { Role } from '../../common/enum/role.enum.js';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  // Endpoint for external integrations: does not use JWT; requires an x-api-key.
  // This goes before ‘:term’ so that Nest does not interpret “external” as a token
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('x-api-key')
  @Get('external')
  findAvailableForIntegrations() {
    return this.vehiclesService.findAvailable();
  }

  @Auth(Role.ADMIN)
  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Auth()
  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Auth()
  @Get(':term')
  findOne(@Param('term') id: string) {
    return this.vehiclesService.findByIdOrPlate(id);
  }

  @Auth(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Auth(Role.ADMIN)
  @Delete(':id')
  inactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.inactivate(id);
  }
}
