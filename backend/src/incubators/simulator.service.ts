import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Simulation } from '../domain/simulation';
import { IncubatorsService } from './incubators.service';

@Injectable()
export class SimulatorService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private readonly simulation = new Simulation();

  constructor(
    private readonly incubators: IncubatorsService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    if (this.config.get('SIMULATOR_ENABLED', 'true') !== 'true') return;
    const every = Number(this.config.get('SIMULATOR_INTERVAL_MS', 3000));
    this.timer = setInterval(() => void this.tick(), every);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick() {
    await this.incubators.ingestMany(this.simulation.step(), 'simulator');
  }
}
