#!/usr/bin/env bash
set -euo pipefail

# Firebase App Hosting start script for the API
# - Runs DB migrations (idempotent)
# - Starts the Express server on $PORT (provided by the platform)

export NODE_ENV="production"
: "${PORT:=8080}"

echo "[start] Running database migrations..."
npm run -s db:migrate

echo "[start] Launching API on port ${PORT}"
exec node dist/index.js
