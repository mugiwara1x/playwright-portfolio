import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { InventoryPage } from '../../src/pages/InventoryPage';
import { users, invalidLogins } from '../../src/data/users';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('standard user can log in and sees the products page', async ({ page }) => {
    await loginPage.login(users.standard);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(new InventoryPage(page).title).toHaveText('Products');
  });

  // Data-driven: one generated test per row in `invalidLogins` (src/data/users.ts).
  for (const { scenario, user, error } of invalidLogins) {
    test(`shows an error for ${scenario}`, async ({ page }) => {
      await loginPage.login(user);

      await expect(loginPage.errorMessage).toHaveText(error);
      await expect(page).not.toHaveURL(/inventory/);
    });
  }

  test('blocks direct access to the inventory without a session', async ({ page }) => {
    await page.goto('/inventory.html');

    await expect(loginPage.errorMessage).toHaveText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    );
  });

  test('logging out ends the session', async ({ page }) => {
    await loginPage.login(users.standard);
    await new InventoryPage(page).header.logout();

    await expect(loginPage.loginButton).toBeVisible();

    // The session really is gone: going back to a protected page is refused.
    await page.goto('/inventory.html');
    await expect(loginPage.errorMessage).toContainText('when you are logged in');
  });
});
