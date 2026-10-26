import { applyDecorators } from '@nestjs/common';
import { Role } from '../enum/role.enum.js';
import { Roles } from './roles.decorator.js';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const Auth = (...roles: Role[]) =>
  applyDecorators(
    Roles(...roles),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Missing or invalid token' }),
    ApiForbiddenResponse({
      description: 'Role lacks the required permissions',
    }),
  );
