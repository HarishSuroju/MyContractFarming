# Assured Contract Farming

A MERN stack application for connecting farmers with buyers through smart contracts.

## Project Structure

```
AssuredContractFarming/
├── client/          # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── utils/
│       ├── assets/
│       └── hooks/
├── server/          # Node.js/Express backend
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
└── README.md
```

## Tech Stack

- **Frontend**: React, Axios, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Deployment**: Vercel (Frontend), Heroku/Docker (Backend)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AssuredContractFarming
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

### Environment Variables

Create `.env` files in both `server` and `client` directories:

**Server (.env)**:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

**Client (.env)**:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start the backend server:
   ```bash
   npm run dev
   ```

# Assured Contract Farming

Assured Contract Farming is a MERN-stack application that connects farmers and contractors/buyers, providing real-time messaging, contract management, verification flows, and multilingual support.

This repository contains the backend (Express + MongoDB), the React frontend, and local tooling for development and Docker-based deployment.

## Quick Overview

- Backend: `backend/server.js` (Express, Socket.IO, Mongoose)
- Frontend: `frontend/` (React + i18next)
- Database: MongoDB
- Realtime: Socket.IO (messaging, WebRTC signaling)
- Translation: `backend/services/translationService.js` (providers + cache + fallbacks)

## Getting Started (Local Dev)

1. Install dependencies:

```bash
npm install
cd client && npm install && cd ..
```

2. Create a `.env` file at project root (or use `.env.example`) and set at least:

```
JWT_SECRET=changeme
MONGODB_URI=mongodb://localhost:27017/assuredcontractfarming
NODE_ENV=development
```

3. Start backend (dev):

```bash
npm run dev
```

4. Start frontend dev server:

```bash
cd frontend
npm start
```

5. Health check: GET `http://localhost:5000/api/health`

## Docker (Local)

Docker Compose is provided to run the backend, MongoDB, frontend (built + nginx) and a local Argos Translate container.

From the project root:

```bash
cp .env.example .env   # update values if needed
docker compose up --build
```

Services started by compose:
- `mongo` (MongoDB)
- `backend` (Express API)
- `frontend` (React app served by nginx)
- `argos` (local Argos Translate server)

Notes:
- `ARGOS_URL` defaults to `http://argos:8000/translate` inside compose network; set `ARGOS_URL` if overriding.

## Translation / Multilingual

- Dynamic translations are available via POST `/api/translations/dynamic` (body: `{ text, fromLang, toLang }`).
- Providers live in `backend/services/translationProviders.js` and a provider-agnostic flow is in `backend/services/translationService.js`.
- By default the service prefers a local Argos server (if configured) and falls back to LibreTranslate.
- Cache model: `backend/models/translationCache.js` (unique index on `sourceText, fromLang, toLang`).
- Env vars (partial list):
   - `TRANSLATION_PROVIDER` (libre|argos)
   - `TRANSLATION_PREFER_ARGOS` (true/false)
   - `ARGOS_URL` (e.g., http://localhost:8000/translate)
   - `LIBRETRANSLATE_URL` and `LIBRETRANSLATE_API_KEY`
   - `TRANSLATION_TIMEOUT_MS`, `TRANSLATION_RETRIES`

## Testing & Tools

- Quick syntax check (Node syntax) for backend files:

```bash
node backend/tools/syntaxCheck.js
```

- A simple smoke test script exercises `/api/health` and Socket.IO: `node backend/tools/smokeTest.js`.

## Development Notes & Recommendations

- Socket security: server accepts socket auth token and sets `socket.userId` (verify tokens on client handshake).
- Production: set `NODE_ENV=production` and ensure `JWT_SECRET` + DB connection are secure.
- Consider self-hosting LibreTranslate or Argos for privacy and reliability.

## Project Structure

Top-level (relevant):

```
backend/
   controllers/
   middleware/
   models/
   routes/
   services/         # translationService, translationProviders, metrics
frontend/           # React app (i18n + components)
Dockerfile.backend
Dockerfile.frontend
docker-compose.yml
README.md
docs/               # architecture, endpoints, translation notes
```

## Next steps

- Run `docker compose up --build` to start local development stack.
- Review `docs/` for architecture and endpoints.

---
If you want, I can expand `docs/` with API examples, deployment notes, or a developer onboarding checklist.