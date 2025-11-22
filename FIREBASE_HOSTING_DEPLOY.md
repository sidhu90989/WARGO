# Firebase Hosting Deployment Guide

## ✅ Simpler Setup - Everything on Firebase!

Your WARGO app now deploys entirely to Firebase:
- **API**: Firebase Cloud Functions
- **Frontends**: Firebase Hosting (Rider/Driver/Admin)
- **Realtime DB**: Already configured
- **Auth**: Already configured

No need for Cloud Run, Docker, or separate infrastructure!

## Quick Deploy (3 steps)

### 1. Setup secrets in `.env.deploy.local`:
```bash
cd /workspaces/WARGO/EcoRideConnect
cp .env.deploy .env.deploy.local
```

Edit `.env.deploy.local`:
```bash
export FIREBASE_PROJECT="trusty-diorama-475905-c3"
export SESSION_SECRET="$(openssl rand -hex 32)"  # Run command and paste output
export DATABASE_URL="postgres://user:pass@host:5432/wargo"  # See Postgres options below
export STRIPE_SECRET_KEY="sk_test_..."  # From Stripe dashboard
export FIREBASE_SERVICE_ACCOUNT_JSON="..."  # Base64 service account (see below)
export FRONTEND_ORIGIN="https://trusty-diorama-475905-c3.web.app,https://trusty-diorama-475905-c3--rider.web.app,https://trusty-diorama-475905-c3--driver.web.app,https://trusty-diorama-475905-c3--admin.web.app"
export FIREBASE_DATABASE_URL="https://trusty-diorama-475905-c3-default-rtdb.asia-southeast1.firebasedatabase.app"
export REDIS_URL=""  # Optional: Upstash Redis for sessions
```

### 2. Get Firebase service account:
```bash
# Download from Firebase Console > Project Settings > Service Accounts
# Then encode:
base64 -w0 < path/to/service-account.json
# Copy output to FIREBASE_SERVICE_ACCOUNT_JSON
```

### 3. Deploy:
```bash
npm run deploy
```

## Postgres Options (Choose One)

### Supabase (Easiest - Free Tier)
1. Go to https://supabase.com
2. Create project → Copy connection string from Settings → Database
3. Format: `postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`

### Neon (Generous Free Tier)
1. https://neon.tech → Create project
2. Copy connection string
3. Format: `postgres://[user]:[password]@[endpoint].neon.tech/[dbname]`

### Railway
1. https://railway.app → New Project → Add Postgres
2. Copy DATABASE_URL from Variables tab

### Google Cloud SQL
```bash
gcloud sql instances create wargo-db --database-version=POSTGRES_15 --tier=db-f1-micro --region=us-central1
gcloud sql databases create wargo --instance=wargo-db
gcloud sql users set-password postgres --instance=wargo-db --password=[PASSWORD]
# Enable public IP and get connection string
```

## Optional: Redis Sessions (Recommended)

### Upstash (Free 10K commands/day)
1. https://console.upstash.com/redis
2. Create database → Copy REST URL
3. Add to `.env.deploy.local`: `REDIS_URL="rediss://..."`

## What Gets Deployed

```
Firebase Project (trusty-diorama-475905-c3)
├── Functions
│   └── api (Express + Socket.IO*)
├── Hosting
│   ├── rider.web.app
│   ├── driver.web.app  
│   └── admin.web.app
└── Realtime Database
    └── active_rides tracking
```

*Note: Socket.IO WebSocket transport isn't supported in Cloud Functions. The app uses HTTP long-polling as fallback for real-time features. For full WebSocket support, you can deploy to Cloud Run instead.

## API Endpoints After Deploy

All APIs available at: `https://trusty-diorama-475905-c3.web.app/api`

Examples:
- Health: `https://trusty-diorama-475905-c3.web.app/api/health`
- Auth: `https://trusty-diorama-475905-c3.web.app/api/auth/verify`
- Rides: `https://trusty-diorama-475905-c3.web.app/api/rides`
- Tracking: `https://trusty-diorama-475905-c3.web.app/api/rides/:id/location`

## Verify Deployment

```bash
# Check API
curl https://trusty-diorama-475905-c3.web.app/api/health

# View logs
firebase functions:log --project trusty-diorama-475905-c3

# Test frontends
open https://trusty-diorama-475905-c3--rider.web.app
open https://trusty-diorama-475905-c3--driver.web.app
open https://trusty-diorama-475905-c3--admin.web.app
```

## Costs (Firebase Spark Free Tier)

- **Functions**: 2M invocations/month free
- **Hosting**: 10GB storage, 360MB/day bandwidth free
- **Realtime DB**: 1GB storage, 10GB/month bandwidth free
- **Total**: $0/month for moderate usage!

Paid plans start at $25/month (Blaze) with pay-as-you-go.

## Troubleshooting

### Build fails
```bash
# Ensure Firebase CLI is installed
npm install -g firebase-tools
firebase login
```

### Functions deployment timeout
```bash
# Increase timeout in firebase.json
"functions": {
  "runtime": "nodejs20",
  "timeoutSeconds": 300
}
```

### Database connection issues
- Ensure your Postgres instance allows connections from `0.0.0.0/0` (or Firebase Functions IPs)
- Use SSL connection string: `?sslmode=require`
- Check Supabase pooler settings for connection limits

### CORS errors
- Update `FRONTEND_ORIGIN` in `.env.deploy.local` with actual hosting URLs
- Redeploy: `npm run deploy`

## Alternative: Cloud Run (for full Socket.IO support)

If you need WebSocket transport for Socket.IO:

```bash
# Switch back to Cloud Run deployment
git checkout HEAD~1 -- scripts/deploy-one.sh firebase.json
# Follow Cloud Run deployment guide
```

---

**Your project is pre-configured for**: `trusty-diorama-475905-c3`

Just fill secrets in `.env.deploy.local` and run `npm run deploy`!
