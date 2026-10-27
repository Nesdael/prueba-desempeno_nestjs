import { Module } from '@nestjs/common';
import { MechanicsService } from './mechanics.service.js';
import { MechanicsController } from './mechanics.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mechanic } from './entities/mechanic.entity.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Mechanic]), UsersModule],
  controllers: [MechanicsController],
  providers: [MechanicsService],
  exports: [MechanicsService],
})
export class MechanicsModule {}
