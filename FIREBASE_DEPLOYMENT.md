# Firebase Multi-Site Hosting for WARGO (Rider, Driver, Admin)

This guide adapts the multi-site Firebase strategy to this repository's structure.

## App paths and build outputs
- Rider app: `EcoRideConnect/apps/rider` → build to `EcoRideConnect/dist/rider`
- Driver app: `EcoRideConnect/apps/driver` → build to `EcoRideConnect/dist/driver`
- Admin app: `EcoRideConnect/apps/admin` → build to `EcoRideConnect/dist/admin`
- API server: `EcoRideConnect/server` (Express + WebSocket `/ws`)

## Prerequisites
- Firebase CLI installed and logged in: `npm i -g firebase-tools` then `firebase login`
- A Firebase project created (replace placeholders in `.firebaserc`)
- Decide your custom domains
  - Rider: `rider.your-domain.com`
  - Driver: `driver.your-domain.com`
  - Admin: `admin.your-domain.com`
  - Backend: `api.your-domain.com` (where you deploy `EcoRideConnect/server`)

## Configure Firebase files
- `firebase.json` and `.firebaserc` are in the repo root. Update `.firebaserc`:
  - Replace `YOUR_FIREBASE_PROJECT_ID` with your Firebase project ID
  - Optionally rename site ids (`rider-wargo`, `driver-wargo`, `admin-wargo`) or create them with the same names

## Environment variables (production)
Each app reads `VITE_API_URL` to call the backend and to derive the WebSocket URL (`/ws`).

Edit these files and set a real API URL:
- `EcoRideConnect/apps/rider/.env.production`
- `EcoRideConnect/apps/driver/.env.production`
- `EcoRideConnect/apps/admin/.env.production`

Example:
```
VITE_API_URL=https://api.your-domain.com
```

Server CORS: The API server allows multiple origins. Set one of the following in your server environment (where you run `node dist/index.js`):
- `FRONTEND_ORIGIN` as a comma-separated list (recommended), e.g.
  - `FRONTEND_ORIGIN="https://rider.your-domain.com,https://driver.your-domain.com,https://admin.your-domain.com"`
- or per-site: `RIDER_ORIGIN`, `DRIVER_ORIGIN`, `ADMIN_ORIGIN`

Local dev ports 5173/5174/5175 are allowed by default.

## Create Firebase Hosting sites
```
firebase hosting:sites:create rider-wargo
firebase hosting:sites:create driver-wargo
firebase hosting:sites:create admin-wargo

# Verify
firebase hosting:sites:list
```

Update `.firebaserc` targets if you used different site IDs.

## Build scripts and deploy
From `EcoRideConnect/` directory (or repo root):
```
# Build all three apps
npm run build:apps

# Deploy everything to Hosting (all sites)
npm run deploy:hosting

# Or deploy each site individually
npm run deploy:rider
npm run deploy:driver
npm run deploy:admin
```

Note: We don't deploy Cloud Functions in this repo. The API is an Express server you deploy to your own host (VPS, Render, Fly.io, Cloud Run, etc.). Point `VITE_API_URL` to that host.

If you're using Firebase App Hosting's GitHub integration UI, fill in:
- Live branch: `main`
- App root directory: one of `EcoRideConnect` (recommended) or the specific app folder, e.g. `EcoRideConnect/apps/rider`
- Build command:
  - Rider: `npm ci && npm run build:rider`
  - Driver: `npm ci && npm run build:driver`
  - Admin: `npm ci && npm run build:admin`
- Output directory (relative to repo root if root is repo, else relative to chosen app root):
  - Rider: `EcoRideConnect/dist/rider` (or `dist/rider` if root is `EcoRideConnect`)
  - Driver: `EcoRideConnect/dist/driver` (or `dist/driver`)
  - Admin: `EcoRideConnect/dist/admin` (or `dist/admin`)

## Connect custom domains (Firebase Console)
- Firebase Console → Hosting → For each site (rider/driver/admin) → Add custom domain
- Add DNS CNAMEs per Firebase instructions and verify SSL

## Backend CORS and WebSocket
The server at `EcoRideConnect/server/index.ts` now:
- Accepts CORS from configured origins (env-based)
- Exposes WebSocket at `wss://api.your-domain.com/ws`

No Socket.IO is used; clients use native WebSocket derived from `VITE_API_URL`.

## Admin security headers
`firebase.json` sets strict headers on the Admin site:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## Verify deployments
```
firebase hosting:sites:list
firebase hosting:channel:list

# Spot-check domains
curl -I https://rider.your-domain.com
curl -I https://driver.your-domain.com
curl -I https://admin.your-domain.com

# API health (implement a /api/health route or pick an existing one)
curl -I https://api.your-domain.com/api/auth/verify
```

## Troubleshooting
- CORS errors: ensure `FRONTEND_ORIGIN` (or per-site origins) are set on the server
- WebSocket fails: check that `VITE_API_URL` is the API host and `/ws` is reachable over wss
- DNS pending: CNAME propagation can take time
- Build failures: ensure `.env.production` variables are present (at least `VITE_API_URL`)

## One-time checklist
- [ ] Update `.firebaserc` project id and site targets
- [ ] Set `.env.production` for rider/driver/admin with real API URL
- [ ] Deploy backend to `api.your-domain.com` and set CORS origins
- [ ] Build and deploy Hosting sites
- [ ] Validate authentication and real-time updates across domains
