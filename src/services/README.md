# API Services Documentation

This directory contains the API service layer for communicating with the UNIR backend.

## Files

- **api.ts** - Main API service with all REST endpoints
- **websocket.ts** - WebSocket service for real-time communication
- **API_USAGE_EXAMPLES.md** - Detailed usage examples for all endpoints
- **README.md** - This file

## API Endpoints Coverage

The API service implements all backend endpoints:

### Health & Status
- ✅ `GET /` - Root health check
- ✅ `GET /health` - Detailed health check with WebSocket connection count

### Messages
- ✅ `GET /api/v1/messages` - Get messages (with query params: conversation_id, channel, limit, offset)
- ✅ `POST /api/v1/messages` - Create a new message
- ✅ `GET /api/v1/messages/{message_id}` - Get a specific message
- ✅ `PUT /api/v1/messages/{message_id}/read` - Mark message as read
- ✅ `GET /api/v1/messages/unread/count` - Get unread count
- ✅ `POST /api/v1/messages/unified` - Receive unified messages
- ✅ `POST /api/v1/send` - Send message through a specific channel

### Conversations
- ✅ `GET /api/v1/conversations` - Get conversations (with query params: channel_id, limit, offset)
- ✅ `POST /api/v1/conversations` - Create a conversation
- ✅ `GET /api/v1/conversations/{conversation_id}` - Get a conversation with messages
- ✅ `PUT /api/v1/conversations/{conversation_id}/participant` - Update participant name
- ✅ `PUT /api/v1/conversations/{conversation_id}/deactivate` - Deactivate a conversation

### Channels
- ✅ `GET /api/v1/channels` - Get all active channels
- ✅ `GET /api/v1/channels/{channel_name}` - Get a specific channel by name
- ✅ `GET /api/v1/channels/{channel_name}/stats` - Get channel statistics

### Real-time
- ✅ `WS /ws` - WebSocket for real-time messaging
- ✅ `POST /broadcast` - Broadcast a message to all connected WebSocket clients

## Configuration

Update the API base URL in `src/config/api.ts` or use environment variables:

```bash
# .env file
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Usage

Import and use the services:

```typescript
import { apiService } from './services/api';
import { wsService } from './services/websocket';

// Make API calls
const conversations = await apiService.getConversations();

// Connect to WebSocket
wsService.connect({
  onNewMessage: (message) => {
    console.log('New message:', message);
  }
});
```

For detailed examples, see [API_USAGE_EXAMPLES.md](./API_USAGE_EXAMPLES.md).

## Channel Mapping

The service includes utility functions to map channel IDs to platform names:

- Channel ID 1: WhatsApp
- Channel ID 2: Instagram
- Channel ID 3: Gmail

These can be customized in `src/config/api.ts`.

