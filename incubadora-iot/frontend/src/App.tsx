import { IncubatorRow } from './components/IncubatorRow';
import { useIncubators } from './hooks/useIncubators';

export default function App() {
  const { incubators, connected } = useIncubators();
  const inAlarm = incubators.filter((i) => i.alerts.some((a) => a.severity === 'critical')).length;

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>Incubadoras</h1>
          <p>
            {incubators.length} en monitoreo
            {inAlarm > 0 && ` · ${inAlarm} en alarma`}
          </p>
        </div>
        <span className={`conn ${connected ? 'conn-on' : ''}`} role="status">
          {connected ? 'En vivo' : 'Sin conexión con el servidor'}
        </span>
      </header>

      {incubators.length === 0 ? (
        <p className="empty">
          Aún no llegan mediciones. Inicia el backend con el simulador activado o conecta tu ESP32.
        </p>
      ) : (
        incubators.map((i) => <IncubatorRow key={i.id} incubator={i} />)
      )}
    </main>
  );
}
