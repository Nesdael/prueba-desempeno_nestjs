import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const logger = new Logger('Swagger');

export const swaggerConfiguration = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('FleetCore API')
    .setDescription(
      'Fleet maintenance management API: vehicles, mechanics, workshops and maintenances',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  logger.log('Docs avaible at api/docs');
};
