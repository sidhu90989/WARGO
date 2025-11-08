# Running API in DB mode with real Firebase Admin credentials

Follow these steps locally (we'll never commit secrets):

1) Provide Firebase Admin service account credentials EITHER as a file OR via an environment variable:

   a. File method (local dev): put JSON at EcoRideConnect/service-account.json (file is gitignored).
      Then export FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./service-account.json

   b. Inline env method (recommended for CI/prod): set FIREBASE_SERVICE_ACCOUNT_JSON to the raw JSON string OR a base64-encoded version of the JSON. Example:

      # Raw JSON (quote carefully or use a .env file)
      FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"trusty-diorama-475905-c3",...}'

      # OR base64
      export FIREBASE_SERVICE_ACCOUNT_JSON=$(base64 -w0 service-account.json)

   The server will prefer FIREBASE_SERVICE_ACCOUNT_JSON over FIREBASE_SERVICE_ACCOUNT_KEY_PATH. If neither is set it falls back to Application Default Credentials (ADC) if available.

2) Ensure Postgres is reachable and migrations are applied. In this Codespace, a local Postgres is already running on 127.0.0.1:55432 (DB "wargo").

3) Start the API in DB mode with token verification enabled (disable simple-auth routes). Choose either KEY_PATH or JSON approach:

   SIMPLE_AUTH=false \
   ALLOW_SIMPLE_AUTH_ROUTES=false \
   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/wargo \
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./service-account.json \
   FIREBASE_WEB_API_KEY=YOUR_WEB_API_KEY \
   STRIPE_SECRET_KEY=dummy \
   SESSION_SECRET=replace_me \
   npm run dev

   # OR inline JSON variant
   SIMPLE_AUTH=false \
   ALLOW_SIMPLE_AUTH_ROUTES=false \
   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/wargo \
   FIREBASE_SERVICE_ACCOUNT_JSON=$(base64 -w0 service-account.json) \
   FIREBASE_WEB_API_KEY=YOUR_WEB_API_KEY \
   STRIPE_SECRET_KEY=dummy \
   SESSION_SECRET=replace_me \
   npm run dev

4) Obtain an ID token for a Firebase Auth user and call the API with:

   Authorization: Bearer <ID_TOKEN>

Notes
- The existing smoke scripts: `smoke-simple` (header bypass), `smoke-db` (DB mode + header bypass), `smoke-db:token` (real Firebase ID token).
- To test real token verification use `npm run smoke:db:token` with SIMPLE_AUTH=false and ALLOW_SIMPLE_AUTH_ROUTES=false.
- Never commit service-account.json; it's gitignored. Prefer the FIREBASE_SERVICE_ACCOUNT_JSON env var for deployments.
- Rotate old keys after generating new service accounts: revoke in GCP IAM, delete unused private keys, update secrets store, redeploy.
- If you accidentally committed a key, purge it from git history (filter-repo), rotate immediately, and force-push.
