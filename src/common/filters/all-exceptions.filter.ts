import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

/*
  - GLobal exception filter
  - Catches any error and reponds with a uniform format
  - {success: false, statusCode, message, path, timestamp}
  - Prevents known errors from reaching the client as 500
*/
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      // Nest errors (400, 401, 403, 404...) their codes and messages are preserved
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message;
    } else if (
      exception instanceof QueryFailedError &&
      (exception.driverError as any)?.code === '23505'
    ) {
      //Postgres 23505: duplicate value in a unique column(email, license plate...) A 409 reponse is returned
      status = HttpStatus.CONFLICT;
      message = 'Record already exists';
    } else {
      // Unexpected error: LOgged to the console without revealing details to the client
      this.logger.error(exception);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
