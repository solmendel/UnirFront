# 🔗 Conexión entre Frontend (UnirFront) y Core API

## 📁 Estructura de Proyectos

```
Desktop/
├── UnirFront/              # Frontend React + Vite
│   ├── src/
│   ├── .env               # Configuración del frontend
│   └── package.json
│
└── Seminario-Api-Core/    # Backend FastAPI + MySQL
    ├── src/
    ├── .env               # Configuración del backend
    └── requirements.txt
```

---

## ✅ El Core API ya está preparado

El Core API (`Seminario-Api-Core`) **ya tiene todo configurado**:
- ✅ CORS habilitado para aceptar peticiones del frontend
- ✅ Endpoint `/api/v1/analytics/dashboard` funcionando
- ✅ Servicio de analytics con MySQL
- ✅ Corre en el puerto `8003`

---

## 🚀 Pasos para Conectar

### 1. **Preparar el Core API**

#### a) Navegar a la carpeta del Core:
```bash
cd /c/Users/Nicolas/Desktop/Seminario-Api-Core
```

#### b) Crear entorno virtual (si no lo has hecho):
```bash
python -m venv venv

# Activar el entorno virtual
# En Git Bash/WSL:
source venv/bin/activate
# O en PowerShell:
.\venv\Scripts\Activate.ps1
```

#### c) Instalar dependencias:
```bash
pip install -r requirements.txt
pip install tzdata  # Necesario en Windows
```

#### d) Configurar variables de entorno:

Crea un archivo `.env` en la raíz del proyecto (o copia desde `env.example`):

```env
# Base de datos MySQL
DB_HOST=seminario-mysql.cqlkyyeawvlh.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=seminario_db
DB_USER=seminario_admin
DB_PASSWORD=ChangeMe_Seminario123!

# API Core
API_HOST=0.0.0.0
API_PORT=8003
CORE_SECRET_KEY=tu-secret-key-muy-seguro-aqui

# URLs de los servicios de canal (opcional)
WHATSAPP_SERVICE_URL=http://localhost:8000
GMAIL_SERVICE_URL=http://localhost:8001
INSTAGRAM_SERVICE_URL=http://localhost:8002
```

#### e) Iniciar el Core API:
```bash
# Con uvicorn directamente:
uvicorn src.main:app --reload --host 0.0.0.0 --port 8003

# O usando Python:
python -m src.main
```

Verifica que esté corriendo:
- API: http://localhost:8003
- Swagger docs: http://localhost:8003/docs
- Analytics: http://localhost:8003/api/v1/analytics/dashboard

---

### 2. **Configurar el Frontend**

#### a) Navegar a la carpeta del frontend:
```bash
cd /c/Users/Nicolas/Desktop/UnirFront
```

#### b) El archivo `.env` ya está creado con la configuración correcta:

```env
# URL del API principal (Core API)
VITE_API_URL=http://localhost:8003

# URL del WebSocket
VITE_WS_URL=ws://localhost:8003

# URL del backend de Analytics (apunta al mismo Core API)
VITE_ANALYTICS_API_URL=http://localhost:8003

# Google OAuth Client ID (opcional)
# VITE_GOOGLE_CLIENT_ID=tu-client-id-aqui
```

**Nota:** El frontend ya está configurado para conectarse al puerto `8003`, que es donde corre el Core API. No necesitas cambiar nada si el Core API está en ese puerto.

#### c) Actualizar la URL de Analytics en el servicio:

Edita `src/services/analyticsService.ts`:

```typescript
constructor() {
  // Ahora apunta al Core API en el puerto 8003
  this.baseUrl = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:8003';
}

async getDashboard(): Promise<DashboardMetrics> {
  // El Core API usa /api/v1/analytics/dashboard
  return this.request<DashboardMetrics>('/api/v1/analytics/dashboard');
}
```

#### d) Instalar dependencias (si no lo has hecho):
```bash
npm install
```

#### e) Iniciar el frontend:
```bash
npm run dev
```

El frontend estará en: http://localhost:3000

---

### 3. **Eliminar o ignorar `unir_analytics`**

La carpeta `unir_analytics` era solo un backend de prueba. Ahora usarás el Core API.

**Opción 1: Eliminarla**
```bash
cd /c/Users/Nicolas/Desktop/UnirFront
rm -rf unir_analytics
```

**Opción 2: Ignorarla en git**
Agrega a `.gitignore`:
```
unir_analytics/
```

---

## 🧪 Verificar la Conexión

