import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MaintenanceStatus } from '../../../common/enum/maintenance-status.enum.js';

export class UpdateMaintenanceStatusDto {
  @ApiProperty({
    enum: MaintenanceStatus,
    example: MaintenanceStatus.IN_PROGRESS,
  })
  @IsEnum(MaintenanceStatus)
  status: MaintenanceStatus;

  // Los cuatro campos siguientes son obligatorios al pasar a COMPLETED.
  @ApiPropertyOptional({ example: 'Se cambia aceite 15W40 y filtro' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  workPerformed?: string;

  @ApiPropertyOptional({ example: 350000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  finalCost?: number;

  @ApiPropertyOptional({ example: '2026-11-03T08:45:00-05:00' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({ example: 45120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  finalMileage?: number;
}
