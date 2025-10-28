# Mock Backend for UNIR Messaging App

Minimal Express.js mock backend for testing all messaging platform endpoints.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or with auto-reload (development)
npm run dev
```

The server runs on:
- **HTTP API**: `http://localhost:8000`
- **WebSocket**: `ws://localhost:8001`

## 📡 Available Endpoints

### Platforms
- **WhatsApp**: `/api/v1/whatsapp/...`
- **Instagram**: `/api/v1/instagram/...`
- **Gmail**: `/api/v1/gmail/...`

### Common Endpoints (per platform)

#### Messages
- `GET /api/v1/:platform/messages` - Get messages
- `GET /api/v1/:platform/messages/:id` - Get single message
- `POST /api/v1/:platform/messages` - Create message
- `PUT /api/v1/:platform/messages/:id/read` - Mark as read
- `GET /api/v1/:platform/messages/unread/count` - Get unread count
- `POST /api/v1/:platform/send` - Send message
- `POST /api/v1/:platform/messages/unified` - Receive unified message

#### Conversations
- `GET /api/v1/:platform/conversations` - Get conversations
- `GET /api/v1/:platform/conversations/:id` - Get single conversation
- `POST /api/v1/:platform/conversations` - Create conversation
- `PUT /api/v1/:platform/conversations/:id/participant` - Update participant
- `PUT /api/v1/:platform/conversations/:id/deactivate` - Deactivate conversation

#### Channels
- `GET /api/v1/:platform/channels` - Get channels
- `GET /api/v1/:platform/channels/:name` - Get channel
- `GET /api/v1/:platform/channels/:name/stats` - Get channel stats

### Utility Endpoints
- `GET /health` - Health check
- `POST /api/reset` - Reset mock data
- `POST /api/broadcast` - Manually trigger WebSocket broadcast

## 📊 Mock Data

Each platform includes:
- **5 conversations** with realistic participant names
- **3-7 messages** per conversation
- **Mix of read/unread** status
- **Platform-specific** identifiers (phone numbers, usernames, emails)

## 🧪 Testing

### Test with curl

```bash
# Get conversations
curl http://localhost:8000/api/v1/whatsapp/conversations

# Get messages
curl http://localhost:8000/api/v1/instagram/messages

# Get health
curl http://localhost:8000/health

# Reset data
curl -X POST http://localhost:8000/api/reset
```

### Test WebSocket

```javascript
const ws = new WebSocket('ws://localhost:8001');

ws.on('open', () => {
  console.log('Connected');
});

ws.on('message', (data) => {
  console.log('Received:', JSON.parse(data));
});

// Trigger broadcast (in another terminal)
curl -X POST http://localhost:8000/api/broadcast \
  -H "Content-Type: application/json" \
  -d '{"type":"new_message","data":{"id":123,"content":"Test"}}'
```

## 📁 Project Structure

```
mock-backend/
├── package.json          # Dependencies
├── server.js            # All logic (single file)
└── README.md           # This file
```

## 🔧 Configuration

Edit `server.js` to customize:
- Number of conversations per platform
- Message count per conversation
- Mock data values
- Port numbers (lines 6-7)

## 💡 Usage Example

```javascript
// In your frontend, point to this backend:
const API_URL = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8001';

// All endpoints work exactly like the real backend!
await fetch(`${API_URL}/api/v1/whatsapp/conversations`);
await fetch(`${API_URL}/api/v1/instagram/messages`);
await fetch(`${API_URL}/api/v1/gmail/send`, {
  method: 'POST',
  body: JSON.stringify({
    channel: 'gmail',
    to: 'user@example.com',
    message: 'Hello!'
  })
});
```

## 🎯 Features

- ✅ All 45 endpoints implemented (15 per platform)
- ✅ In-memory data storage (fast, no DB needed)
- ✅ WebSocket support for real-time updates
- ✅ Automatic data generation with realistic values
- ✅ Query filters (limit, offset, conversation_id)
- ✅ Health check and reset endpoints
- ✅ CORS enabled for frontend access

## 📝 Notes

- Data resets on server restart
- No persistence (purely for testing)
- Single file for easy modification
- ~400 lines of code total
- Zero external dependencies beyond Express, WS, CORS

## 🚀 Next Steps

1. Update your frontend `.env` to point to this backend:
   ```
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_WS_URL=ws://localhost:8001
   ```

2. Run the mock backend:
   ```bash
   npm start
   ```

3. Start your frontend and test!

