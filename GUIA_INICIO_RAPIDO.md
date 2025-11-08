# 🚀 Guía de Inicio Rápido - UNIR Frontend + Analytics

> **Nota:** Esta guía está escrita para usar **bash** (Linux, Mac, WSL, Git Bash). Si usas PowerShell en Windows, los comandos para activar el entorno virtual serán diferentes.

## 📋 Requisitos Previos

Verifica que tengas instalado:

- **Node.js** (v18 o superior)
- **Python** (v3.10 o superior)
- **npm** o **yarn**
- **pip** (gestor de paquetes de Python)

### Verificar instalaciones:

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar Python
python --version
# O si tienes Python 3
python3 --version

# Verificar pip
pip --version
# O
pip3 --version
```

---

## 🔧 Paso 1: Instalar Dependencias del Backend de Analytics

1. Abre una terminal (bash) y navega a la carpeta del backend de analytics:

```bash
cd unir_analytics
```

2. Crea un entorno virtual de Python (recomendado):

```bash
# Crear entorno virtual
python3 -m venv venv
# O si python3 no está disponible:
python -m venv venv

# Activar entorno virtual (Linux/Mac/WSL)
source venv/bin/activate
```

**Nota:** Una vez activado, verás `(venv)` al inicio de tu línea de comando.

3. Instala las dependencias de Python:

```bash
pip install -r requirements.txt
```

O si no tienes el archivo requirements.txt:

```bash
pip install fastapi uvicorn tzdata
```

**Nota importante para Windows:** El módulo `tzdata` es necesario para que `zoneinfo` funcione en Windows. Si instalas desde `requirements.txt`, ya está incluido.

---

## 📦 Paso 2: Instalar Dependencias del Frontend

1. Abre **otra terminal** (deja la del backend abierta) y navega a la raíz del proyecto:

```bash
cd /ruta/a/UnirFront
# O si estás en la misma terminal, simplemente:
cd ..
```

2. Instala las dependencias de Node.js:

```bash
npm install
```

---

## ⚙️ Paso 3: Verificar Configuración del .env

El archivo `.env` ya está creado con las siguientes configuraciones:

```env
VITE_API_URL=http://localhost:8003
VITE_WS_URL=ws://localhost:8003
VITE_ANALYTICS_API_URL=http://127.0.0.1:8000
```

**Nota:** Si tus backends corren en otros puertos, edita el archivo `.env` según corresponda.

---

## 🟢 Paso 4: Iniciar el Backend de Analytics

En la terminal donde estás en `unir_analytics`, ejecuta:

```bash
# Asegúrate de tener el entorno virtual activado
source venv/bin/activate

# Iniciar el servidor
uvicorn app.infra.api.main:app --reload
```

Deberías ver algo como:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

✅ **¡Perfecto!** El backend de analytics está corriendo en `http://127.0.0.1:8000`

---

## 🌐 Paso 5: Iniciar el Frontend

En la **otra terminal** (la que está en la raíz del proyecto), ejecuta:

```bash
npm run dev
```

Deberías ver algo como:

```
  VITE v6.3.5  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

✅ **¡Perfecto!** El frontend está corriendo en `http://localhost:3000`

---

## ✅ Paso 6: Verificar que Todo Funciona

1. **Abre tu navegador** y ve a: `http://localhost:3000`

2. **Navega a la página de Métricas:**
   - Si tienes un menú de navegación, haz clic en "Métricas"
   - O ve directamente a la ruta de métricas si está configurada

3. **Verifica que los datos se cargan:**
   - Deberías ver las métricas cargándose desde el backend
   - Si hay un error, verifica que el backend de analytics esté corriendo

4. **Prueba el endpoint directamente:**
   - Abre: `http://127.0.0.1:8000/analytics/dashboard`
   - Deberías ver un JSON con los datos del dashboard

---

## 🧪 Probar con Datos de Prueba

El backend de analytics tiene datos de prueba pre-cargados (seed). Si no ves datos:

1. Verifica en `unir_analytics/app/bootstrap.py` que `SEED_ON_START = True`
2. Reinicia el servidor de analytics

---

## 🔍 Solución de Problemas Comunes

### Error: "Cannot connect to analytics backend"

**Solución:**
- Verifica que el backend de analytics esté corriendo en `http://127.0.0.1:8000`
- Revisa el archivo `.env` y asegúrate de que `VITE_ANALYTICS_API_URL=http://127.0.0.1:8000`

### Error: "Module not found" en Python

**Solución:**
- Asegúrate de tener el entorno virtual activado (deberías ver `(venv)` en tu prompt)
- Si no está activado, ejecuta: `source venv/bin/activate`
- Reinstala las dependencias: `pip install -r requirements.txt`

### Error: "No module named 'tzdata'" o "ZoneInfoNotFoundError"

Este error ocurre especialmente en Windows cuando falta el módulo `tzdata` que es necesario para manejar zonas horarias.

**Solución:**
```bash
# Asegúrate de tener el entorno virtual activado
source venv/bin/activate

# Instala tzdata
pip install tzdata

# O reinstala todas las dependencias
pip install -r requirements.txt
```

### Error: "Port already in use"

**Solución:**
- Cambia el puerto en el archivo `.env` o en la configuración del servidor
- O detén el proceso que está usando ese puerto

### Los datos no aparecen en las métricas

**Solución:**
- Verifica que el seed esté activado en `bootstrap.py`
- Reinicia el servidor de analytics
- Abre la consola del navegador (F12) para ver errores

---

## 📝 Comandos Útiles

### Backend de Analytics:
```bash
# Activar entorno virtual (si no está activado)
source venv/bin/activate

# Iniciar servidor
uvicorn app.infra.api.main:app --reload

# Iniciar con host público (accesible desde otros dispositivos)
uvicorn app.infra.api.main:app --reload --host 0.0.0.0

# Desactivar entorno virtual (cuando termines)
deactivate
```

### Frontend:
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build
```

---

## 🎯 Resumen de Puertos

- **Frontend:** `http://localhost:3000`
- **Backend Analytics:** `http://127.0.0.1:8000`
- **Backend API Principal (opcional):** `http://localhost:8003`

---

## 📚 Próximos Pasos

1. **Explorar las métricas:** Navega por la página de métricas y revisa los diferentes gráficos
2. **Enviar datos:** Usa el endpoint `POST /messages` para agregar más datos de prueba
3. **Personalizar:** Ajusta los objetivos y métricas según tus necesidades

---

¡Listo! 🎉 Ya tienes todo funcionando. Si tienes algún problema, revisa la sección de solución de problemas o los logs en las terminales.

