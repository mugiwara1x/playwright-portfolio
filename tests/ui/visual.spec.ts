import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { InventoryPage } from '../../src/pages/InventoryPage';
import { users } from '../../src/data/users';
import { allProducts } from '../../src/data/products';

test.describe('Visual', () => {
  test('inventory page matches the approved screenshot', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard);

    // Make sure the page is fully rendered before comparing pixels.
    const inventory = new InventoryPage(page);
    await expect(inventory.items).toHaveCount(allProducts.length);

    // First run (or --update-snapshots) saves the baseline; later runs compare against it.
    await expect(page).toHaveScreenshot('inventory.png', {
      fullPage: true,
      // The footer shows the current year ("© 2026"); masking it stops the test breaking every January.
      mask: [page.getByTestId('footer-copy')],
    });
  });
});
