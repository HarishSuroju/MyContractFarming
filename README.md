# Assured Contract Farming

Assured Contract Farming is a full-stack web application that connects farmers and buyers/contractors through a secure digital platform. The system enables contract management, user verification, multilingual communication, and real-time messaging to improve transparency and trust in agricultural partnerships.

## Features

* Farmer and Buyer Registration & Authentication
* Secure JWT-based Authorization
* Contract Creation and Management
* Real-Time Messaging using Socket.IO
* Multilingual Communication Support
* Dynamic Translation Services
* User Verification Workflow
* Responsive React Frontend
* RESTful API Backend
* Dockerized Deployment
* Health Monitoring and Auto-Restart Policies
* AWS EC2 Cloud Deployment
* CI/CD Pipeline using GitHub Actions

---

## Architecture

```text
Frontend (React)
        │
        ▼
Backend API (Node.js + Express)
        │
        ▼
MongoDB Database
        │
        ▼
Socket.IO (Real-Time Communication)

Translation Service
 ├── LibreTranslate
 └── Argos Translate (Optional)
```

---

## Technology Stack

### Frontend

* React.js
* React Router
* Axios
* i18next

### Backend

* Node.js
* Express.js
* Socket.IO
* JWT Authentication

### Database

* MongoDB
* Mongoose

### DevOps & Deployment

* Docker
* Docker Compose
* AWS EC2
* GitHub Actions (CI/CD)

### Translation Services

* LibreTranslate
* Argos Translate

---

## Project Structure

```text
AssuredContractFarming/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│
├── docs/
│
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
NODE_ENV=production

PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

LIBRETRANSLATE_URL=https://translate.argosopentech.com

TRANSLATION_PROVIDER=libretranslate

TRANSLATION_PREFER_ARGOS=false
```

---

## Local Development

### Clone Repository

```bash
git clone https://github.com/HarishSuroju/MyContractFarming.git

cd MyContractFarming
```

### Install Dependencies

Backend:

```bash
npm install
```

Frontend:

```bash
cd frontend
npm install
cd ..
```

### Run Backend

```bash
npm run dev
```

### Run Frontend

```bash
cd frontend
npm start
```

Backend Health Endpoint:

```text
http://localhost:5000/api/health
```

---

## Docker Deployment

Build and start all services:

```bash
docker-compose up -d --build
```

View running containers:

```bash
docker ps
```

View logs:

```bash
docker-compose logs -f
```

Stop services:

```bash
docker-compose down
```

---

## AWS Deployment

The application is deployed on an AWS EC2 instance using Docker containers.

### Production Features

* Dockerized Application Deployment
* Automated Container Recovery (`restart: unless-stopped`)
* Backend Health Checks
* Environment-Based Configuration
* Persistent Cloud Hosting

---

## CI/CD Pipeline

The project uses GitHub Actions to automate deployments.

### Workflow

```text
Developer Pushes Code
            │
            ▼
GitHub Repository
            │
            ▼
GitHub Actions
            │
            ▼
SSH into AWS EC2
            │
            ▼
Pull Latest Changes
            │
            ▼
Docker Rebuild & Restart
            │
            ▼
Application Updated
```

Deployment is triggered automatically whenever code is pushed to the `main` branch.

---

## Translation System

Dynamic translations are available through:

```http
POST /api/translations/dynamic
```

Example Request:

```json
{
  "text": "Hello",
  "fromLang": "en",
  "toLang": "te"
}
```

Supported providers:

* LibreTranslate
* Argos Translate

Translation caching is implemented to reduce repeated API requests and improve response times.

---

## Health Monitoring

Application health can be checked using:

```http
GET /api/health
```

Docker health checks continuously monitor backend availability and help ensure production reliability.

---

## Future Enhancements

* Digital Contract Signing
* AI-based Contract Recommendations
* Farmer Credit Scoring
* Notification System
* Analytics Dashboard
* Mobile Application

---

## Author

**Harish Suroju**

AWS Cloud Practitioner | Full-Stack Developer | MERN Stack Developer

GitHub: https://github.com/HarishSuroju



<!-- # Assured Contract Farming

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
If you want, I can expand `docs/` with API examples, deployment notes, or a developer onboarding checklist. -->