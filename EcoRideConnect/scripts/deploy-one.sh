#!/usr/bin/env bash
set -euo pipefail

# One-command deploy for API (Firebase Functions) + Frontends (Firebase Hosting)
# Required env vars (export before running or prefix in command):
#   FIREBASE_PROJECT       - Firebase project id
#   SESSION_SECRET         - strong random string
#   DATABASE_URL           - postgres connection string
#   STRIPE_SECRET_KEY      - Stripe secret key
#   FIREBASE_SERVICE_ACCOUNT_JSON - raw JSON or base64 JSON (recommended: base64)
#   FRONTEND_ORIGIN        - comma-separated allowed origins (rider,driver,admin URLs)
# Optional:
#   REDIS_URL              - Upstash/Redis url (for session store)
#   EXTRA_SET_ENV          - additional comma-separated key=val pairs

REQ=(FIREBASE_PROJECT SESSION_SECRET DATABASE_URL STRIPE_SECRET_KEY FIREBASE_SERVICE_ACCOUNT_JSON FRONTEND_ORIGIN)
for v in "${REQ[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo "Missing required env: $v" >&2
    exit 1
  fi
done

pushd "$(dirname "$0")/.." >/dev/null

echo "[1/4] Setting Firebase Functions environment variables"
firebase functions:config:set \
  app.session_secret="${SESSION_SECRET}" \
  app.database_url="${DATABASE_URL}" \
  app.stripe_secret="${STRIPE_SECRET_KEY}" \
  app.firebase_account="${FIREBASE_SERVICE_ACCOUNT_JSON}" \
  app.frontend_origin="${FRONTEND_ORIGIN}" \
  app.firebase_db_url="${FIREBASE_DATABASE_URL:-}" \
  app.redis_url="${REDIS_URL:-}" \
  --project "${FIREBASE_PROJECT}"

echo "[2/4] Building API bundle for Firebase Functions"
npm run build

API_URL="https://${FIREBASE_PROJECT}.web.app/api"

echo "[3/4] Building frontends with VITE_API_URL=${API_URL}"
VITE_API_URL="${API_URL}" VITE_SIMPLE_AUTH=false npm run build:rider
VITE_API_URL="${API_URL}" VITE_SIMPLE_AUTH=false npm run build:driver
VITE_API_URL="${API_URL}" VITE_SIMPLE_AUTH=false npm run build:admin

echo "[4/4] Deploying to Firebase (Functions + Hosting)"
firebase deploy --project "${FIREBASE_PROJECT}"

echo "✅ Deployment complete!"
echo "API: ${API_URL}"
echo "Rider: https://${FIREBASE_PROJECT}--rider.web.app"
echo "Driver: https://${FIREBASE_PROJECT}--driver.web.app"
echo "Admin: https://${FIREBASE_PROJECT}--admin.web.app"

popd >/dev/null
