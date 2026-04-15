#!/usr/bin/env bash
set -euo pipefail
# Usage : depuis la racine du repo — bash scripts/e2e-with-docker.sh
# Prérequis : Docker, Node (npm/npx). Pas besoin de pnpm.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ">>> Démarrage Docker..."
docker compose up -d

echo ">>> Attente backend http://localhost:3001/health ..."
ok=0
for i in $(seq 1 45); do
  if curl -sf "http://localhost:3001/health" >/dev/null; then
    ok=1
    break
  fi
  sleep 2
done
if [[ "$ok" != "1" ]]; then
  echo "Backend injoignable." >&2
  exit 1
fi

echo ">>> Seed E2E..."
E2E_PASSWORD="${E2E_PASSWORD:-E2E_Test_Pass_1!}" docker compose exec -e E2E_PASSWORD backend node scripts/seedE2e.js

command -v npm >/dev/null || { echo "Installez Node.js (npm)." >&2; exit 1; }

echo ">>> npm install..."
npm install

echo ">>> Playwright Chromium..."
npx playwright install chromium

export E2E_SKIP_WEBSERVER=1
export E2E_BASE_URL="${E2E_BASE_URL:-http://localhost:3000}"
unset CI

echo ">>> Tests E2E..."
npx playwright test -c e2e/playwright.config.ts
