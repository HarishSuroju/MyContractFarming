# Firebase Deployment

This project deploys cleanly with:

- Firebase Hosting for the React frontend
- Google Cloud Run for the Express + Socket.IO backend
- MongoDB Atlas or another reachable MongoDB deployment for `MONGODB_URI`

Firebase Hosting is a good fit for the frontend, but the backend should stay on Cloud Run because this app uses Express, Socket.IO, and a long-running Node server.

## Recommended architecture

- Frontend: Firebase Hosting
- Backend API + Socket.IO: Cloud Run
- Database: MongoDB Atlas

Important: Socket.IO rooms in this project are currently stored in memory. Start Cloud Run with a single instance first, or add a shared adapter later before scaling horizontally.

## 1. Backend env vars

Set these on Cloud Run:

- `NODE_ENV=production`
- `PORT=8080`
- `MONGODB_URI=...`
- `JWT_SECRET=...`
- `GOOGLE_CLIENT_ID=...`
- `FRONTEND_URL=https://YOUR_PROJECT_ID.web.app`
- `CORS_ORIGINS=https://YOUR_PROJECT_ID.web.app,https://YOUR_PROJECT_ID.firebaseapp.com`
- any email, Twilio, or translation env vars your deployment needs

If you use a custom domain for Hosting, add that domain to `FRONTEND_URL` or `CORS_ORIGINS` too.

## 2. Deploy backend to Cloud Run

Build and push the backend image from the repo root:

```bash
docker build -f Dockerfile.backend -t gcr.io/YOUR_GCP_PROJECT_ID/assured-contract-farming-api .
docker push gcr.io/YOUR_GCP_PROJECT_ID/assured-contract-farming-api
```

Deploy it to Cloud Run:

```bash
gcloud run deploy assured-contract-farming-api \
  --image gcr.io/YOUR_GCP_PROJECT_ID/assured-contract-farming-api \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=8080,FRONTEND_URL=https://YOUR_PROJECT_ID.web.app,CORS_ORIGINS=https://YOUR_PROJECT_ID.web.app,https://YOUR_PROJECT_ID.firebaseapp.com \
  --set-env-vars MONGODB_URI=YOUR_MONGODB_URI,JWT_SECRET=YOUR_JWT_SECRET,GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID \
  --max-instances 1
```

After deploy, note the Cloud Run service URL. You will use it in the frontend build as `REACT_APP_API_URL=https://YOUR_CLOUD_RUN_URL/api`.

## 3. Build the frontend for Firebase Hosting

Create `frontend/.env.production.local` with at least:

```bash
REACT_APP_API_URL=https://YOUR_CLOUD_RUN_URL/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_NAME=Assured Contract Farming
```

Then build:

```bash
npm run build:frontend
```

## 4. Deploy frontend to Firebase Hosting

Initialize Firebase Hosting once:

```bash
firebase login
firebase use --add
```

Deploy the built frontend:

```bash
firebase deploy --only hosting
```

The repo already includes `firebase.json` configured for a single-page React app with `frontend/build` as the Hosting output directory.

## 5. Final checks

- Open `https://YOUR_PROJECT_ID.web.app`
- Verify `GET /api/health` through the Cloud Run URL
- Test login, notifications, messaging, and WebRTC signaling
- Confirm your Google OAuth redirect origins include the Firebase Hosting domain

## Notes

- `backend/server.js` now reads `FRONTEND_URL` and `CORS_ORIGINS` so production Hosting domains can call the API safely.
- `frontend/src/components/NotificationBell.js` now uses the same socket base URL logic as the rest of the frontend instead of hardcoded localhost.
- If you later want multiple backend instances for Socket.IO, add a shared adapter such as Redis before raising `--max-instances`.
