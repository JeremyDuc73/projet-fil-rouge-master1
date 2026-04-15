#Requires -Version 5
# Usage (depuis la racine du repo) : .\scripts\e2e-with-docker.ps1
# Prérequis : Docker Desktop, Node.js (npm/npx) — pas besoin de pnpm.
# La stack tourne dans Docker ; Playwright s'exécute sur Windows (navigateur = localhost).

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host ">>> Demarrage de la stack Docker (postgres, backend, frontend)..."
docker compose up -d

Write-Host ">>> Attente de l'API (http://localhost:3001/health)..."
$ok = $false
for ($i = 0; $i -lt 45; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { $ok = $true; break }
  } catch {}
  Start-Sleep -Seconds 2
}
if (-not $ok) {
  Write-Error "Le backend ne repond pas sur le port 3001. Verifiez docker compose ps et les logs."
  exit 1
}

Write-Host ">>> Seed des donnees E2E (utilisateurs + films de test)..."
docker compose exec -e "E2E_PASSWORD=E2E_Test_Pass_1!" backend node scripts/seedE2e.js
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "Installez Node.js LTS (https://nodejs.org) pour utiliser npm et npx."
  exit 1
}

Write-Host ">>> npm install a la racine du monorepo..."
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ">>> Playwright : installation Chromium..."
npx playwright install chromium
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$env:E2E_SKIP_WEBSERVER = "1"
$env:E2E_BASE_URL = "http://localhost:3000"
$env:CI = ""

Write-Host ">>> Tests E2E (stack externe, sans demarrer node dans Playwright)..."
npx playwright test -c e2e/playwright.config.ts
$exit = $LASTEXITCODE

Write-Host ">>> Rapport HTML : e2e\playwright-report\index.html (si genere)"
exit $exit
