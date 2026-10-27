import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enum/role.enum.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

/*
  - Global authorization guard
  - Runs after JwtAuthGuard and compares the user's role
  - with the roles declared in @Roles() or @Aut()
*/
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  // Permitted roles, checked first in the method and then in the controller.
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // No roles declared(or empty array): being authenticated is sufficient
    if (!roles?.length) return true;

    // `request.user` is provideb by `JwtAuthGuard`. If the user's role is not permitted: 403
    const { user } = context.switchToHttp().getRequest();
    if (!roles.includes(user?.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }
    return true;
  }
}
