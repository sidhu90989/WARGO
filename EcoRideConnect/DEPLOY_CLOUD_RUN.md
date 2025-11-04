# Deploy the API to Google Cloud Run

This project deploys the three web apps to Firebase Hosting and the Express API to Cloud Run.

Your production domains:
- Rider: https://rideapp.wargo.com
- Driver: https://partner.wargo.com
- Admin: https://wargo.com
- API: https://api.wargo.com (configure this custom domain for your Cloud Run service)

## 1) Prerequisites

- Google Cloud project with billing enabled
- gcloud CLI installed and authenticated: `gcloud auth login`
- Firebase CLI installed and authenticated: `firebase login`
- A Postgres database (Cloud SQL, Supabase, Railway, etc.) and a DATABASE_URL

## 2) Containerize the API

We added `EcoRideConnect/Dockerfile` and `.dockerignore`.

Build and push the image (replace YOUR_PROJECT_ID and REGION):

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/wargo-api:latest .
```

## 3) Deploy to Cloud Run

Deploy the API container (adjust REGION and env vars):

```bash
gcloud run deploy wargo-api \
  --image gcr.io/YOUR_PROJECT_ID/wargo-api:latest \
  --region REGION \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "SIMPLE_AUTH=false" \
  --set-env-vars "ALLOW_SIMPLE_AUTH_ROUTES=false" \
  --set-env-vars "COOKIE_SECURE=true" \
  --set-env-vars "FRONTEND_ORIGIN=https://rideapp.wargo.com,https://partner.wargo.com,https://wargo.com" \
  --set-env-vars "DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME" \
  --set-env-vars "SESSION_SECRET=GENERATE_A_LONG_RANDOM_SECRET"
```

Optional: run DB migrations once before traffic (recommended):

```bash
gcloud run jobs create wargo-migrate --image gcr.io/YOUR_PROJECT_ID/wargo-api:latest --region REGION \
  --set-env-vars "NODE_ENV=production,SIMPLE_AUTH=false,ALLOW_SIMPLE_AUTH_ROUTES=false,COOKIE_SECURE=true,FRONTEND_ORIGIN=https://rideapp.wargo.com,https://partner.wargo.com,https://wargo.com,DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME,SESSION_SECRET=..." \
  --command npm --args "run,db:migrate"

gcloud run jobs execute wargo-migrate --region REGION --wait
```

Alternatively, you can bake migrations into startup (not ideal for multiple replicas): set the command to `npm run db:migrate && node dist/index.js`.

### Cloud SQL (optional)

If you use Cloud SQL for Postgres, connect Cloud Run to your instance (private IP or connector) and set DATABASE_URL accordingly. See: https://cloud.google.com/sql/docs/postgres/connect-run

### Custom domain for the API

In Cloud Run → your service → Custom domains → Map `api.wargo.com` and follow the DNS instructions.

## 4) Deploy the web apps to Firebase Hosting

From repo root or `EcoRideConnect/`:

```bash
cd EcoRideConnect
npm run build:apps
firebase --config ../firebase.json deploy --only hosting
```

Then add custom domains in Firebase Console → Hosting:
- rider site → `rideapp.wargo.com`
- driver site → `partner.wargo.com`
- admin site → `wargo.com`

## 5) Configure Firebase Auth

Firebase Console → Authentication → Settings → Authorized domains:
Add: `rideapp.wargo.com`, `partner.wargo.com`, `wargo.com`, and `api.wargo.com`.

## 6) Verify

```bash
curl -I https://api.wargo.com/api/health
curl -I https://rideapp.wargo.com
curl -I https://partner.wargo.com
curl -I https://wargo.com
```

If CORS issues appear, confirm the `FRONTEND_ORIGIN` env matches exactly your three app domains and that cookies are `secure` (HTTPS) and `sameSite=none` is used automatically when `COOKIE_SECURE=true`.
