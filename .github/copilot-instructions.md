## Quick orientation for AI code assistants

This repository is a Vite + React (TypeScript-ish) frontend for a Unified Messaging UI that talks to a separate core API and an optional mock backend. Below are the minimal, high-value facts an AI assistant needs to be productive here.

### Big picture
- Frontend: `src/` — React pages under `src/components` (MessagesPage, HistoryPage, CollaboratorsPage, MetricsPage). Entry: `src/App.tsx`.
- API layer: `src/services/api.ts` and `src/services/websocket.ts` — central place to add/modify REST and WS calls. `src/config/api.ts` holds `API_CONFIG.baseUrl` used by the service.
- Mock backend: `mock-backend-ex/` — simple node mock server (localhost:8000) for frontend development.
- Core API: `core-mock/` — Python FastAPI-like core; runs on port 8003 (see `core-mock/README.md`). Use mock-backend-ex for fast UI work; use core-mock when testing integration.

### Run / build / debug (explicit)
- Install: `npm i` at repo root.
- Dev server (frontend): `npm run dev` (Vite, defaults to localhost:5173).
- Build: `npm run build` (Vite build).
- Mock backend: `cd mock-backend-ex && npm install && npm start` (runs on http://localhost:8000).
- Core API (python): see `core-mock/README.md` — `pip install -r requirements.txt` and `python -m src.main` (runs on :8003).

Environment variables the assistant should expect and update when adding features:
- `VITE_API_URL` — base URL for REST API used by `src/services/api.ts` (default for local dev: http://localhost:8000)
- `VITE_WS_URL` — WebSocket URL (ws://localhost:8000)
- `VITE_GOOGLE_CLIENT_ID` — required for Google OAuth (used by `src/components/LoginPage.tsx`)

### Project-specific conventions & patterns
- Session handling: `localStorage` key `unir-session` is used to persist login state. Example: `src/App.tsx` reads/parses that key and enforces `expiresAt`.
- API layer contract: `src/services/api.ts` exposes a single `apiService` instance, with methods like `getConversations`, `getMessages`, `sendMessage`, `receiveUnifiedMessage`. Prefer adding endpoints here rather than scattering fetch calls.
- Error handling: `apiService.request` throws `new Error(errorData.detail || 'HTTP error! status: ...')`. Caller code expects exceptions — propagate or show user-friendly messages.
- Channel mapping: `apiService.getPlatformFromChannelId` maps numeric `channel_id` to platform strings (1 → whatsapp, 2 → instagram, 3 → gmail). When adding new channels, update this mapping and `src/config/api.ts` if needed.
- Message ordering: backend returns messages oldest→newest; `apiService.convertToConversation` assumes that order and computes last message by taking the last element.

### Integration points to watch
- WebSocket real-time updates: `src/services/websocket.ts` (used by pages to subscribe to events). If you add a broadcast or new event type, update both backend (mock or core) and the WS handlers.
- OAuth: Google OAuth integration in `src/components/LoginPage.tsx` relies on `VITE_GOOGLE_CLIENT_ID`. Tests of login flows should run against real Google client-id or be stubbed.
- Mock backend vs core API: During front-end changes prefer `mock-backend-ex` for fast iteration. For contract-level work, use `core-mock` to validate full behavior and Swagger docs at `http://localhost:8003/docs`.

### Helpful file references (examples)
- Component entry & session: `src/App.tsx` — shows `unir-session` handling and page routing.
- API surface: `src/services/api.ts` — canonical place for REST methods, query param construction, and response shaping.
- Services README: `src/services/README.md` — documents available endpoints and usage examples.
- Mock backend quickstart: `mock-backend-ex/README.md` and `mock-backend-ex/server.js`.
- Core API overview and endpoints: `core-mock/README.md` (ports, endpoints, WebSocket path `/ws`).

### Prompt templates / expected actions for the AI
- When asked to add/modify an API call: update `src/services/api.ts`, add unit of work there, then update any callers in `src/components/*` and `src/services/README.md`.
- When adding realtime events: add types in `src/types/api.ts` (if needed), extend `websocket.ts` handlers, and add a backend mock update in `mock-backend-ex`.
- When changing session/login behavior: update `src/App.tsx` and `src/components/LoginPage.tsx`; keep `unir-session` shape backward compatible (fields: isLoggedIn, user, loginTime, expiresAt).

### When you can't find something
- If behavior is implemented in multiple places, prefer `src/services/*` as the single source of truth for network access. If unsure about API semantics, consult `core-mock/README.md` or `mock-backend-ex/data.json`.

If anything above is unclear or you want extra examples (common quick fixes, where to add tests, or a checklist for adding a new API endpoint), tell me which area to expand and I'll iterate. 
