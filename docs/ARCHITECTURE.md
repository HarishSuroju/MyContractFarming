**Architecture**

Overview

- Frontend: React application (`frontend/`) using `i18next` for localization and `socket.io-client` for realtime features.
- Backend: Express server (`backend/server.js`) exposing REST APIs, Socket.IO for realtime messaging and WebRTC signaling, and Mongoose models for persistence.
- Database: MongoDB used for users, agreements, messages, translation cache, and other domain models.
- Translation subsystem: provider abstraction (`backend/services/translationProviders.js`) and orchestrator (`backend/services/translationService.js`) which implements caching, timeouts, retries, and provider fallback.
- Docker Compose: development stack for backend, frontend, MongoDB, and Argos translate service is defined in `docker-compose.yml`.

Core responsibilities

- Authentication: JWT tokens used for API auth and optional socket auth on connect/handshake.
- Realtime messaging: Socket events for `send-message`, `typing`, message delivery/read confirmations, and WebRTC call signaling (`call-user`, `answer-call`, `ice-candidate`, etc.).
- Translation: dynamic translation endpoint and background-safe provider fallbacks (Argos local → LibreTranslate public/self-hosted).

Resilience & performance

- Translation caching via `TranslationCache` model with a unique index.
- Provider timeouts, retry logic and a simple circuit-breaker protect against provider slowness/failure.
- Rate limiting middleware and `helmet` are enabled in `backend/server.js` for basic security.

Where to look in the code

- Server entry: `backend/server.js`
- API routes: `backend/routes/` (one file per domain)
- Controllers: `backend/controllers/`
- Models: `backend/models/`
- Translation logic: `backend/services/translationService.js` and `backend/services/translationProviders.js`
