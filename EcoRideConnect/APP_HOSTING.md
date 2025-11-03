# Firebase App Hosting — WARGO API

Use this guide when deploying the Express API to Firebase App Hosting.

## Build & start commands

- Build command:
  - `npm ci && npm run build`
- Start command (pick ONE):
  - `npm run start:prod` (runs migrations, then starts)
  - or `bash EcoRideConnect/start-apphosting.sh` (same behavior)

## Required environment variables

Set these in App Hosting → Environment:

```
NODE_ENV=production
PORT=8080
SIMPLE_AUTH=false
ALLOW_SIMPLE_AUTH_ROUTES=false
COOKIE_SECURE=true
SESSION_SECRET=replace-with-a-long-random-value

DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require

FRONTEND_ORIGIN=https://wargo-ride.com,https://wargo-partner.com,https://wargo.com

# Other keys as needed
FIREBASE_API_KEY=...
REACT_APP_PROJECT_ID=trusty-diorama-475905-c3
GOOGLE_MAPS_API_KEY=...
STRIPE_SECRET_KEY=...
```

## Custom domain

After a successful deploy, in App Hosting → Settings → Domains:
- Add `api.wargo.com` and follow DNS instructions until connected.

## Verify

```
curl -I https://api.wargo.com/api/health
```

If you see CORS issues from apps, ensure `FRONTEND_ORIGIN` exactly matches your three app domains.
