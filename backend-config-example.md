# Configuración del Backend para Integración WhatsApp

## 📋 Requisitos del Backend

Para que el frontend funcione correctamente, tu backend debe tener:

### 1. Endpoints REST (Puerto 8000)

```python
# Ejemplo de configuración FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Core Unified Messaging API")

# CORS para permitir conexiones del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints requeridos según swagger-core.json
@app.get("/api/v1/messages")
async def get_messages(conversation_id: int = None, channel: str = None, limit: int = 50, offset: int = 0):
    # Implementar lógica para obtener mensajes
    pass

@app.post("/api/v1/messages")
async def create_message(message: MessageCreate):
    # Implementar lógica para crear mensaje
    pass

@app.get("/api/v1/conversations")
async def get_conversations(channel_id: int = None, limit: int = 50, offset: int = 0):
    # Implementar lógica para obtener conversaciones
    pass

@app.post("/api/v1/send")
async def send_message(request: SendMessageRequest):
    # Implementar lógica para enviar mensaje a WhatsApp
    pass

# ... otros endpoints según swagger-core.json
```

### 2. WebSocket (Puerto 8000)

```python
from fastapi import WebSocket
import json

@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Agregar cliente a la lista de conexiones
    clients.append(websocket)
    
    try:
        while True:
            # Escuchar mensajes del cliente
            data = await websocket.receive_text()
            # Procesar mensaje...
    except WebSocketDisconnect:
        clients.remove(websocket)

# Función para enviar mensaje a todos los clientes conectados
async def broadcast_message(message_type: str, data: dict):
    for client in clients:
        await client.send_text(json.dumps({
            "type": message_type,
            "data": data
        }))
```

### 3. Configuración de Base de Datos

```sql
-- Tabla de canales
CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar canales
INSERT INTO channels (id, name, display_name) VALUES 
(1, 'whatsapp', 'WhatsApp'),
(2, 'instagram', 'Instagram'),
(3, 'gmail', 'Gmail');

-- Tabla de conversaciones
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    participant_name VARCHAR(255),
    participant_identifier VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    channel_id INTEGER REFERENCES channels(id),
    external_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mensajes
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    direction VARCHAR(20) NOT NULL, -- 'inbound' o 'outbound'
    sender_name VARCHAR(255),
    sender_identifier VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    message_metadata TEXT,
    conversation_id INTEGER REFERENCES conversations(id),
    external_message_id VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Integración con WhatsApp Business API

```python
# Ejemplo usando la API de WhatsApp Business
import requests

class WhatsAppService:
    def __init__(self, access_token: str, phone_number_id: str):
        self.access_token = access_token
        self.phone_number_id = phone_number_id
        self.base_url = f"https://graph.facebook.com/v17.0/{phone_number_id}/messages"
    
    async def send_message(self, to: str, message: str):
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": message}
        }
        
        response = requests.post(self.base_url, headers=headers, json=data)
        return response.json()

# En el endpoint de envío
@app.post("/api/v1/send")
async def send_message(request: SendMessageRequest):
    if request.channel == "whatsapp":
        whatsapp_service = WhatsAppService(
            access_token="TU_ACCESS_TOKEN",
            phone_number_id="TU_PHONE_NUMBER_ID"
        )
        
        result = await whatsapp_service.send_message(
            to=request.to,
            message=request.message
        )
        
        # Guardar mensaje en la base de datos
        # Enviar notificación WebSocket
        await broadcast_message("new_message", {
            "conversation_id": conversation_id,
            "content": request.message,
            "direction": "outbound",
            # ... otros campos
        })
        
        return {"success": True, "message_id": result.get("messages", [{}])[0].get("id")}
```

### 5. Webhook para Recibir Mensajes de WhatsApp

```python
@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request):
    data = await request.json()
    
    # Procesar mensaje entrante de WhatsApp
    if data.get("entry"):
        for entry in data["entry"]:
            for change in entry.get("changes", []):
                if change["field"] == "messages":
                    for message in change["value"].get("messages", []):
                        # Extraer datos del mensaje
                        from_number = message["from"]
                        message_text = message["text"]["body"]
                        message_id = message["id"]
                        
                        # Buscar o crear conversación
                        conversation = await get_or_create_conversation(
                            participant_identifier=from_number,
                            channel_id=1,  # WhatsApp
                            external_id=from_number
                        )
                        
                        # Crear mensaje en la base de datos
                        new_message = await create_message({
                            "content": message_text,
                            "direction": "inbound",
                            "sender_identifier": from_number,
                            "conversation_id": conversation.id,
                            "external_message_id": message_id,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        # Notificar a clientes WebSocket
                        await broadcast_message("new_message", {
                            "id": new_message.id,
                            "content": message_text,
                            "direction": "inbound",
                            "conversation_id": conversation.id,
                            # ... otros campos
                        })
    
    return {"status": "ok"}
```

## 🔧 Variables de Entorno del Backend

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/unir_messaging

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=tu_access_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
WHATSAPP_WEBHOOK_VERIFY_TOKEN=tu_webhook_verify_token

# Servidor
HOST=0.0.0.0
PORT=8000
```

## 🚀 Comandos para Ejecutar el Backend

```bash
# Instalar dependencias
pip install fastapi uvicorn psycopg2-binary requests python-multipart

# Ejecutar servidor
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# O con Docker
docker run -p 8000:8000 tu-imagen-backend
```

## 📝 Notas Importantes

1. **CORS**: Asegúrate de configurar CORS para permitir conexiones desde `http://localhost:3000`
2. **WebSocket**: El WebSocket debe estar en el mismo puerto que la API REST
3. **Base de Datos**: Los IDs de canales deben coincidir con la configuración del frontend
4. **WhatsApp**: Necesitas una cuenta de WhatsApp Business y configurar la API
5. **Webhooks**: Configura el webhook de WhatsApp para recibir mensajes entrantes

## 🔍 Testing

```bash
# Probar endpoints
curl -X GET "http://localhost:8000/api/v1/messages"
curl -X GET "http://localhost:8000/api/v1/conversations"
curl -X POST "http://localhost:8000/api/v1/send" \
  -H "Content-Type: application/json" \
  -d '{"channel": "whatsapp", "to": "+1234567890", "message": "Hola!"}'

# Probar WebSocket
wscat -c ws://localhost:8000
```
