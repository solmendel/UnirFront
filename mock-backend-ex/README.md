# UNIR Mock Backend

A lightweight Express.js mock backend for testing the UNIR frontend application. This backend implements all the required API endpoints to test the frontend functionality without needing the actual backend server.

## Features

- ✅ Complete REST API implementation
- ✅ WebSocket support for real-time messaging
- ✅ Mock data for testing
- ✅ CORS enabled for frontend integration
- ✅ All endpoints from the backend specification

## Quick Start

### 1. Install Dependencies

```bash
cd mock-backend-ex
npm install
```

### 2. Start the Server

```bash
npm start
```

Or with auto-reload during development:

```bash
npm run dev
```

The server will start on `http://localhost:8000`

### 3. Configure Frontend

Make sure your frontend `.env` file has:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## API Endpoints

### Health & Status
- `GET /` - Root health check
- `GET /health` - Detailed health check with WebSocket connection count

### Messages
- `GET /api/v1/messages` - Get messages (query params: conversation_id, channel, limit, offset)
- `POST /api/v1/messages` - Create a new message
- `GET /api/v1/messages/:message_id` - Get a specific message
- `PUT /api/v1/messages/:message_id/read` - Mark message as read
- `GET /api/v1/messages/unread/count` - Get unread count
- `POST /api/v1/messages/unified` - Receive unified messages
- `POST /api/v1/send` - Send message through a specific channel

### Conversations
- `GET /api/v1/conversations` - Get conversations (query params: channel_id, limit, offset)
- `POST /api/v1/conversations` - Create a conversation
- `GET /api/v1/conversations/:conversation_id` - Get conversation with messages
- `PUT /api/v1/conversations/:conversation_id/participant` - Update participant name
- `PUT /api/v1/conversations/:conversation_id/deactivate` - Deactivate conversation

### Channels
- `GET /api/v1/channels` - Get all active channels
- `GET /api/v1/channels/:channel_name` - Get a specific channel by name
- `GET /api/v1/channels/:channel_name/stats` - Get channel statistics

### Real-time
- `WS /ws` - WebSocket for real-time messaging
- `POST /broadcast` - Broadcast message to all connected clients

## Mock Data

The mock backend includes:

### Channels
- WhatsApp (id: 1)
- Instagram (id: 2)
- Gmail (id: 3)

### Sample Conversations
- John Doe (WhatsApp)
- Jane Smith (Gmail)

### Sample Messages
- 3 pre-loaded messages for testing

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:8000/

# Get conversations
curl http://localhost:8000/api/v1/conversations

# Get messages
curl http://localhost:8000/api/v1/messages

# Send a message
curl -X POST http://localhost:8000/api/v1/send \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp",
    "to": "34612345678",
    "message": "Hello from UNIR!"
  }'

# Get unread count
curl http://localhost:8000/api/v1/messages/unread/count
```

### Using the Frontend

1. Start the mock backend: `npm start`
2. Start the frontend: In the main project, run `npm run dev`
3. The frontend will connect to `http://localhost:8000`
4. Open the browser console to see API calls
5. Open the mock backend terminal to see incoming requests

## WebSocket Testing

Connect to the WebSocket endpoint:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

## Development

The mock backend stores data in memory. On restart, all data resets to the initial mock data.

To persist data, you could:
1. Add a simple file-based storage (e.g., JSON file)
2. Add a database (e.g., SQLite)
3. Integrate with your actual backend

## Port Configuration

Change the port by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

Or update it in `server.js`:

```javascript
const PORT = process.env.PORT || 8000;
```

## Logs

The server logs:
- All incoming requests
- WebSocket connections/disconnections
- WebSocket messages

## Troubleshooting

### Port Already in Use
If port 8000 is already in use:

```bash
PORT=8001 npm start
```

Update your frontend `.env` accordingly:

```env
VITE_API_URL=http://localhost:8001
VITE_WS_URL=ws://localhost:8001
```

### CORS Issues
CORS is already enabled in the mock backend. If you encounter issues:
- Check that your frontend URL is not blocked by the browser
- Verify the `baseUrl` in `src/config/api.ts`

### WebSocket Not Connecting
- Check that the WebSocket URL includes `/ws`: `ws://localhost:8000/ws`
- Check browser console for connection errors
- Verify the backend logs show WebSocket connections

## License

MIT

