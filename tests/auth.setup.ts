import { test as setup, expect } from '../src/fixtures/test';
import { STANDARD_USER_STATE } from '../src/fixtures/auth';
import { users } from '../src/data/users';

// Runs once per `npx playwright test`, before any project that lists 'setup' in `dependencies`.
setup('log in as standard_user and save the session', async ({ page, loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.login(users.standard);

  // Only save once login has really finished, or we'd save a half-logged-in state.
  await expect(inventoryPage.title).toHaveText('Products');

  // Writes cookies + localStorage of this browser context to a JSON file.
  await page.context().storageState({ path: STANDARD_USER_STATE });
});
