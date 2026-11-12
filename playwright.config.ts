import { defineConfig, devices } from '@playwright/test';

// `process.env.CI` is set to "true" automatically by GitHub Actions.
const isCI = !!process.env.CI;

export default defineConfig({
  // Only files under ./tests are treated as tests. Page objects etc. live in ./src.
  testDir: './tests',

  // Tests inside a single file also run in parallel (default is: files in parallel, tests in a file serially).
  fullyParallel: true,

  // Fail the CI run if someone accidentally commits `test.only`.
  forbidOnly: isCI,

  // Retry only on CI, where network flakiness against public demo sites is more likely.
  retries: isCI ? 2 : 0,

  // `undefined` = Playwright picks based on CPU cores. On CI we keep it at 2 to be gentle with the public sites.
  workers: isCI ? 2 : undefined,

  // 'list' for readable terminal output, 'html' for the report we'll upload as a CI artifact.
  reporter: [['list'], ['html', { open: 'never' }]],

  // Defaults shared by every test (can be overridden per project or per test).
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    // saucedemo uses `data-test="..."` attributes, so getByTestId() should read that attribute.
    testIdAttribute: 'data-test',
    // Record a trace only when a test is retried after failing: cheap on green runs, rich on red ones.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
