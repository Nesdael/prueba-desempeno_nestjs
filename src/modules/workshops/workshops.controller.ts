import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WorkshopsService } from './workshops.service.js';
import { CreateWorkshopDto } from './dto/create-workshop.dto.js';
import { ApiTags } from '@nestjs/swagger';
import { UpdateWorkshopStatusDto } from './dto/update-workshop-status.dto.js';
import { Auth } from '../../common/decorators/auth.decorator.js';
import { Role } from '../../common/enum/role.enum.js';

@ApiTags('Workshops')
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Auth(Role.ADMIN)
  @Post()
  create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return this.workshopsService.create(createWorkshopDto);
  }

  @Auth()
  @Get()
  findAll() {
    return this.workshopsService.findActive();
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workshopsService.findOne(id);
  }

  @Auth(Role.ADMIN)
  @Patch(':id/status')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWorkshopDto: UpdateWorkshopStatusDto,
  ) {
    return this.workshopsService.updateStatus(id, updateWorkshopDto.isActive);
  }
}
