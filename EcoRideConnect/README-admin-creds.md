# Running API in DB mode with real Firebase Admin credentials

Follow these steps locally (we'll never commit secrets):

1) Place your Firebase Admin service account JSON at:

   EcoRideConnect/service-account.json

   Or set the path you prefer and export it during runs.

2) Ensure Postgres is reachable and migrations are applied. In this Codespace, a local Postgres is already running on 127.0.0.1:55432 (DB "wargo").

3) Start the API in DB mode with token verification enabled (disable simple-auth routes):

   SIMPLE_AUTH=false \
   ALLOW_SIMPLE_AUTH_ROUTES=false \
   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/wargo \
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./service-account.json \
   STRIPE_SECRET_KEY=dummy \
   npm run dev

4) Obtain an ID token for a Firebase Auth user and call the API with:

   Authorization: Bearer <ID_TOKEN>

Notes
- The existing smoke scripts use header-bypass (no ID token). To test real token verification, we can add a small script that signs in via Firebase Auth REST (requires Email/Password auth enabled and a user), or create a user via Admin and mint a custom token.
- Never commit service-account.json. It's now ignored by .gitignore.
