import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkshopDto {
  @ApiProperty({ example: 'Taller Centro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Calle 72 #45-10, Barranquilla' })
  @IsString()
  @IsNotEmpty()
  address: string;
}
