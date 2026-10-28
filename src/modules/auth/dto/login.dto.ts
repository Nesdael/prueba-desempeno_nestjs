import { IsEmail, IsString } from 'class-validator';
import { ToLowerCase } from '../../../common/decorators/text-case.decorator.js';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@feetcore.com' })
  @ToLowerCase()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin12345' })
  @IsString()
  password: string;
}
