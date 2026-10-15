// Incubadoras que se muestran siempre. Si todavía no envían datos aparecen apagadas ("Sin conectar").
// Para acoplar otra placa: pon su INCUBATOR_ID en esta lista (o simplemente conéctala y aparecerá sola).
export const EXPECTED_INCUBATORS = ['incubadora-1', 'incubadora-2', 'incubadora-3'];

// Segundos sin recibir datos para considerar que una incubadora perdió la señal.
// El ESP32 envía cada 5 s, así que 20 s deja margen.
export const STALE_AFTER_SECONDS = 20;
