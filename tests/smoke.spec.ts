import { test, expect } from '@playwright/test';

// Phase 1 smoke test: proves the toolchain works end to end (config, baseURL, browser, assertions).
test('saucedemo login page loads', async ({ page }) => {
  // '/' is resolved against `baseURL` from playwright.config.ts.
  await page.goto('/');

  await expect(page).toHaveTitle('Swag Labs');
  // getByTestId reads the `data-test` attribute because of `testIdAttribute` in the config.
  await expect(page.getByTestId('login-button')).toBeVisible();
});
