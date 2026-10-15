import { EmptySlot } from './components/EmptySlot';
import { IncubatorRow } from './components/IncubatorRow';
import { EXPECTED_INCUBATORS, STALE_AFTER_SECONDS } from './config';
import { useIncubators } from './hooks/useIncubators';
import { useNow } from './hooks/useNow';
import type { IncubatorSnapshot } from './types';

export default function App() {
  const { incubators, connected } = useIncubators();
  const now = useNow();

  const byId = Object.fromEntries(incubators.map((i) => [i.id, i])) as Record<string, IncubatorSnapshot>;
  const isOnline = (i: IncubatorSnapshot) =>
    now - new Date(i.updatedAt).getTime() <= STALE_AFTER_SECONDS * 1000;

  // Primero las esperadas (aunque no tengan datos), luego cualquier otra que haya llegado.
  const extraIds = incubators.map((i) => i.id).filter((id) => !EXPECTED_INCUBATORS.includes(id));
  const ids = [...EXPECTED_INCUBATORS, ...extraIds];

  const online = incubators.filter(isOnline);
  const inAlarm = online.filter((i) => i.alerts.some((a) => a.severity === 'critical')).length;
  const offTotal = ids.length - online.length;

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>Incubadoras</h1>
          <p>
            {online.length} en línea · {offTotal} apagadas
            {inAlarm > 0 && ` · ${inAlarm} en alarma`}
          </p>
        </div>
        <span className={`conn ${connected ? 'conn-on' : ''}`} role="status">
          {connected ? 'En vivo' : 'Sin conexión con el servidor'}
        </span>
      </header>

      {ids.map((id) =>
        byId[id] ? <IncubatorRow key={id} incubator={byId[id]} now={now} /> : <EmptySlot key={id} id={id} />,
      )}
    </main>
  );
}
