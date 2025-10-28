# Setup script for Core API environment
# Run this script to create the .env file

$envContent = @"
# Configuración para Core API
# Archivo de configuración del entorno

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

# URLs de los servicios de canal (opcional, para referencia)
WHATSAPP_SERVICE_URL=http://localhost:8000
GMAIL_SERVICE_URL=http://localhost:8001
INSTAGRAM_SERVICE_URL=http://localhost:8002
"@

# Create .env file
$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MySQL is running on localhost:3306" -ForegroundColor Cyan
Write-Host "2. Create the database: mysql -u root -p palta123 -e 'CREATE DATABASE unified_messaging;'" -ForegroundColor Cyan
Write-Host "3. Install Python dependencies: pip install -r requirements.txt" -ForegroundColor Cyan
Write-Host "4. Run the Core API: python -m src.main" -ForegroundColor Cyan

