import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '../../../common/enum/role.enum.js';
import { ToLowerCase } from '../../../common/decorators/text-case.decorator.js';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Nestor Duran' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'nestor@feetcore.com' })
  @ToLowerCase()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123#',
    description: 'Min 8 characters, one uppecase, one lowercase and one number',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  password: string;

  @ApiProperty({ enum: Role, default: Role.TECHNICIAN })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
