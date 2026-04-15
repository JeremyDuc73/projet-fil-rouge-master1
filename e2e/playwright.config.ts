import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(root, '..')

const backendEnv = {
  NODE_ENV: 'test',
  PORT: '3001',
  DB_HOST: process.env.DB_HOST ?? '127.0.0.1',
  DB_PORT: process.env.DB_PORT ?? '5432',
  DB_NAME: process.env.DB_NAME ?? 'cinezone_test',
  DB_USER: process.env.DB_USER ?? 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD ?? 'postgres',
  JWT_SECRET: process.env.JWT_SECRET ?? 'e2e_jwt_secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'e2e_refresh_secret',
  E2E_PASSWORD: process.env.E2E_PASSWORD ?? 'E2E_Test_Pass_1!',
}

/** Même host que CORS par défaut du backend (localhost:3000), pas 127.0.0.1 — sinon Origin bloquée. */
const frontendEnv = {
  NUXT_PUBLIC_API_BASE: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api',
  NUXT_PUBLIC_API_URL: process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:3001',
}

/** Stack déjà démarrée (ex. docker compose) : pas de webServer intégré */
const useExternalStack = process.env.E2E_SKIP_WEBSERVER === '1'

const webServers = useExternalStack
  ? undefined
  : [
      {
        command: 'node src/server.js',
        cwd: path.join(repoRoot, 'apps/backend'),
        url: 'http://localhost:3001/health',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: { ...process.env, ...backendEnv },
      },
      {
        command: 'pnpm run preview:e2e',
        cwd: path.join(repoRoot, 'apps/frontend'),
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        env: { ...process.env, ...frontendEnv },
      },
    ]

export default defineConfig({
  testDir: path.join(root, 'tests'),
  outputDir: path.join(root, 'test-results'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: path.join(root, 'playwright-report'), open: 'never' }]]
    : [['list'], ['html', { outputFolder: path.join(root, 'playwright-report'), open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    locale: 'fr-FR',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: webServers,
})
