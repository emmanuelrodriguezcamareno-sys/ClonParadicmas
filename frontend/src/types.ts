// Mantener sincronizado con backend/src/domain/incubator.ts
export type Trend = 'rising' | 'falling' | 'stable';
export type Severity = 'warning' | 'critical';

export interface Alert {
  ruleId: string;
  severity: Severity;
  message: string;
}

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
  source: 'esp32' | 'simulator';
  updatedAt: string;
}
