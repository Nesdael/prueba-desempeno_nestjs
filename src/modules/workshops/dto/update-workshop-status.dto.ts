import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateWorkshopStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isActive: boolean;
}
