export interface VirtualReading {
  incubatorId: string;
  temperature: number;
  humidity: number;
}

class VirtualIncubator {
  private faultTicks = 0;

  constructor(
    readonly id: string,
    private temperature: number,
    private humidity: number,
    private readonly target: number,
    private readonly faultProne: boolean,
  ) {}

  step(): VirtualReading {
    let t = this.temperature + (this.target - this.temperature) * 0.15 + (Math.random() - 0.5) * 0.4;
    if (this.faultTicks > 0) {
      t += 0.9; // falla simulada: el calentador se queda pegado
      this.faultTicks -= 1;
    } else if (this.faultProne && Math.random() < 0.01) {
      this.faultTicks = 15;
    }
    const h = this.humidity + (55 - this.humidity) * 0.1 + (Math.random() - 0.5) * 2;
    this.temperature = t;
    this.humidity = Math.min(100, Math.max(0, h));
    return { incubatorId: this.id, temperature: t, humidity: this.humidity };
  }
}

// Simula varias incubadoras virtuales. La ultima sufre fallas ocasionales
// para poder ver las alertas en el dashboard sin hardware.
export class Simulation {
  private readonly units: VirtualIncubator[];

  constructor(ids: string[] = ['sim-1', 'sim-2', 'sim-3']) {
    this.units = ids.map(
      (id, i) => new VirtualIncubator(id, 37 + i * 0.2, 55, 37.5, i === ids.length - 1),
    );
  }

  step(): VirtualReading[] {
    return this.units.map((u) => u.step());
  }
}
