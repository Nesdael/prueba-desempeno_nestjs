import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ToLowerCase } from '../../../common/decorators/text-case.decorator.js';

export class CreateMechanicDto {
  @ApiProperty({ example: 'Carlos Pérez' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'carlos.perez@fleetcore.com' })
  @ToLowerCase()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Motor y transmisión' })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiPropertyOptional({ description: 'Id del usuario TECHNICIAN vinculado' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
