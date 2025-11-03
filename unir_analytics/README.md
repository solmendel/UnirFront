
# UNIR Analytics (Python FastAPI, In-Memory)

## Requisitos
- Python 3.10+
- `pip install fastapi uvicorn`

## Ejecutar
```bash
uvicorn app.infra.api.main:app --reload
```
API corre por defecto en `http://127.0.0.1:8000`.

## Endpoints
- `POST /messages` — ingesta de mensajes normalizados
  ```json
  {
    "channel": "whatsapp",
    "sender": "+54911...",
    "message": "Hola",
    "timestamp": "2025-10-24T18:00:00Z",
    "outgoing": false
  }
  ```
  Campos opcionales: `agent_id`, `tag`.

- `GET /analytics/dashboard` — devuelve:
  ```json
  {
    "general": {...},
    "semana_anterior": {...},
    "semana_actual": {...}
  }
  ```

## Notas de diseño
- Zona horaria: `America/Argentina/Buenos_Aires` (stdlib `zoneinfo`).
- Ventanas lunes–domingo (inclusive) con half-open `[from, to)` en UTC.
- FRT semanal se **atribuye a la semana del OUT**.
- SLA 24h semanal: denominador = conv con primer IN en la semana.

## Semillas opcionales
Podés activar el `SEED_ON_START=True` en `app/bootstrap.py` para cargar datos de prueba.
