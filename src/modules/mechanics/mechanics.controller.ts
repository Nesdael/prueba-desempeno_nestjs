import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MechanicsService } from './mechanics.service.js';
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';
import { UpdateMechanicDto } from './dto/update-mechanic.dto.js';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator.js';
import { Role } from '../../common/enum/role.enum.js';
import { UpdateMechanicStatusDto } from './dto/update-mechanic-status.dto.js';

@ApiTags('Mechanics')
@Auth(Role.ADMIN)
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Post()
  create(@Body() createMechanicDto: CreateMechanicDto) {
    return this.mechanicsService.create(createMechanicDto);
  }

  @Get()
  findAll() {
    return this.mechanicsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mechanicsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMechanicDto: UpdateMechanicDto,
  ) {
    return this.mechanicsService.update(id, updateMechanicDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMechanicStatusDto,
  ) {
    return this.mechanicsService.updateStatus(id, dto.IsActive);
  }
}
