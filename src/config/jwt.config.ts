import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfiguration = (config: ConfigService): JwtModuleOptions => {
  return {
    secret: config.getOrThrow<string>('jwt.secret'),
    signOptions: {
      expiresIn: config.getOrThrow<number>('jwt.expiresIn'),
    },
  };
};
