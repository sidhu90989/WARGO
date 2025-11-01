## Database Setup (Updated)

Neon/PostgreSQL is no longer used in this project.

EcoRide now uses Firebase Firestore as the only persistent backend. To set it up:

1) Create a Firebase project and enable Authentication and Firestore.
2) Configure client keys in `EcoRideConnect/.env` (`VITE_FIREBASE_*`).
3) Configure server Admin credentials via one of:
   - `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` (path to JSON key), or
   - `FIREBASE_SERVICE_ACCOUNT_JSON` (inline JSON), or
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (escaped newlines).
4) Run the API in full mode: `npm run dev:full` inside `EcoRideConnect/`.

See `EcoRideConnect/DATABASE_SETUP.md` for details.