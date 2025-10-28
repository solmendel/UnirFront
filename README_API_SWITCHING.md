# Switching Between Mock Backend and Core API

This guide explains how to switch between the Mock Backend and the production Core API.

## Current Setup

By default, the frontend connects to **port 8003**, which can be either:
- Mock Backend (Node.js) - Quick development/testing
- Core API (Python/FastAPI) - Production backend

## Using Mock Backend (Port 8003)

Run the mock backend:
```bash
cd mock-backend-ex
npm start
```

The frontend will automatically connect to it.

## Using Core API (Port 8003)

1. Setup MySQL database (see `core-mock/SETUP_INSTRUCTIONS.md`)
2. Run the Core API:
```bash
cd core-mock
python -m src.main
```

The frontend will automatically connect to it.

Both backends use the same port (8003), so you can switch between them seamlessly!

## Quick Comparison

| Feature | Mock Backend | Core API |
|---------|--------------|----------|
| Port | **8003** | **8003** |
| Language | Node.js/Express | Python/FastAPI |
| Database | File-based (JSON) | MySQL |
| Use Case | Development/Testing | Production |
| Ease of Setup | ✅ Quick (no DB needed) | Requires MySQL |
| Frontend Config | Same for both! | Same for both! |

## Development Workflow

1. **Development**: Use Mock Backend (default)
   - No database setup needed
   - Quick to start: `cd mock-backend-ex && npm start`
   - Great for UI development
   - Auto-saves to `data.json`

2. **Integration Testing**: Use Core API
   - Test against production backend
   - Requires MySQL setup (see `core-mock/SETUP_INSTRUCTIONS.md`)
   - Full feature testing

## Current Configuration

See `src/config/api.ts` for the base configuration.

**Important**: Both backends now use port 8003, so the frontend doesn't need any changes to switch between them!

