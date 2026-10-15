import { STALE_AFTER_SECONDS } from '../config';
import type { IncubatorSnapshot, Trend } from '../types';
import { Sparkline } from './Sparkline';

const TREND_LABEL: Record<Trend, string> = {
  rising: 'Subiendo',
  falling: 'Bajando',
  stable: 'Estable',
};

function levelOf(i: IncubatorSnapshot): 'critical' | 'warning' | 'ok' {
  if (i.alerts.some((a) => a.severity === 'critical')) return 'critical';
  if (i.alerts.length > 0) return 'warning';
  return 'ok';
}

const LEVEL_LABEL = { critical: 'Alarma', warning: 'Atención', ok: 'Normal' } as const;

function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  return `${Math.floor(seconds / 3600)} h`;
}

function Lamp({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`lamp ${on ? 'lamp-on' : ''}`}>
      <span className="lamp-dot" aria-hidden="true" />
      {label} {on ? 'activo' : 'apagado'}
    </span>
  );
}

interface Props {
  incubator: IncubatorSnapshot;
  now: number;
}

export function IncubatorRow({ incubator: i, now }: Props) {
  const ageSeconds = Math.max(0, Math.round((now - new Date(i.updatedAt).getTime()) / 1000));
  const sourceLabel = i.source === 'esp32' ? 'ESP32 física' : 'Simulada';

  // Sin datos recientes: no se muestran valores viejos ni alarmas.
  if (ageSeconds > STALE_AFTER_SECONDS) {
    return (
      <article className="row row-offline">
        <div className="cell cell-id">
          <h2>{i.id}</h2>
          <p>{sourceLabel}</p>
        </div>
        <div className="cell cell-temp">
          <span className="big">--</span>
          <span className="unit">°C</span>
          <p>Sin datos recientes</p>
        </div>
        <div className="cell cell-hum">
          <span className="mid">--</span>
          <span className="unit">% humedad</span>
        </div>
        <div className="cell cell-spark" />
        <div className="cell cell-state">
          <span className="status status-offline">Sin señal</span>
          <p>Última medición hace {formatAge(ageSeconds)}</p>
        </div>
      </article>
    );
  }

  const level = levelOf(i);
  const time = new Date(i.updatedAt).toLocaleTimeString('es');
  return (
    <article className={`row row-${level}`}>
      <div className="cell cell-id">
        <h2>{i.id}</h2>
        <p>{sourceLabel}</p>
      </div>

      <div className="cell cell-temp">
        <span className="big">{i.temperature.toFixed(1)}</span>
        <span className="unit">°C</span>
        <p>
          {TREND_LABEL[i.trend]}
          {i.average !== null && ` · media ${i.average.toFixed(1)} °C`}
        </p>
      </div>

      <div className="cell cell-hum">
        <span className="mid">{i.humidity.toFixed(0)}</span>
        <span className="unit">% humedad</span>
      </div>

      <div className="cell cell-spark">
        <Sparkline values={i.history} />
      </div>

      <div className="cell cell-state">
        <span className={`status status-${level}`}>{LEVEL_LABEL[level]}</span>
        <Lamp on={i.led} label="LED" />
        <Lamp on={i.buzzer} label="Buzzer" />
        <p>Actualizado {time}</p>
      </div>

      {i.alerts.length > 0 && (
        <ul className="alerts">
          {i.alerts.map((a) => (
            <li key={a.ruleId} className={`alert-${a.severity}`}>
              {a.message}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
