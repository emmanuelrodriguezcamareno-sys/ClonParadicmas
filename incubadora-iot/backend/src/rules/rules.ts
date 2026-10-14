// Paradigma declarativo: las reglas se DEFINEN como datos (que condicion y que mensaje).
// Paradigma logico (opcional): se evaluan contra "hechos" (Fact) y se obtienen conclusiones (Alert).
import { Trend } from '../functional/measurements';

export type Severity = 'warning' | 'critical';

export interface Fact {
  incubatorId: string;
  temperature: number;
  humidity: number;
  trend: Trend;
}

export interface Rule {
  id: string;
  severity: Severity;
  message: string;
  when: (fact: Fact) => boolean;
}

export interface Alert {
  ruleId: string;
  severity: Severity;
  message: string;
}

// Mismos limites que el prototipo del ESP32: alarma > 40 °C o < 25 °C.
export const THRESHOLDS = {
  tempCriticalHigh: 40,
  tempWarningHigh: 38,
  tempWarningLow: 27,
  tempCriticalLow: 25,
  humidityLow: 30,
  humidityHigh: 85,
} as const;

const T = THRESHOLDS;

export const RULES: readonly Rule[] = [
  {
    id: 'temp-critical-high',
    severity: 'critical',
    message: `Temperatura crítica: supera ${T.tempCriticalHigh} °C`,
    when: (f) => f.temperature > T.tempCriticalHigh,
  },
  {
    id: 'temp-warning-high',
    severity: 'warning',
    message: `Temperatura alta: se acerca al límite de ${T.tempCriticalHigh} °C`,
    when: (f) => f.temperature > T.tempWarningHigh && f.temperature <= T.tempCriticalHigh,
  },
  {
    id: 'temp-critical-low',
    severity: 'critical',
    message: `Temperatura crítica: bajo ${T.tempCriticalLow} °C`,
    when: (f) => f.temperature < T.tempCriticalLow,
  },
  {
    id: 'temp-warning-low',
    severity: 'warning',
    message: `Temperatura baja: se acerca al límite de ${T.tempCriticalLow} °C`,
    when: (f) => f.temperature < T.tempWarningLow && f.temperature >= T.tempCriticalLow,
  },
  {
    id: 'temp-rising-fast',
    severity: 'warning',
    message: 'La temperatura sube de forma sostenida',
    when: (f) => f.trend === 'rising' && f.temperature > T.tempWarningHigh - 2,
  },
  {
    id: 'humidity-out-of-range',
    severity: 'warning',
    message: `Humedad fuera de ${T.humidityLow}–${T.humidityHigh} %`,
    when: (f) => f.humidity < T.humidityLow || f.humidity > T.humidityHigh,
  },
];

export const evaluateRules = (fact: Fact, rules: readonly Rule[] = RULES): Alert[] =>
  rules
    .filter((r) => r.when(fact))
    .map((r) => ({ ruleId: r.id, severity: r.severity, message: r.message }));
