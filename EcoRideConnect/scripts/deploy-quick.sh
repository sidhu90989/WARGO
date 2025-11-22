#!/usr/bin/env bash
# Quick deploy wrapper that sources .env.deploy.local (if exists) and runs deploy-one.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -f .env.deploy.local ]]; then
  echo "Loading secrets from .env.deploy.local"
  source .env.deploy.local
elif [[ -f .env.deploy ]]; then
  echo "Loading defaults from .env.deploy"
  source .env.deploy
else
  echo "No .env.deploy or .env.deploy.local found. Copy .env.deploy to .env.deploy.local and fill secrets." >&2
  exit 1
fi

exec bash scripts/deploy-one.sh
