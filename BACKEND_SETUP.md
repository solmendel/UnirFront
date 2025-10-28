# Backend Setup Guide

This guide explains how to configure your frontend to connect to the UNIR backend API.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Backend API URL (default: http://localhost:8000)
VITE_API_URL=http://localhost:8000

# WebSocket URL (default: ws://localhost:8000)
VITE_WS_URL=ws://localhost:8000

# Optional: Google OAuth Client ID for login
VITE_GOOGLE_CLIENT_ID=568713479079-mdb6g0unc66rqrkil54rg0pr7ps6g9qm.apps.googleusercontent.com
```

## Backend Requirements

Your backend should implement the following endpoints:

### Health & Status
- `GET /` - Root health check
- `GET /health` - Detailed health check with WebSocket connection count

### Messages
- `GET /api/v1/messages` - Get messages (query params: conversation_id, channel, limit, offset)
- `POST /api/v1/messages` - Create a new message
- `GET /api/v1/messages/{message_id}` - Get a specific message
- `PUT /api/v1/messages/{message_id}/read` - Mark message as read
- `GET /api/v1/messages/unread/count` - Get unread count (query param: conversation_id)
- `POST /api/v1/messages/unified` - Receive unified messages from channel services
- `POST /api/v1/send` - Send message through a specific channel

### Conversations
- `GET /api/v1/conversations` - Get conversations (query params: channel_id, limit, offset)
- `POST /api/v1/conversations` - Create a conversation
- `GET /api/v1/conversations/{conversation_id}` - Get a conversation with messages (query param: limit)
- `PUT /api/v1/conversations/{conversation_id}/participant` - Update participant name (body: participant_name)
- `PUT /api/v1/conversations/{conversation_id}/deactivate` - Deactivate a conversation

### Channels
- `GET /api/v1/channels` - Get all active channels
- `GET /api/v1/channels/{channel_name}` - Get a specific channel by name
- `GET /api/v1/channels/{channel_name}/stats` - Get channel statistics

### Real-time
- `WS /ws` - WebSocket for real-time messaging
- `POST /broadcast` - Broadcast a message to all connected WebSocket clients

## Testing the Connection

Once your backend is running, you can test the connection by:

1. Starting your frontend development server
2. Opening the browser console
3. The app should automatically connect to the WebSocket and make health check requests

## Quick Start

1. Start your backend on `http://localhost:8000`
2. If your backend is on a different URL, update `.env` with the correct `VITE_API_URL` and `VITE_WS_URL`
3. Restart the frontend development server to pick up the new environment variables

## API Service Usage

See the detailed usage examples in `src/services/API_USAGE_EXAMPLES.md`

## Channel IDs

The frontend expects the following channel IDs to be consistent with the backend:

- Channel ID 1: WhatsApp
- Channel ID 2: Instagram  
- Channel ID 3: Gmail

Update these mappings in `src/config/api.ts` if your backend uses different IDs.

