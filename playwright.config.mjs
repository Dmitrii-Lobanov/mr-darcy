import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps/web/tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,

  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: [
    {
      command: 'npm run start:browser-test --workspace @mr-darcy/api',
      url: 'http://127.0.0.1:3101/api/sessions',
      reuseExistingServer: false,
      timeout: 60000,
      gracefulShutdown: {
        signal: 'SIGTERM',
        timeout: 5000,
      },
    },
    {
      command: 'npm run start --workspace @mr-darcy/web -- --port 3100',
      url: 'http://127.0.0.1:3100',
      env: {
        API_ORIGIN: 'http://127.0.0.1:3101',
      },
      reuseExistingServer: false,
      timeout: 60000,
      gracefulShutdown: {
        signal: 'SIGTERM',
        timeout: 5000,
      },
    },
  ],
});
