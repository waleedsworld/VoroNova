import { defineConfig, devices } from '@playwright/test'

// Playwright e2e config for VoroNova.
// The suite runs against the real static export served by tests/static-server.mjs.
// In CI the export is built first (see .github/workflows/ci.yml); locally the
// webServer will (re)build if needed via the command below.
const PORT = Number(process.env.PORT) || 8189
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    // Use the bundled Chromium headless shell (matches the browser cached in CI/dev).
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node tests/static-server.mjs',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
