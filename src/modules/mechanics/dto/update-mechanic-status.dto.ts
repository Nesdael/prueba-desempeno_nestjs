import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateMechanicStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  IsActive: boolean;
}
