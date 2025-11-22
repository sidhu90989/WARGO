# WARGO One-Command Deployment

## Quick Start

1. **Copy template and fill secrets:**
   ```bash
   cd EcoRideConnect
   cp .env.deploy .env.deploy.local
   # Edit .env.deploy.local with your secrets
   ```

2. **Fill required values in `.env.deploy.local`:**
   - `SESSION_SECRET` - Generate: `openssl rand -hex 32`
   - `DATABASE_URL` - Your Postgres connection string
   - `STRIPE_SECRET_KEY` - Stripe test/live key
   - `FIREBASE_SERVICE_ACCOUNT_JSON` - Base64-encode service account: `base64 -w0 < service-account.json`
   - `REDIS_URL` (optional) - Upstash Redis URL for sessions

3. **Deploy everything:**
   ```bash
   npm run deploy
   ```

## What It Does

Single command deploys:
- **API** to Google Cloud Run (with rate limiting, Redis sessions, Zod validation)
- **Rider App** to Firebase Hosting
- **Driver App** to Firebase Hosting  
- **Admin App** to Firebase Hosting

All frontends automatically configured with the Cloud Run API URL.

## First-Time Setup

### Prerequisites
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash

# Login and set project
gcloud auth login
gcloud config set project trusty-diorama-475905-c3

# Install Firebase CLI
npm install -g firebase-tools
firebase login
```

### Enable APIs
```bash
gcloud services enable run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com
```

### Get Service Account JSON
1. Go to [GCP Console > IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=trusty-diorama-475905-c3)
2. Create/select service account with "Firebase Admin" + "Cloud Run Admin" roles
3. Create key → Download JSON
4. Base64 encode: `base64 -w0 < path/to/service-account.json`

### Setup Postgres
Choose one:
- **Supabase** (easiest): https://supabase.com → Create project → Copy connection string
- **Google Cloud SQL**: Create Postgres instance, enable public IP, copy connection string
- **Railway/Render**: One-click Postgres

### Optional: Redis Session Store
For production session persistence:
- **Upstash** (recommended): https://upstash.com → Create Redis → Copy `rediss://` URL
- **Google Memorystore**: Requires VPC connector (more complex)

## Manual Deploy (without .env file)

```bash
cd EcoRideConnect
GCP_PROJECT="trusty-diorama-475905-c3" \
REGION="us-central1" \
FIREBASE_PROJECT="trusty-diorama-475905-c3" \
SESSION_SECRET="$(openssl rand -hex 32)" \
DATABASE_URL="postgres://user:pass@host:5432/wargo?sslmode=require" \
STRIPE_SECRET_KEY="sk_test_xxx" \
FIREBASE_SERVICE_ACCOUNT_JSON="$(base64 -w0 < service-account.json)" \
FRONTEND_ORIGIN="https://trusty-diorama-475905-c3.web.app,https://trusty-diorama-475905-c3--rider.web.app,https://trusty-diorama-475905-c3--driver.web.app,https://trusty-diorama-475905-c3--admin.web.app" \
REDIS_URL="rediss://:pass@host:port" \
npm run deploy:one
```

## Post-Deploy

### Verify Deployment
```bash
# Check API health
API_URL=$(gcloud run services describe wargo-api --region us-central1 --format 'value(status.url)')
curl -sS "$API_URL/api/health"

# View logs
gcloud run services logs read wargo-api --region us-central1 --limit 50
```

### Access Apps
- **API**: Cloud Run URL (check GCP Console or logs)
- **Rider**: `https://trusty-diorama-475905-c3--rider.web.app`
- **Driver**: `https://trusty-diorama-475905-c3--driver.web.app`
- **Admin**: `https://trusty-diorama-475905-c3--admin.web.app`

### Update CORS Origins
After first deploy, update `FRONTEND_ORIGIN` in `.env.deploy.local` with actual Firebase Hosting URLs, then redeploy.

## Troubleshooting

### Build fails
- Check: `gcloud auth list` (authenticated?)
- Enable Cloud Build API: `gcloud services enable cloudbuild.googleapis.com`

### Cloud Run deploy fails
- Verify service account JSON is valid base64
- Check DATABASE_URL is reachable from Cloud Run (public IP or Cloud SQL proxy)
- View logs: `gcloud run services logs read wargo-api --region us-central1`

### Frontend can't reach API
- Check CORS: `FRONTEND_ORIGIN` must include all hosting URLs
- Verify API is deployed: `gcloud run services list`
- Check cookies: ensure `COOKIE_SECURE=true` for HTTPS

### Rate limiting too strict
Adjust in `EcoRideConnect/server/index.ts`:
```typescript
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 })
```

## Custom Domain (Optional)

### Map Cloud Run to custom domain:
```bash
gcloud beta run domain-mappings create \
  --service wargo-api \
  --domain api.wargo.com \
  --region us-central1
```

### Map Firebase Hosting:
```bash
firebase hosting:channel:deploy production \
  --only rider \
  --project trusty-diorama-475905-c3
```

Then update DNS records as instructed by Firebase CLI.

## CI/CD (GitHub Actions)

Add secrets to repo:
- `GCP_PROJECT`
- `FIREBASE_PROJECT`
- `SESSION_SECRET`
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `REDIS_URL`
- `FRONTEND_ORIGIN`
- `GCP_SA_KEY` (service account JSON for GitHub Actions)

See `.github/workflows/deploy.yml` (TODO: create this).

---

**Project**: `trusty-diorama-475905-c3`  
**Region**: `us-central1` (change in `.env.deploy` if needed)
