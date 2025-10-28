# 🚀 Quick Start Guide

## Start the Mock Backend

```bash
# Terminal 1: Start the mock backend
cd mock-backend-ex
npm start
```

The server will start on `http://localhost:8000` and you'll see all available endpoints in the console.

## Start the Frontend

```bash
# Terminal 2: Start the frontend
cd ..  # Go back to main project
npm run dev
```

The frontend will connect to the mock backend automatically.

## Test the Connection

Open your browser to `http://localhost:3000` (or the port shown in the terminal) and check the browser console.

You should see:
- ✅ API calls being made to the mock backend
- ✅ WebSocket connecting successfully
- ✅ Conversations loading from the mock data

## Available Mock Data

The mock backend includes:

- **3 Channels**: WhatsApp, Instagram, Gmail
- **2 Conversations**: 
  - John Doe (WhatsApp)
  - Jane Smith (Gmail)
- **3 Messages**: Sample messages for testing

## Testing Individual Endpoints

### Using Browser
Navigate to:
- `http://localhost:8000/` - Health check
- `http://localhost:8000/api/v1/conversations` - Get conversations
- `http://localhost:8000/api/v1/messages` - Get messages
- `http://localhost:8000/api/v1/channels` - Get channels

### Using PowerShell
Run the test script:
```powershell
cd mock-backend-ex
.\test-api.ps1
```

## WebSocket Testing

Open the browser console and check that you see "WebSocket connected" messages.

The WebSocket is available at `ws://localhost:8000/ws`

## Changing the Port

If port 8000 is in use:

```bash
PORT=8001 npm start
```

Then update your frontend `.env`:
```env
VITE_API_URL=http://localhost:8001
VITE_WS_URL=ws://localhost:8001
```

## Troubleshooting

### Backend not starting
- Check that port 8000 is available
- Try using a different port: `PORT=8001 npm start`

### Frontend not connecting
- Verify `.env` file has correct URLs
- Check browser console for CORS errors
- Make sure the backend is running before starting the frontend

### WebSocket not working
- Check browser console for connection errors
- Verify the WebSocket URL includes `/ws`
- Check that the backend logs show WebSocket connections

## Need Help?

See the full documentation in [README.md](./README.md)

