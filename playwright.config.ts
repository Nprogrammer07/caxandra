import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  // No corras E2E junto a los tests unitarios de Vitest.
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry', // guarda un "video de pasos" si un test falla
  },
  // Playwright arranca tu app solo antes de los tests y la apaga al terminar.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})