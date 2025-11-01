# EcoRide Storage Setup (Firestore)

This app now uses Firebase Firestore as the only persistent backend. SQL databases and Drizzle migrations have been removed.

## Quick Start

### Option 1: Local mock mode (no Firebase required)

```bash
# .env
SIMPLE_AUTH=true
VITE_SIMPLE_AUTH=true

# Start API and a frontend app
npm run dev       # API (port 5000)
npm run rider:dev # or driver/admin app
```

This uses in-memory storage and simple session auth for rapid prototyping.

### Option 2: Full Firebase mode (Firestore + Auth)

1) Create a Firebase project and enable Authentication and Firestore.

2) Client env (.env):
```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_SIMPLE_AUTH=false
```

3) Server env (.env) choose ONE credential method:
```bash
# Path to service account JSON
FIREBASE_SERVICE_ACCOUNT_KEY_PATH="./service-account.json"
# OR inline JSON
# FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account", ... }'
# OR explicit fields (escape newlines as \n)
# FIREBASE_PROJECT_ID=...
# FIREBASE_CLIENT_EMAIL=...
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

SIMPLE_AUTH=false
```

4) Start servers:
```bash
# API in full mode (Firestore)
npm run dev:full

# Frontends in full mode (send ID token)
npm run rider:dev:full   # or driver/admin variants
```

## Collections

The API uses these collections (created automatically):
- users, driverProfiles, rides, payments, ratings, ecoBadges, userBadges, referrals

## Seeding demo data

Optional:
```bash
npx tsx server/seed.ts
```

This script creates demo users and a driver profile if missing. In Firestore mode, eco badges are auto-seeded on first access.

## Realtime updates

The server bridges Firestore snapshots to a WebSocket at `/ws` and emits:
- ride_added | ride_updated | ride_removed
- driver_added | driver_updated | driver_removed

Use the client hook `@/hooks/useRealtime` to subscribe and update UI state live.

## Troubleshooting

- Ensure your Firebase Admin credentials are valid for the project.
- In Codespaces/preview, add the preview domain(s) to Firebase Auth Authorized domains.
- For SIMPLE_AUTH=true, log in via the simple auth route; for full mode, the client attaches Firebase ID tokens automatically.