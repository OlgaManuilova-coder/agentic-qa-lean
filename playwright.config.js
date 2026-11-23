// Deterministic Playwright specs live in tests/. A CSV case is "promoted" to a spec once it is
// stable and cheap to script (Automation_Status = Automated, References = the spec file).
// Agents keep exploring; specs keep guarding. See docs/architecture.md §Promotion.

import { defineConfig, devices } from '@playwright/test';
import './config.js';

export default defineConfig({
  testDir: './tests',
  outputDir: './results/specs',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['junit', { outputFile: 'results/junit.xml' }], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.FRONT_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    testIdAttribute: 'data-test',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
