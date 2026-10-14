import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsGateway } from './events.gateway';
import { IncubatorsController } from './incubators.controller';
import { IncubatorsService } from './incubators.service';
import { Measurement } from './measurement.entity';
import { SimulatorService } from './simulator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Measurement])],
  controllers: [IncubatorsController],
  providers: [IncubatorsService, EventsGateway, SimulatorService],
})
export class IncubatorsModule {}
