# Monitor de incubadoras IoT

Sistema para monitorear incubadoras con ESP32: el ESP32 envía temperatura y humedad al
backend, el backend evalúa reglas y las guarda en PostgreSQL, y el dashboard web se actualiza
en tiempo real. Incluye un simulador para trabajar sin hardware.

```
React + TypeScript  <-- HTTP + WebSocket -->  NestJS  <-->  PostgreSQL
 (dashboard)                                   ^  ^
                                               |  +-- Simulador (incubadoras virtuales)
                                     HTTP POST |
                                            ESP32 (incubadora física)
```

## Estructura

| Carpeta | Contenido |
|---|---|
| `backend/` | API NestJS, reglas, simulador, WebSocket |
| `frontend/` | Dashboard React + TypeScript (Vite) |
| `firmware/esp32_incubadora/` | Sketch de Arduino para el ESP32 |
| `docker-compose.yml` | Base de datos PostgreSQL local |

## Cómo correrlo

Requisitos: Node.js 20+, Docker Desktop y Git.

```bash
# 1. Base de datos
docker compose up -d

# 2. Backend (terminal 1)
cd backend
cp .env.example .env        # en Windows PowerShell: copy .env.example .env
npm install
npm run start:dev

# 3. Frontend (terminal 2)
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. Con `SIMULATOR_ENABLED=true` aparecen 3 incubadoras simuladas;
`sim-3` falla de vez en cuando para que veas las alertas.

## Conectar el ESP32

1. En `firmware/esp32_incubadora/` copia `secrets.example.h` como `secrets.h` y completa WiFi, IP del
   computador y la API key (la misma de `DEVICE_API_KEY` en `backend/.env`).
2. El ESP32 y el computador deben estar en la misma red WiFi. En Windows, permite el puerto 3000 en el firewall.
3. Sube el sketch desde el Arduino IDE (placa ESP32 Dev Module).

Prueba sin hardware:

```bash
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" -H "x-api-key: cambia-esta-clave" \
  -d '{"incubatorId":"incubadora-1","temperature":41.2,"humidity":55}'
```

## API

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/telemetry` | Una medición (requiere `x-api-key`) |
| POST | `/api/telemetry/batch` | Varias mediciones `{ "items": [...] }` |
| GET | `/api/incubators` | Estado actual de cada incubadora |
| GET | `/api/incubators/:id/history?limit=100` | Historial desde PostgreSQL |
| GET | `/api/health` | Comprobar que el servidor responde |

WebSocket (Socket.IO): `incubators:snapshot` al conectar e `incubator:update` en cada medición.

## Paradigmas y dónde están

| Paradigma | Dónde |
|---|---|
| Orientado a objetos | `backend/src/domain/` (`Incubator`, `Sensor`, `Actuator`, `Simulation`) |
| Funcional | `backend/src/functional/measurements.ts` (validación, media móvil, tendencia) |
| Declarativo | Reglas como datos en `backend/src/rules/rules.ts` y componentes React en `frontend/src/` |
| Reactivo | `Subject` de RxJS en `incubators.service.ts`, WebSocket y hook `useIncubators` |
| Concurrente | `Promise.allSettled` en `ingestMany` y el simulador con varias incubadoras |
| Lógico (opcional) | `evaluateRules`: hechos (`Fact`) contra condiciones, con alertas como conclusión |

## Pendiente (siguientes pasos)

- Usuarios y login (hoy el dashboard es abierto; solo el ESP32 usa API key).
- Migraciones de TypeORM en lugar de `synchronize: true`.
- Comandos hacia el ESP32 (hoy solo envía telemetría).
- Pruebas automáticas y despliegue (HTTPS real).
