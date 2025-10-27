# Integración de WhatsApp - Frontend UNIR

Este documento explica cómo configurar y usar la integración de WhatsApp en el frontend de UNIR.

## 🚀 Características Implementadas

### ✅ Funcionalidades Completadas

1. **Tipos TypeScript** - Tipos basados en el swagger-core.json
2. **Servicio de API** - Conexión con todos los endpoints del backend
3. **WebSocket** - Recepción de mensajes en tiempo real
4. **Hook personalizado** - `useMessages` para manejar estado de mensajes
5. **Página de mensajes actualizada** - Interfaz conectada con la API real
6. **Envío a WhatsApp** - Formulario para enviar mensajes a números de teléfono

### 🔧 Archivos Creados/Modificados

```
src/
├── types/api.ts              # Tipos TypeScript basados en swagger
├── services/
│   ├── api.ts               # Servicio para conectar con la API
│   └── websocket.ts         # Servicio WebSocket para tiempo real
├── hooks/
│   └── useMessages.ts       # Hook personalizado para manejar mensajes
├── config/
│   └── api.ts              # Configuración de la API
└── components/
    └── MessagesPage.tsx    # Página actualizada con funcionalidad real
```

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

### 2. Configuración del Backend

Asegúrate de que tu backend esté ejecutándose en:
- **API REST**: `http://localhost:8000`
- **WebSocket**: `ws://localhost:8000`

### 3. Configuración de Canales

En `src/config/api.ts`, ajusta los IDs de canales según tu backend:

```typescript
channels: {
  whatsapp: 1,    // ID del canal de WhatsApp en tu BD
  instagram: 2,   // ID del canal de Instagram en tu BD
  gmail: 3        // ID del canal de Gmail en tu BD
}
```

## 🎯 Cómo Usar

### 1. Ver Conversaciones

- Las conversaciones se cargan automáticamente al abrir la página
- Se muestran filtradas por plataforma (WhatsApp, Instagram, Gmail)
- Los mensajes no leídos se marcan con un punto rojo

### 2. Enviar Mensajes a Conversaciones Existentes

1. Selecciona una conversación de la lista
2. Escribe tu mensaje en el área de texto
3. Usa las plantillas predefinidas si lo deseas
4. Presiona Enter o haz clic en el botón de enviar

### 3. Enviar Mensajes a WhatsApp (Nuevos Números)

1. Haz clic en "Enviar WhatsApp" en la barra superior
2. Ingresa el número de teléfono (formato: +1234567890)
3. Escribe tu mensaje
4. Haz clic en enviar

### 4. Recibir Mensajes en Tiempo Real

- Los mensajes nuevos aparecen automáticamente gracias al WebSocket
- El estado de conexión se muestra en la parte superior
- Los mensajes se marcan como leídos automáticamente al seleccionar la conversación

## 🔌 Endpoints Utilizados

### Mensajes
- `GET /api/v1/messages` - Obtener mensajes con filtros
- `POST /api/v1/messages` - Crear nuevo mensaje
- `GET /api/v1/messages/{id}` - Obtener mensaje específico
- `PUT /api/v1/messages/{id}/read` - Marcar como leído
- `GET /api/v1/messages/unread/count` - Contar no leídos

### Conversaciones
- `GET /api/v1/conversations` - Obtener conversaciones
- `GET /api/v1/conversations/{id}` - Obtener conversación específica
- `POST /api/v1/conversations` - Crear nueva conversación

### Envío
- `POST /api/v1/send` - Enviar mensaje a canal específico

### WebSocket
- `ws://localhost:8000` - Conexión WebSocket para tiempo real

## 🐛 Solución de Problemas

### Error de Conexión a la API
- Verifica que el backend esté ejecutándose
- Revisa la URL en `src/config/api.ts`
- Comprueba las variables de entorno

### WebSocket No Conecta
- Verifica que el backend soporte WebSocket
- Revisa la URL de WebSocket en la configuración
- Comprueba la consola del navegador para errores

### Mensajes No Aparecen
- Verifica que los canales estén configurados correctamente
- Revisa que el backend esté procesando los mensajes
- Comprueba la consola para errores de API

## 📱 Flujo de Trabajo

1. **Usuario envía mensaje a WhatsApp** → Backend recibe → WebSocket notifica → Frontend actualiza
2. **Admin responde en frontend** → API envía mensaje → Backend procesa → WhatsApp entrega
3. **Nuevo número de WhatsApp** → Admin usa formulario → API crea conversación → Mensaje enviado

## 🔄 Próximos Pasos

Para completar la integración, asegúrate de:

1. **Configurar el backend** con los endpoints correctos
2. **Probar la conexión** con datos reales
3. **Ajustar los IDs de canales** según tu base de datos
4. **Configurar WhatsApp Business API** en el backend
5. **Probar el flujo completo** de envío y recepción

## 📞 Soporte

Si tienes problemas con la integración:

1. Revisa la consola del navegador para errores
2. Verifica que el backend esté funcionando correctamente
3. Comprueba la configuración de la API
4. Asegúrate de que los tipos de datos coincidan con el swagger
