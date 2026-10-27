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

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ToLowerCase()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
