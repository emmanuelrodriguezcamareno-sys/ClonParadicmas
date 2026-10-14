export type SensorKind = 'temperature' | 'humidity';

export class Sensor {
  private _value: number | null = null;
  private _updatedAt: Date | null = null;

  constructor(readonly id: string, readonly kind: SensorKind) {}

  update(value: number, at: Date = new Date()): void {
    this._value = value;
    this._updatedAt = at;
  }

  get value(): number | null {
    return this._value;
  }

  get updatedAt(): Date | null {
    return this._updatedAt;
  }
}
