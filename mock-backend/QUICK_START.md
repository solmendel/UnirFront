# Quick Start Guide

## 🚀 Start the Mock Backend

```bash
# In the mock-backend directory
npm start
```

You should see:
```
✅ Mock backend running on http://localhost:8000
✅ WebSocket server running on ws://localhost:8001
```

## ✅ Verify It's Working

Open another terminal and test:

```powershell
# Test health check
Invoke-RestMethod -Uri http://localhost:8000/health

# Get WhatsApp conversations
Invoke-RestMethod -Uri http://localhost:8000/api/v1/whatsapp/conversations

# Get Instagram messages
Invoke-RestMethod -Uri http://localhost:8000/api/v1/instagram/messages

# Get Gmail conversations
Invoke-RestMethod -Uri http://localhost:8000/api/v1/gmail/conversations
```

## 🔗 Connect Your Frontend

Update your frontend `.env` or `src/config/api.ts`:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  baseUrl: 'http://localhost:8000',
  wsUrl: 'ws://localhost:8001',
  // ... rest of config
};
```

Then start your React app:
```bash
npm start
```

The frontend will now connect to the mock backend!

## 📡 Test WebSocket

Open browser console and run:
```javascript
const ws = new WebSocket('ws://localhost:8001');
ws.onmessage = (e) => console.log('Received:', JSON.parse(e.data));

// Trigger a broadcast
fetch('http://localhost:8000/api/broadcast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'new_message',
    data: {
      id: 999,
      content: 'Test message',
      channel_id: 1,
      conversation_id: 1
    }
  })
});
```

## 🧪 Example Requests

### Get All Conversations
```bash
# WhatsApp
curl http://localhost:8000/api/v1/whatsapp/conversations

# Instagram
curl http://localhost:8000/api/v1/instagram/conversations

# Gmail
curl http://localhost:8000/api/v1/gmail/conversations
```

### Get Messages
```bash
# Get all WhatsApp messages
curl http://localhost:8000/api/v1/whatsapp/messages

# Get messages with filters
curl "http://localhost:8000/api/v1/whatsapp/messages?conversation_id=1&limit=10"
```

### Send a Message
```bash
curl -X POST http://localhost:8000/api/v1/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"channel":"whatsapp","to":"+1234567890","message":"Hello!"}'
```

### Reset Mock Data
```bash
curl -X POST http://localhost:8000/api/reset
```

## 🎯 What's Available

- ✅ **5 conversations per platform** (WhatsApp, Instagram, Gmail)
- ✅ **3-7 messages per conversation**
- ✅ **Realistic mock data** with proper IDs and timestamps
- ✅ **All 45 endpoints** working
- ✅ **WebSocket broadcasting** for real-time updates
- ✅ **Automatic data generation** on startup

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Find and kill the process
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**WebSocket not connecting?**
- Make sure the server is running on port 8001
- Check CORS is enabled (it is by default)

**Need more mock data?**
Edit `server.js` and modify the `generateMockData()` function.

## 📚 Full Documentation

See [README.md](./README.md) for complete documentation.

