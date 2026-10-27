import { IsEmail, IsString } from 'class-validator';
import { ToLowerCase } from '../../../common/decorators/text-case.decorator.js';

export class LoginDto {
  @ToLowerCase()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
