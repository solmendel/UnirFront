# Core API Setup Instructions

## Quick Start

### 1. Create Environment File

Run the setup script in PowerShell:

```powershell
cd core-mock
.\setup_env.ps1
```

Or manually create `.env` file with this content:

```env
# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=unified_messaging
DB_USER=root
DB_PASSWORD=palta123

# API Core
API_HOST=0.0.0.0
API_PORT=8003
CORE_SECRET_KEY=unir-core-secret-key-2024-safe-and-secure

# URLs de los servicios de canal
WHATSAPP_SERVICE_URL=http://localhost:8000
GMAIL_SERVICE_URL=http://localhost:8001
INSTAGRAM_SERVICE_URL=http://localhost:8002
```

### 2. Setup MySQL Database

Make sure MySQL is running, then create the database:

```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE unified_messaging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Or use the provided script:
```bash
mysql -u root -p palta123 < setup_database.sql
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Core API

```bash
python -m src.main
```

The API will be available at: **http://localhost:8003**

### 5. Connect Frontend to Core API

Create a `.env` file in the root directory (UnirFront):

```env
VITE_API_URL=http://localhost:8003
VITE_WS_URL=ws://localhost:8003
```

Then restart the frontend:
```bash
npm run dev
```

## Configuration Details

### Database Connection
- **Host**: localhost
- **Port**: 3306
- **Database**: unified_messaging
- **User**: root
- **Password**: palta123 (change this in production!)

### API Settings
- **Host**: 0.0.0.0 (accessible from all interfaces)
- **Port**: 8003
- **WebSocket**: ws://localhost:8003/ws

## Troubleshooting

### MySQL Connection Issues
```bash
# Check if MySQL is running
mysql -u root -p palta123 -e "SELECT 1;"

# If it fails, start MySQL service
# Windows: Services > MySQL > Start
```

### Python Dependencies
```bash
# If pip fails, try:
python -m pip install -r requirements.txt

# Or use virtual environment:
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Port Already in Use
```bash
# Change port in .env:
API_PORT=8004
```

## API Endpoints

Once running, access:

- **API**: http://localhost:8003
- **Health**: http://localhost:8003/health
- **WebSocket**: ws://localhost:8003/ws
- **Swagger Docs**: http://localhost:8003/docs
- **ReDoc**: http://localhost:8003/redoc

## Default Channels

The Core API automatically creates 3 default channels on startup:

1. **WhatsApp** (id: 1)
2. **Gmail** (id: 2)
3. **Instagram** (id: 3)

## Next Steps

1. ✅ Core API is running
2. ✅ Frontend is configured (via .env in root)
3. ✅ Test with: http://localhost:8003/health
4. ✅ Open frontend and connect!

