// Paradigma funcional: funciones puras, sin estado ni efectos secundarios.

export type Trend = 'rising' | 'falling' | 'stable';

export interface Reading {
  temperature: number;
  humidity: number;
}

export type Validation =
  | { status: 'ok'; value: Reading }
  | { status: 'error'; error: string };

export const LIMITS = {
  temperature: { min: -10, max: 80 },
  humidity: { min: 0, max: 100 },
} as const;

const inRange = (v: number, min: number, max: number): boolean =>
  Number.isFinite(v) && v >= min && v <= max;

export const roundTo = (n: number, decimals = 1): number => {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
};

// Validacion + transformacion de una medicion cruda.
export const validateReading = (r: Reading): Validation => {
  const t = LIMITS.temperature;
  const h = LIMITS.humidity;
  if (!inRange(r.temperature, t.min, t.max))
    return { status: 'error', error: `Temperatura fuera de rango (${t.min} a ${t.max} °C)` };
  if (!inRange(r.humidity, h.min, h.max))
    return { status: 'error', error: `Humedad fuera de rango (${h.min} a ${h.max} %)` };
  return {
    status: 'ok',
    value: { temperature: roundTo(r.temperature, 1), humidity: roundTo(r.humidity, 0) },
  };
};

export const movingAverage = (values: readonly number[], window = 5): number | null => {
  const slice = values.slice(-window);
  if (slice.length === 0) return null;
  return roundTo(slice.reduce((a, b) => a + b, 0) / slice.length, 2);
};

// Pendiente por minimos cuadrados (cambio por muestra).
export const slope = (values: readonly number[]): number => {
  const n = values.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  const num = values.reduce((acc, y, x) => acc + (x - meanX) * (y - meanY), 0);
  const den = values.reduce((acc, _, x) => acc + (x - meanX) ** 2, 0);
  return den === 0 ? 0 : num / den;
};

export const trend = (values: readonly number[], window = 8, threshold = 0.1): Trend => {
  if (values.length < 3) return 'stable';
  const s = slope(values.slice(-window));
  if (s > threshold) return 'rising';
  if (s < -threshold) return 'falling';
  return 'stable';
};