### 1. **Verifica que el Core API esté corriendo:**
```bash
curl http://localhost:8003/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "service": "Core Unified Messaging API",
  "version": "1.0.0",
  "database": "connected",
  "websocket_connections": 0
}
```

### 2. **Verifica el endpoint de analytics:**
```bash
curl http://localhost:8003/api/v1/analytics/dashboard
```

Deberías ver un JSON con:
```json
{
  "general": {...},
  "semana_anterior": {...},
  "semana_actual": {...},
  "comparativa_semanal": {...}
}
```

### 3. **Prueba el frontend:**
1. Abre http://localhost:3000
2. Ve a la página de Métricas
3. Deberías ver las métricas cargándose desde el Core API

---

## 🔄 Flujo Completo de Trabajo

### Terminal 1: Core API
```bash
cd /c/Users/Nicolas/Desktop/Seminario-Api-Core
source venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 8003
```

### Terminal 2: Frontend
```bash
cd /c/Users/Nicolas/Desktop/UnirFront
npm run dev
```

---

## 📡 Endpoints Disponibles

El Core API expone estos endpoints que el frontend ya está configurado para usar:

### Mensajes
- `GET /api/v1/messages` - Obtener mensajes
- `POST /api/v1/messages` - Crear mensaje
- `POST /api/v1/messages/unified` - Recibir mensajes unificados
- `POST /api/v1/send` - Enviar mensaje

### Conversaciones
- `GET /api/v1/conversations` - Obtener conversaciones
- `GET /api/v1/conversations/{id}` - Obtener conversación específica
- `POST /api/v1/conversations` - Crear conversación

### Canales
- `GET /api/v1/channels` - Obtener canales
- `GET /api/v1/channels/{name}` - Obtener canal específico
- `GET /api/v1/channels/{name}/stats` - Estadísticas del canal

### Analytics ⭐
- `GET /api/v1/analytics/dashboard` - Dashboard de métricas

### WebSocket
- `WS /ws` - Conexión WebSocket para tiempo real

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to backend"
**Solución:**
- Verifica que el Core API esté corriendo en el puerto 8003
- Revisa el archivo `.env` del frontend
- Abre http://localhost:8003/health en el navegador

### Error: "CORS policy error"
**Solución:**
- El Core API ya tiene CORS habilitado
- Si persiste, verifica que el Core API esté corriendo
- Revisa los logs del Core API

### Error: "Database connection failed"
**Solución:**
- Verifica las credenciales de MySQL en el archivo `.env` del Core API
- Asegúrate de que la base de datos `seminario_db` exista
- Verifica que puedas conectarte a la base de datos

### La página de métricas no muestra datos
**Solución:**
- Verifica que hay datos en la base de datos
- Ejecuta el script `insert_messages.sql` para cargar datos de prueba
- Revisa la consola del navegador (F12) para ver errores

---

## 📊 Diferencias entre `unir_analytics` y Core API

| Característica | unir_analytics (viejo) | Core API (nuevo) |
|---------------|------------------------|------------------|
| Base de datos | In-memory (RAM) | MySQL (persistente) |
| Puerto | 8000 | 8003 |
| Estructura | Simple/Mock | Arquitectura completa |
| Datos | Seed hardcodeado | Base de datos real |
| Endpoints | Solo analytics | Completo (mensajes, conversaciones, canales, analytics) |
| WebSocket | ❌ No | ✅ Sí |

---

## ✅ Checklist de Conexión

- [ ] Core API instalado y configurado
- [ ] Base de datos MySQL accesible
- [ ] Archivo `.env` del Core API configurado
- [ ] Core API corriendo en puerto 8003
- [ ] Endpoint `/api/v1/analytics/dashboard` accesible
- [ ] Frontend instalado
- [ ] Archivo `.env` del frontend configurado
- [ ] Frontend corriendo en puerto 3000
- [ ] Página de métricas cargando datos del Core API
- [ ] Carpeta `unir_analytics` eliminada o ignorada

---

## 🎯 Próximos Pasos

1. **Conectar otros servicios de canal:**
   - WhatsApp Service (puerto 8000)
   - Gmail Service (puerto 8001)
   - Instagram Service (puerto 8002)

2. **Configurar autenticación:**
   - Implementar login/registro
   - Conectar con `backend-unir-sqlite` si es necesario

3. **Poblar la base de datos:**
   - Ejecutar scripts SQL para datos de prueba
   - O conectar servicios de canal reales

4. **Personalizar métricas:**
   - Ajustar objetivos en la página de métricas
   - Agregar más visualizaciones si es necesario

---

¡Todo listo! 🎉 Ahora tu frontend está conectado al Core API con base de datos MySQL real.

