import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, Subject } from 'rxjs';
import { Repository } from 'typeorm';
import { Incubator, IncubatorSnapshot, Source } from '../domain/incubator';
import { validateReading } from '../functional/measurements';
import { evaluateRules } from '../rules/rules';
import { Measurement } from './measurement.entity';
import { TelemetryDto } from './telemetry.dto';

@Injectable()
export class IncubatorsService {
  private readonly incubators = new Map<string, Incubator>();

  // Paradigma reactivo: cada medicion publica un evento; el gateway (WebSocket)
  // y cualquier otro interesado se suscriben y reaccionan.
  private readonly subject = new Subject<IncubatorSnapshot>();
  readonly updates$: Observable<IncubatorSnapshot> = this.subject.asObservable();

  constructor(@InjectRepository(Measurement) private readonly repo: Repository<Measurement>) {}

  async ingest(dto: TelemetryDto, source: Source = 'esp32'): Promise<IncubatorSnapshot> {
    const check = validateReading({ temperature: dto.temperature, humidity: dto.humidity });
    if (check.status === 'error') throw new BadRequestException(check.error);

    const incubator = this.getOrCreate(dto.incubatorId);
    incubator.registerReading(check.value, source);
    incubator.applyAlerts(evaluateRules(incubator.buildFact()));

    const snapshot = incubator.snapshot();
    this.subject.next(snapshot);

    await this.repo.save(
      this.repo.create({
        incubatorId: dto.incubatorId,
        temperature: check.value.temperature,
        humidity: check.value.humidity,
        source,
      }),
    );
    return snapshot;
  }

  // Paradigma concurrente: las mediciones de varias incubadoras se procesan en paralelo.
  async ingestMany(items: TelemetryDto[], source: Source = 'esp32') {
    const results = await Promise.allSettled(items.map((i) => this.ingest(i, source)));
    const accepted = results.filter((r) => r.status === 'fulfilled').length;
    return { received: items.length, accepted, rejected: items.length - accepted };
  }

  list(): IncubatorSnapshot[] {
    return [...this.incubators.values()].map((i) => i.snapshot());
  }

  async history(incubatorId: string, limit = 100) {
    const rows = await this.repo.find({
      where: { incubatorId },
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 1000),
    });
    return rows.reverse();
  }

  private getOrCreate(id: string): Incubator {
    let incubator = this.incubators.get(id);
    if (!incubator) {
      incubator = new Incubator(id);
      this.incubators.set(id, incubator);
    }
    return incubator;
  }
}
