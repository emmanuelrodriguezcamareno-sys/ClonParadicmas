// Espacio reservado para una incubadora que todavía no se ha conectado.
export function EmptySlot({ id }: { id: string }) {
  return (
    <article className="row row-offline row-empty">
      <div className="cell cell-id">
        <h2>{id}</h2>
        <p>Sin conectar</p>
      </div>
      <div className="cell cell-temp">
        <span className="big">--</span>
        <span className="unit">°C</span>
      </div>
      <div className="cell cell-hum">
        <span className="mid">--</span>
        <span className="unit">% humedad</span>
      </div>
      <div className="cell cell-spark" />
      <div className="cell cell-state">
        <span className="status status-offline">Apagada</span>
        <p>Esperando su primera medición</p>
      </div>
    </article>
  );
}
