import { Sensor } from './sensor';
import { Actuator } from './actuator';
import { Reading, Trend, movingAverage, trend } from '../functional/measurements';
import { Alert, Fact } from '../rules/rules';

export type Source = 'esp32' | 'simulator';

export interface IncubatorSnapshot {
  id: string;
  temperature: number;
  humidity: number;
  trend: Trend;
  average: number | null;
  history: number[];
  alerts: Alert[];
  led: boolean;
  buzzer: boolean;
  source: Source;
  updatedAt: string;
}

// El "gemelo digital" de una incubadora: agrupa sensores, actuadores y estado.
export class Incubator {
  readonly temperature: Sensor;
  readonly humidity: Sensor;
  readonly led: Actuator;
  readonly buzzer: Actuator;
  private readonly history: number[] = [];
  private alerts: Alert[] = [];
  private source: Source = 'esp32';

  constructor(readonly id: string, private readonly maxHistory = 30) {
    this.temperature = new Sensor(`${id}-temp`, 'temperature');
    this.humidity = new Sensor(`${id}-hum`, 'humidity');
    this.led = new Actuator(`${id}-led`, 'led');
    this.buzzer = new Actuator(`${id}-buzzer`, 'buzzer');
  }

  registerReading(reading: Reading, source: Source, at: Date = new Date()): void {
    this.temperature.update(reading.temperature, at);
    this.humidity.update(reading.humidity, at);
    this.source = source;
    this.history.push(reading.temperature);
    if (this.history.length > this.maxHistory) this.history.shift();
  }

  buildFact(): Fact {
    return {
      incubatorId: this.id,
      temperature: this.temperature.value,
      humidity: this.humidity.value,
      trend: trend(this.history),
    };
  }

  applyAlerts(alerts: Alert[]): void {
    this.alerts = alerts;
    const critical = alerts.some((a) => a.severity === 'critical');
    this.led.set(critical);
    this.buzzer.set(critical);
  }

  snapshot(): IncubatorSnapshot {
    return {
      id: this.id,
      temperature: this.temperature.value,
      humidity: this.humidity.value,
      trend: trend(this.history),
      average: movingAverage(this.history),
      history: [...this.history],
      alerts: this.alerts,
      led: this.led.on,
      buzzer: this.buzzer.on,
      source: this.source,
      updatedAt: (this.temperature.updatedAt ?? new Date()).toISOString(),
    };
  }
}
