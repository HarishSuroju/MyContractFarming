**API Endpoints (overview)**

Base path: `/api`

- `POST /api/auth/*` - Authentication and registration endpoints (login, signup, token refresh).
- `GET|PUT /api/profile/*` - Profile retrieval and updates.
- `GET|POST /api/agreements/*` - Contract/agreement creation and management.
- `GET|POST /api/connections/*` - Connection requests and accept/reject flows.
- `GET|POST /api/notifications/*` - Notifications listing and marking read.
- `GET|POST /api/messages/*` - Message CRUD and history endpoints (server supports realtime via Socket.IO).
- `POST /api/chatbot/*` - Chatbot endpoints.
- `POST /api/translations/dynamic` - Translate arbitrary text: body `{ text, fromLang?, toLang }`.
- `GET /api/health` - Health check endpoint.
- `GET /api/users/directory` - User directory (protected by auth + verification middleware).

Notes

- Many routes are protected with `authenticateToken` middleware and some require `requireApprovedVerification`.
- Socket.IO events are used for real-time flows. See `backend/server.js` for event names and payload shapes.
