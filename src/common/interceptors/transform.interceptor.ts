import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

/*
  - Global interceptor for successful responses
  - wraps the return value of each controller in a uniform format
  - {success: true, statusCode, data, timestap}
*/
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<unknown> {
    // HTTP status code that Nest assigned to the response (200, 201.... )
    const statusCode = context.switchToHttp().getRequest().statusCode;
    // next.handle() executes the controller; map transforms its reponse
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
