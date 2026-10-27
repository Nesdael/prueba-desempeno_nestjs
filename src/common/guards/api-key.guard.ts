import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/*
    -Guard for external integrations
    - Validates the "x-api-key" header against the keys in the API_KEYS variable
    - Used in the route along with @Public() so that it does not require a JWT
*/

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validKeys = this.config.getOrThrow<string[]>('apiKeys');

    // No header or a key not in the list: 401
    if (!apiKey || !validKeys.includes(apiKey)) {
      throw new UnauthorizedException('invalid or missing API kay');
    }
    return true;
  }
}
