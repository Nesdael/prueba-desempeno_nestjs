import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import helmet from 'helmet';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor.js';
import { Reflector } from '@nestjs/core';
import { AllExceptionFilter } from '../common/filters/all-exceptions.filter.js';

export const setupApp = (app: INestApplication): void => {
  app.use(helmet());

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionFilter());

  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  app.enableShutdownHooks();
};
