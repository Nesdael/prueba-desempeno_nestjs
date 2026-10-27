import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { MaintenanceType } from '../../../common/enum/maintenance-type.enum.js';

export class CreateMaintenanceDto {
  @ApiProperty({ enum: MaintenanceType, example: MaintenanceType.PREVENTIVE })
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @ApiProperty({ example: 'Cambio de aceite y filtros' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 45000 })
  @IsInt()
  @Min(0)
  mileage: number;

  @ApiProperty({ example: '2026-11-03T07:30:00-05:00' })
  @IsDateString()
  scheduledStart: string;

  @ApiProperty({ example: '2026-11-03T09:00:00-05:00' })
  @IsDateString()
  scheduledEnd: string;

  @ApiProperty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty()
  @IsUUID()
  mechanicId: string;

  @ApiProperty()
  @IsUUID()
  workshopId: string;
}
