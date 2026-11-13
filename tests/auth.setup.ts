import { test as setup, expect } from '../src/fixtures/test';
import { STANDARD_USER_STATE, PROBLEM_USER_STATE } from '../src/fixtures/auth';
import { users, type User } from '../src/data/users';

// Each row: which demo user to log in as, and where to save that user's session.
const sessions: { user: User; path: string }[] = [
  { user: users.standard, path: STANDARD_USER_STATE },
  { user: users.problem, path: PROBLEM_USER_STATE },
];

// Runs once per `npx playwright test`, before any project that lists 'setup' in `dependencies`.
for (const { user, path } of sessions) {
  setup(`log in as ${user.username} and save the session`, async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(user);

    // Only save once login has really finished, or we'd save a half-logged-in state.
    await expect(inventoryPage.title).toHaveText('Products');

    // Writes cookies + localStorage of this browser context to a JSON file.
    await page.context().storageState({ path });
  });
}
