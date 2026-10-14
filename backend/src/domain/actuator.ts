export type ActuatorKind = 'led' | 'buzzer';

export class Actuator {
  private _on = false;

  constructor(readonly id: string, readonly kind: ActuatorKind) {}

  set(on: boolean): void {
    this._on = on;
  }

  get on(): boolean {
    return this._on;
  }
}
